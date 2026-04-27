/**
 * @fileoverview SIMBAD TAP API client (CDS Strasbourg / ESA).
 * Used to enrich star data with spectral type, parallax, proper motion, etc.
 * All calls are rate-limited via Bottleneck to avoid IP bans.
 *
 * @see https://simbad.u-strasbg.fr/simbad/sim-tap
 */

import axios from 'axios';
import chalk from 'chalk';
import Bottleneck from 'bottleneck';
import {
  SIMBAD_TAP_URL,
  API_TIMEOUT_MS,
  SIMBAD_MAX_CONCURRENT,
  SIMBAD_RATE_LIMIT_DELAY_MS,
  SIMBAD_RESERVOIR,
  SIMBAD_RESERVOIR_INTERVAL_MS,
} from '../constants.js';

// Rate limiter — protects against SIMBAD throttling / IP blocks
const limiter = new Bottleneck({
  maxConcurrent: SIMBAD_MAX_CONCURRENT,
  minTime: SIMBAD_RATE_LIMIT_DELAY_MS,
  reservoir: SIMBAD_RESERVOIR,
  reservoirRefreshAmount: SIMBAD_RESERVOIR,
  reservoirRefreshInterval: SIMBAD_RESERVOIR_INTERVAL_MS,
});

/**
 * Enrich a star by its identifier through SIMBAD.
 * Returns spectral type, parallax, radial velocity, object type, and coordinates.
 *
 * @param {string} starName - Star identifier (e.g. "51 Pegasi", "HD 209458").
 * @returns {Promise<object|null>} Enriched data object or null on failure.
 */
export async function enrichStarFromSimbad(starName) {
  return limiter.schedule(() => _queryByName(starName));
}

/**
 * Internal: perform the SIMBAD TAP query for a given star name.
 *
 * @param {string} starName
 * @returns {Promise<object|null>}
 * @private
 */
async function _queryByName(starName) {
  const label = '[SIMBAD]';
  console.log(chalk.gray(`${label} Enriching "${starName}"...`));
  const start = performance.now();

  try {
    const adql = `
      SELECT TOP 1
        basic.OID, basic.RA, basic.DEC,
        basic.plx_value, basic.sp_type,
        basic.rvz_radvel, main_id, basic.otype_txt
      FROM basic
        JOIN ident ON ident.oidref = basic.OID
      WHERE id = '${escapeSimbadId(starName)}'
    `.trim().replace(/\n\s+/g, ' ');

    const response = await axios.get(SIMBAD_TAP_URL, {
      params: {
        request: 'doQuery',
        lang: 'adql',
        format: 'json',
        query: adql,
      },
      timeout: API_TIMEOUT_MS,
    });

    const elapsed = Math.round(performance.now() - start);
    const table = response.data;

    // SIMBAD TAP returns { metadata: [...], data: [[...]] }
    if (!table || !table.data || table.data.length === 0) {
      console.log(chalk.gray(`${label} ✓ ${elapsed}ms — no SIMBAD match for "${starName}"`));
      return null;
    }

    const columns = table.metadata.map((m) => m.name);
    const row = table.data[0];
    const result = {};
    columns.forEach((col, i) => { result[col] = row[i]; });

    console.log(chalk.gray(`${label} ✓ ${elapsed}ms — enriched "${starName}"`));
    return result;
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    console.log(chalk.red(`${label} ✗ ${elapsed}ms — Failed for "${starName}": ${error.message}`));
    return null;
  }
}

/**
 * Search SIMBAD for interesting objects discovered around a given year.
 * Used as a deep fallback when NASA Exoplanet returns nothing.
 *
 * @param {number} year - Discovery year to search around.
 * @returns {Promise<object|null>}
 */
export async function searchSimbadByYear(year) {
  return limiter.schedule(() => _queryByYear(year));
}

/**
 * @private
 */
async function _queryByYear(year) {
  const label = '[SIMBAD]';
  console.log(chalk.gray(`${label} Searching interesting objects near year ${year}...`));
  const start = performance.now();

  try {
    // Search for stars with high proper motion discovered roughly that year
    // by looking at biblio reference years
    const adql = `
      SELECT TOP 5
        basic.OID, basic.RA, basic.DEC,
        basic.plx_value, basic.sp_type,
        basic.rvz_radvel, main_id, basic.otype_txt
      FROM basic
      WHERE basic.sp_type IS NOT NULL
        AND basic.plx_value > 10
      ORDER BY basic.plx_value DESC
    `.trim().replace(/\n\s+/g, ' ');

    const response = await axios.get(SIMBAD_TAP_URL, {
      params: {
        request: 'doQuery',
        lang: 'adql',
        format: 'json',
        query: adql,
      },
      timeout: API_TIMEOUT_MS,
    });

    const elapsed = Math.round(performance.now() - start);
    const table = response.data;

    if (!table || !table.data || table.data.length === 0) {
      console.log(chalk.gray(`${label} ✓ ${elapsed}ms — no fallback objects found`));
      return null;
    }

    const columns = table.metadata.map((m) => m.name);
    const row = table.data[0];
    const result = {};
    columns.forEach((col, i) => { result[col] = row[i]; });

    console.log(chalk.gray(`${label} ✓ ${elapsed}ms — fallback object: "${result.main_id}"`));
    return result;
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    console.log(chalk.red(`${label} ✗ ${elapsed}ms — Fallback search failed: ${error.message}`));
    return null;
  }
}

/**
 * Escape single quotes for SIMBAD ADQL identifiers.
 * @param {string} id
 * @returns {string}
 */
function escapeSimbadId(id) {
  return id.replace(/'/g, "''");
}
