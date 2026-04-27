/**
 * @fileoverview JPL Small-Body Database (SBDB) Query API client.
 * Primary source for asteroid/minor-planet discovery data.
 * Falls back from MPC to JPL because JPL is more reliably available.
 *
 * @see https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html
 */

import axios from 'axios';
import chalk from 'chalk';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { JPL_SBDB_QUERY_URL, API_TIMEOUT_MS } from '../constants.js';

/**
 * Query the JPL Small-Body Database for asteroids/comets discovered in a given month.
 *
 * @param {Date}   date      - The reference date.
 * @param {string} yearMonth - "YYYY-MM" format.
 * @returns {Promise<Array|null>} Array of minor-planet objects or null on failure.
 */
export async function queryAsteroids(date, yearMonth) {
  const label = '[JPL Asteroids]';
  const monthStart = format(startOfMonth(date), 'yyyy-MM-dd');
  const monthEnd = format(endOfMonth(date), 'yyyy-MM-dd');
  console.log(chalk.gray(`${label} Querying JPL SBDB for ${monthStart} → ${monthEnd}...`));
  const start = performance.now();

  try {
    const response = await axios.get(JPL_SBDB_QUERY_URL, {
      params: {
        fields: 'spkid,full_name,kind,neo,pha,class,first_obs,condition_code',
        'sb-cdata': JSON.stringify({
          AND: [
            `first_obs|GE|${monthStart}`,
            `first_obs|LE|${monthEnd}`,
          ],
        }),
        'sb-kind': 'a',  // asteroids
        limit: '20',
      },
      timeout: API_TIMEOUT_MS,
    });

    const elapsed = Math.round(performance.now() - start);
    const body = response.data;

    if (!body || !body.data || body.data.length === 0) {
      console.log(chalk.gray(`${label} ✓ ${elapsed}ms — no asteroids for ${yearMonth}`));
      return [];
    }

    const fields = body.fields;
    const results = body.data.map((row) => {
      const obj = {};
      fields.forEach((f, i) => { obj[f] = row[i]; });
      return obj;
    });

    console.log(chalk.gray(`${label} ✓ ${elapsed}ms — ${results.length} asteroid(s) found`));
    return results;
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    console.log(chalk.red(`${label} ✗ ${elapsed}ms — Failed: ${error.message}`));
    return null;
  }
}

/**
 * Broaden asteroid search to the full year if the month search was empty.
 *
 * @param {Date} date - Reference date.
 * @returns {Promise<Array|null>}
 */
export async function queryAsteroidsByYear(date) {
  const label = '[JPL Asteroids]';
  const yearStart = format(startOfYear(date), 'yyyy-MM-dd');
  const yearEnd = format(endOfYear(date), 'yyyy-MM-dd');
  const year = date.getUTCFullYear();
  console.log(chalk.gray(`${label} Broadening to entire year ${year}...`));
  const start = performance.now();

  try {
    const response = await axios.get(JPL_SBDB_QUERY_URL, {
      params: {
        fields: 'spkid,full_name,kind,neo,pha,class,first_obs,condition_code',
        'sb-cdata': JSON.stringify({
          AND: [
            `first_obs|GE|${yearStart}`,
            `first_obs|LE|${yearEnd}`,
          ],
        }),
        'sb-kind': 'a',
        limit: '10',
      },
      timeout: API_TIMEOUT_MS,
    });

    const elapsed = Math.round(performance.now() - start);
    const body = response.data;

    if (!body || !body.data || body.data.length === 0) {
      console.log(chalk.gray(`${label} ✓ ${elapsed}ms — no asteroids in year ${year}`));
      return [];
    }

    const fields = body.fields;
    const results = body.data.map((row) => {
      const obj = {};
      fields.forEach((f, i) => { obj[f] = row[i]; });
      return obj;
    });

    console.log(chalk.gray(`${label} ✓ ${elapsed}ms — ${results.length} asteroid(s) in year ${year}`));
    return results;
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    console.log(chalk.red(`${label} ✗ ${elapsed}ms — Failed: ${error.message}`));
    return null;
  }
}
