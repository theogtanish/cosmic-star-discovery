/**
 * @fileoverview In-memory cache wrapper around node-cache.
 * Provides get/set/has helpers with a configurable TTL.
 */

import NodeCache from 'node-cache';
import { DEFAULT_CACHE_TTL } from '../constants.js';

const ttl = parseInt(process.env.CACHE_TTL_SECONDS, 10) || DEFAULT_CACHE_TTL;

const cache = new NodeCache({
  stdTTL: ttl,
  checkperiod: Math.floor(ttl / 4),
  useClones: true,
});

/**
 * Retrieve a value from the cache.
 * @param {string} key - Cache key.
 * @returns {*|undefined} The cached value, or undefined on miss.
 */
export function cacheGet(key) {
  return cache.get(key);
}

/**
 * Store a value in the cache.
 * @param {string} key   - Cache key.
 * @param {*}      value - Value to cache (will be cloned).
 * @param {number} [customTtl] - Optional override TTL in seconds.
 */
export function cacheSet(key, value, customTtl) {
  if (customTtl !== undefined) {
    cache.set(key, value, customTtl);
  } else {
    cache.set(key, value);
  }
}

/**
 * Check whether a key exists in the cache.
 * @param {string} key
 * @returns {boolean}
 */
export function cacheHas(key) {
  return cache.has(key);
}

/**
 * Flush the entire cache.
 */
export function cacheFlush() {
  cache.flushAll();
}
