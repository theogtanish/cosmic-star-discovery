/**
 * @fileoverview Central constants for the Star Discovery application.
 * All API base URLs, configuration values, and magic numbers live here.
 */

// ─── API Base URLs ──────────────────────────────────────────────────────────────

/** NASA Exoplanet Archive TAP Sync endpoint */
export const NASA_EXOPLANET_BASE_URL = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

/** Open Supernova Catalog (Astrocats) base endpoint */
export const OPEN_SUPERNOVA_BASE_URL = 'https://api.astrocats.space';

/** JPL Small-Body Database Query API */
export const JPL_SBDB_QUERY_URL = 'https://ssd-api.jpl.nasa.gov/sbdb_query.api';

/** SIMBAD TAP Sync endpoint (CDS Strasbourg) */
export const SIMBAD_TAP_URL = 'https://simbad.u-strasbg.fr/simbad/sim-tap/sync';

/** NASA Astronomy Picture of the Day endpoint */
export const NASA_APOD_URL = 'https://api.nasa.gov/planetary/apod';

/** Hubble archive fallback for pre-APOD dates */
export const HUBBLE_ARCHIVE_URL = 'https://hubblesite.org/api/v3/image';

// ─── Timeouts & Retry ───────────────────────────────────────────────────────────

/** Default HTTP request timeout in milliseconds */
export const API_TIMEOUT_MS = 8_000;

/** SIMBAD rate-limit delay between requests in milliseconds */
export const SIMBAD_RATE_LIMIT_DELAY_MS = 500;

/** Maximum concurrent SIMBAD requests (Bottleneck) */
export const SIMBAD_MAX_CONCURRENT = 1;

/** Bottleneck reservoir for SIMBAD: max requests per interval */
export const SIMBAD_RESERVOIR = 10;

/** Bottleneck reservoir refresh interval (ms) */
export const SIMBAD_RESERVOIR_INTERVAL_MS = 5000;

// ─── Cache ──────────────────────────────────────────────────────────────────────

/** Default cache TTL in seconds (24 hours) */
export const DEFAULT_CACHE_TTL = 86_400;

// ─── Fallback Ranges ────────────────────────────────────────────────────────────

/** How many months to expand on each side for exoplanet fallback */
export const EXOPLANET_MONTH_EXPAND = 1;

/** How many months to expand on each side for supernova fallback */
export const SUPERNOVA_MONTH_EXPAND = 3;

/** Whether to broaden asteroid search to full year if month is empty */
export const ASTEROID_YEAR_FALLBACK = true;

// ─── APOD Boundary ─────────────────────────────────────────────────────────────

/** APOD service start date (June 16, 1995) */
export const APOD_START_DATE = '1995-06-16';

// ─── Display ────────────────────────────────────────────────────────────────────

/** Parsec to light-year conversion factor */
export const PARSEC_TO_LY = 3.26156;

// ─── Hardcoded Fallback Star ────────────────────────────────────────────────────

/** Orion Nebula stellar nursery fallback data */
export const ORION_NEBULA_FALLBACK = {
  name: 'Orion Nebula Stellar Nursery',
  hostStar: 'Theta-1 Orionis C (Trapezium Cluster)',
  discoveredDate: 'Ongoing — billions of years',
  telescope: 'Observable with naked eye',
  constellation: 'Orion',
  distance: {
    lightyears: 1344,
    parsecs: 412,
    source: 'Fallback',
  },
  temperature: 39_000,
  radius: 10.6,
  mass: 33,
  age: 0.0003, // ~300,000 years (very young)
  spectralType: 'O6Vp',
  coordinates: { ra: 83.8221, dec: -5.3911 },
};
