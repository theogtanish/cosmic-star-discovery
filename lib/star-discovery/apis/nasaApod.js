/**
 * @fileoverview NASA Astronomy Picture of the Day (APOD) API client.
 * Falls back to Hubble archive for dates before APOD existed (pre June 16 1995).
 * If the configured API key fails (403), retries with DEMO_KEY automatically.
 *
 * @see https://api.nasa.gov/
 */

import axios from 'axios';
import chalk from 'chalk';
import { isAfter, parseISO } from 'date-fns';
import { NASA_APOD_URL, HUBBLE_ARCHIVE_URL, API_TIMEOUT_MS, APOD_START_DATE } from '../constants.js';

/** The free NASA demo key — always works but has a 30 req/hour limit */
const FALLBACK_KEY = 'DEMO_KEY';

/**
 * Fetch the APOD entry for a specific date.
 * If the date is before APOD coverage, falls back to the Hubble archive.
 *
 * @param {string} dateStr - "YYYY-MM-DD" formatted date.
 * @returns {Promise<object|null>} APOD data or null on failure.
 */
export async function queryApod(dateStr) {
  const label = '[NASA APOD]';
  const parsedDate = parseISO(dateStr);
  const apodStart = parseISO(APOD_START_DATE);

  // If the date is before APOD started, use Hubble archive
  if (!isAfter(parsedDate, apodStart) && dateStr !== APOD_START_DATE) {
    return queryHubbleFallback(dateStr);
  }

  const configuredKey = process.env.NASA_API_KEY || FALLBACK_KEY;

  // Try with the configured key first
  const result = await _fetchApod(dateStr, configuredKey, label);
  if (result !== 'RETRY') return result;

  // If the configured key returned 403 and it wasn't already DEMO_KEY, retry
  if (configuredKey !== FALLBACK_KEY) {
    console.log(chalk.yellow(`${label} API key rejected — retrying with DEMO_KEY...`));
    const retryResult = await _fetchApod(dateStr, FALLBACK_KEY, label);
    if (retryResult !== 'RETRY') return retryResult;
  }

  return null;
}

/**
 * Internal: fetch APOD with a specific API key.
 * Returns the result object, null on non-retryable failure, or 'RETRY' on 403.
 *
 * @param {string} dateStr
 * @param {string} apiKey
 * @param {string} label
 * @returns {Promise<object|null|'RETRY'>}
 * @private
 */
async function _fetchApod(dateStr, apiKey, label) {
  console.log(chalk.gray(`${label} Fetching APOD for ${dateStr}...`));
  const start = performance.now();

  try {
    const response = await axios.get(NASA_APOD_URL, {
      params: {
        date: dateStr,
        api_key: apiKey,
      },
      timeout: API_TIMEOUT_MS,
    });

    const elapsed = Math.round(performance.now() - start);
    const data = response.data;

    if (!data || !data.title) {
      console.log(chalk.gray(`${label} ✓ ${elapsed}ms — no APOD data`));
      return null;
    }

    // Handle video media type
    const isVideo = data.media_type === 'video';
    const result = {
      title: data.title,
      url: isVideo ? (data.thumbnail_url || data.url) : data.url,
      hdUrl: data.hdurl || null,
      explanation: data.explanation || '',
      mediaType: data.media_type || 'image',
      date: data.date,
    };

    console.log(chalk.gray(`${label} ✓ ${elapsed}ms — "${data.title}" (${data.media_type})`));
    return result;
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    const status = error.response?.status;

    // 403 = bad API key → signal the caller to retry
    if (status === 403) {
      console.log(chalk.red(`${label} ✗ ${elapsed}ms — 403 Forbidden (invalid API key)`));
      return 'RETRY';
    }

    console.log(chalk.red(`${label} ✗ ${elapsed}ms — Failed: ${error.message}`));
    return null;
  }
}

/**
 * Fallback: fetch a random Hubble archive image for pre-APOD dates.
 *
 * @param {string} dateStr - The original requested date.
 * @returns {Promise<object|null>}
 */
async function queryHubbleFallback(dateStr) {
  const label = '[Hubble Archive]';
  console.log(chalk.gray(`${label} Date ${dateStr} is before APOD — using Hubble fallback...`));
  const start = performance.now();

  try {
    const response = await axios.get(HUBBLE_ARCHIVE_URL, {
      params: {
        page: 1,
        per_page: 1,
      },
      timeout: API_TIMEOUT_MS,
    });

    const elapsed = Math.round(performance.now() - start);
    const data = response.data;

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log(chalk.gray(`${label} ✓ ${elapsed}ms — no Hubble images found`));
      return null;
    }

    const img = data[0];
    const result = {
      title: img.name || 'Hubble Space Telescope Image',
      url: img.image_files?.[0]?.file_url || null,
      hdUrl: img.image_files?.[0]?.file_url || null,
      explanation: img.description || 'An image from the Hubble Space Telescope archive.',
      mediaType: 'image',
      date: dateStr,
      source: 'Hubble Archive',
    };

    console.log(chalk.gray(`${label} ✓ ${elapsed}ms — Hubble image: "${result.title}"`));
    return result;
  } catch (error) {
    const elapsed = Math.round(performance.now() - start);
    console.log(chalk.red(`${label} ✗ ${elapsed}ms — Hubble fallback failed: ${error.message}`));
    return null;
  }
}
