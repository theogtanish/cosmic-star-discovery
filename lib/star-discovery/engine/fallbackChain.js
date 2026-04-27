/**
 * @fileoverview Fallback chain — ensures the system never returns empty results.
 * Progressively widens searches when exact-date queries come back empty.
 */

import chalk from 'chalk';
import { queryExoplanetsExpanded, queryExoplanetsByYear } from '../apis/nasaExoplanet.js';
import { queryAsteroidsByYear } from '../apis/minorPlanet.js';
import { searchSimbadByYear } from '../apis/simbad.js';
import { crossReference } from './crossReference.js';
import { ORION_NEBULA_FALLBACK, EXOPLANET_MONTH_EXPAND } from '../constants.js';

/**
 * Apply the fallback chain to a cross-referenced result.
 * Progressively widens search windows until data is found.
 *
 * @param {object} result    - The initial cross-referenced result (may have nulls).
 * @param {object} rawResults - The raw API results from queryAll.
 * @param {Date}   date      - Parsed Date object.
 * @param {string} dateStr   - "YYYY-MM-DD".
 * @param {string} yearMonth - "YYYY-MM".
 * @returns {Promise<object>} The enriched result with fallbacks applied.
 */
export async function applyFallbackChain(result, rawResults, date, dateStr, yearMonth) {
  const year = date.getUTCFullYear();
  let fallbackUsed = false;
  let fallbackRange = null;

  // ── Exoplanet Fallback ────────────────────────────────────────────────────
  if (!result.primaryStar) {
    console.log(chalk.yellow('\n🔄 No exoplanet found — expanding search...\n'));

    // Try ±1 month
    const expanded = await queryExoplanetsExpanded(yearMonth, EXOPLANET_MONTH_EXPAND);
    if (expanded && expanded.length > 0) {
      rawResults.exoplanets = expanded;
      fallbackUsed = true;
      fallbackRange = `±${EXOPLANET_MONTH_EXPAND} month(s)`;
      console.log(chalk.yellow(`[Fallback] Found exoplanet within ${fallbackRange}`));
    } else {
      // Try entire year
      const yearResult = await queryExoplanetsByYear(year);
      if (yearResult && yearResult.length > 0) {
        rawResults.exoplanets = yearResult;
        fallbackUsed = true;
        fallbackRange = `year ${year}`;
        console.log(chalk.yellow(`[Fallback] Found exoplanet in year ${year}`));
      } else {
        // Try SIMBAD fallback
        const simbadFallback = await searchSimbadByYear(year);
        if (simbadFallback) {
          result.primaryStar = buildSimbadFallbackStar(simbadFallback);
          fallbackUsed = true;
          fallbackRange = 'SIMBAD nearby stars';
          console.log(chalk.yellow(`[Fallback] Using SIMBAD object: ${result.primaryStar.hostStar}`));
        } else {
          // Ultimate fallback — Orion Nebula
          result.primaryStar = { ...ORION_NEBULA_FALLBACK };
          fallbackUsed = true;
          fallbackRange = 'stellar nursery fallback';
          console.log(chalk.yellow('[Fallback] Using Orion Nebula stellar nursery fallback'));
        }
      }
    }

    // Re-cross-reference if we got new exoplanet data and still don't have a star
    if (rawResults.exoplanets && rawResults.exoplanets.length > 0 && !result.primaryStar) {
      const refreshed = await crossReference(rawResults, dateStr, yearMonth);
      result.primaryStar = refreshed.primaryStar;
      result.sourcesResponded = refreshed.sourcesResponded;
      // Keep previously found supernova/asteroid/apod if the refreshed ones are empty
      if (refreshed.supernova) result.supernova = refreshed.supernova;
      if (refreshed.asteroid) result.asteroid = refreshed.asteroid;
      if (refreshed.apodImage) result.apodImage = refreshed.apodImage;
    }

    // ── Update data quality based on what we actually ended up with ──────────
    if (result.primaryStar) {
      // We found a real star (even if via expanded search) → 'partial'
      result.dataQuality = 'partial';
    } else {
      // Truly nothing found → 'fallback'
      result.dataQuality = 'fallback';
    }
  }

  // ── Supernova — the curated DB always returns something, no fallback needed ─
  // (supernova is already populated from queryAll → crossReference because the
  //  curated database always returns a result. This section only fires if it
  //  was somehow null.)
  // No expansion loop needed — the curated querySupernovae already does
  // closest-year fallback internally.

  // ── Asteroid Fallback ─────────────────────────────────────────────────────
  if (!result.asteroid) {
    console.log(chalk.gray('[Fallback] No asteroid — broadening to full year...'));
    const yearAsteroids = await queryAsteroidsByYear(date);
    if (yearAsteroids && yearAsteroids.length > 0) {
      const top = yearAsteroids[0];
      result.asteroid = {
        designation: top.full_name?.trim() || top.spkid || 'Unknown',
        name: null,
        orbitType: top.class || 'Unknown orbit type',
        discoveryDate: top.first_obs || `${year}`,
      };
      fallbackUsed = true;
      console.log(chalk.gray(`[Fallback] Found asteroid ${result.asteroid.designation} in year ${year}`));
    }
  }

  result.fallbackUsed = fallbackUsed;
  result.fallbackRange = fallbackRange;

  return result;
}

/**
 * Build a primaryStar-shaped object from a SIMBAD fallback result.
 * @param {object} simbadData
 * @returns {object}
 */
function buildSimbadFallbackStar(simbadData) {
  const plx = simbadData.plx_value;
  let parsecs = null;
  let ly = null;
  if (plx && plx > 0) {
    parsecs = +(1000 / plx).toFixed(2);
    ly = +(parsecs * 3.26156).toFixed(1);
  }

  return {
    name: simbadData.main_id || 'Unknown',
    hostStar: simbadData.main_id || 'Unknown',
    discoveredDate: 'Historical',
    telescope: 'Multiple observatories',
    constellation: null,
    distance: {
      lightyears: ly,
      parsecs: parsecs,
      source: 'SIMBAD',
    },
    temperature: null,
    radius: null,
    mass: null,
    age: null,
    spectralType: simbadData.sp_type?.trim() || null,
    coordinates: {
      ra: simbadData.ra || null,
      dec: simbadData.dec || null,
    },
  };
}
