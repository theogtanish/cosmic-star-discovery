/**
 * @fileoverview NASA Exoplanet Archive TAP API client.
 * Queries confirmed exoplanets by discovery publication date.
 *
 * @see https://exoplanetarchive.ipac.caltech.edu/docs/TAP/usingTAP.html
 */

import axios from 'axios';
import chalk from 'chalk';
import { NASA_EXOPLANET_BASE_URL, API_TIMEOUT_MS } from '../constants.js';

/**
 * Query the NASA Exoplanet Archive for planets discovered in a given month.
 *
 * @param {string} yearMonth - YYYY-MM format string (e.g. "1995-07").
 * @returns {Promise<Array|null>} Array of exoplanet objects or null on failure.
 */
export async function queryExoplanets(yearMonth) {
  const label = '[NASA Exoplanet]';
  console.log(chalk.gray(`${label} Querying exoplanet archive for ${yearMonth}...`));
  const start = performance.now();

  try {
    const adql = `
      SELECT pl_name, hostname, disc_pubdate, disc_year, ra, dec,
             sy_dist, st_teff, st_rad, st_mass, st_age, disc_telescope, disc_facility
      FROM ps
      WHERE disc_pubdate LIKE '${yearMonth}%'
      ORDER BY disc_pubdate ASC
    `.trim().replace(/\n\s+/g, ' ');

    const response = await axios.get(NASA_EXOPLANET_BASE_URL, {
      params: {
        query: adql,
        format: 'json',
      },
      timeout: API_TIMEOUT_MS,
    });

    const elapsed = Math.round(performance.now() - start);
    const data = response.data;

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log(chalk.gray(`${label} ✓ ${elapsed}ms — no results for ${yearMonth}`));
      return [];
    }

    console.log(chalk.gray(`${label} ✓ ${elapsed}ms — ${data.length} exoplanet(s) found`));
    return data;
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    console.log(chalk.red(`${label} ✗ ${elapsed}ms — Failed: ${error.message}`));
    return null;
  }
}

/**
 * Search across multiple month offsets for exoplanets.
 * Used by the fallback chain to widen the search window.
 *
 * @param {string} yearMonth - Original YYYY-MM.
 * @param {number} expandMonths - Number of months to expand on each side.
 * @returns {Promise<Array|null>}
 */
export async function queryExoplanetsExpanded(yearMonth, expandMonths = 1) {
  const [yearStr, monthStr] = yearMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);

  const months = [];
  for (let offset = -expandMonths; offset <= expandMonths; offset++) {
    let m = month + offset;
    let y = year;
    if (m < 1) { m += 12; y -= 1; }
    if (m > 12) { m -= 12; y += 1; }
    months.push(`${y}-${String(m).padStart(2, '0')}`);
  }

  for (const ym of months) {
    const result = await queryExoplanets(ym);
    if (result && result.length > 0) return result;
  }

  return [];
}

/**
 * Query by discovery year only (broader search).
 *
 * @param {number} year
 * @returns {Promise<Array|null>}
 */
export async function queryExoplanetsByYear(year) {
  const label = '[NASA Exoplanet]';
  console.log(chalk.gray(`${label} Broadening search to entire year ${year}...`));
  const start = performance.now();

  try {
    const adql = `
      SELECT pl_name, hostname, disc_pubdate, disc_year, ra, dec,
             sy_dist, st_teff, st_rad, st_mass, st_age, disc_telescope, disc_facility
      FROM ps
      WHERE disc_year = ${year}
      ORDER BY disc_pubdate ASC
    `.trim().replace(/\n\s+/g, ' ');

    const response = await axios.get(NASA_EXOPLANET_BASE_URL, {
      params: { query: adql, format: 'json' },
      timeout: API_TIMEOUT_MS,
    });

    const elapsed = Math.round(performance.now() - start);
    const data = response.data;

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log(chalk.gray(`${label} ✓ ${elapsed}ms — no results for year ${year}`));
      return [];
    }

    console.log(chalk.gray(`${label} ✓ ${elapsed}ms — ${data.length} exoplanet(s) in year ${year}`));
    return data;
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    console.log(chalk.red(`${label} ✗ ${elapsed}ms — Failed: ${error.message}`));
    return null;
  }
}
