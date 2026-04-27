/**
 * @fileoverview Orchestrator that fires all 5 API queries concurrently.
 * Returns a raw results object for the cross-reference engine to process.
 */

import chalk from 'chalk';
import { format } from 'date-fns';
import { queryExoplanets } from '../apis/nasaExoplanet.js';
import { querySupernovae } from '../apis/openSupernova.js';
import { queryAsteroids } from '../apis/minorPlanet.js';
import { queryApod } from '../apis/nasaApod.js';

/**
 * Fire all 5 API queries in parallel via Promise.allSettled.
 * Never throws — every individual failure is captured gracefully.
 *
 * @param {Date}   date      - Parsed Date object (UTC).
 * @param {string} dateStr   - "YYYY-MM-DD" string.
 * @param {string} yearMonth - "YYYY-MM" string.
 * @returns {Promise<object>} Raw results keyed by source name.
 */
export async function queryAll(date, dateStr, yearMonth) {
  console.log(chalk.cyan('\n⚡ Querying 5 astronomical databases simultaneously...\n'));
  const overallStart = performance.now();

  const [exoplanetResult, supernovaResult, asteroidResult, apodResult] =
    await Promise.allSettled([
      queryExoplanets(yearMonth),
      querySupernovae(date),
      queryAsteroids(date, yearMonth),
      queryApod(dateStr),
    ]);

  const overallElapsed = Math.round(performance.now() - overallStart);
  console.log(chalk.cyan(`\n⚡ All initial queries completed in ${overallElapsed}ms\n`));

  return {
    exoplanets: unwrapSettled(exoplanetResult),
    supernovae: unwrapSettled(supernovaResult),
    asteroids: unwrapSettled(asteroidResult),
    apod: unwrapSettled(apodResult),
    queryTimeMs: overallElapsed,
  };
}

/**
 * Safely unwrap a Promise.allSettled result.
 * @param {PromiseSettledResult} settled
 * @returns {*} The fulfilled value, or null if rejected.
 */
function unwrapSettled(settled) {
  if (settled.status === 'fulfilled') return settled.value;
  console.log(chalk.red(`[QueryAll] Promise rejected: ${settled.reason?.message}`));
  return null;
}
