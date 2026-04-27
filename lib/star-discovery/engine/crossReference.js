/**
 * @fileoverview Cross-reference engine — the heart of Star Discovery.
 * Merges raw results from all APIs into a single unified result object,
 * enriches the primary star via SIMBAD, and ranks by priority.
 */

import chalk from 'chalk';
import { enrichStarFromSimbad } from '../apis/simbad.js';
import { PARSEC_TO_LY } from '../constants.js';

/**
 * Merge and rank results from all 5 APIs into a unified output object.
 *
 * @param {object} raw       - Raw results from queryAll().
 * @param {string} dateStr   - "YYYY-MM-DD".
 * @param {string} yearMonth - "YYYY-MM".
 * @returns {Promise<object>} Unified result object.
 */
export async function crossReference(raw, dateStr, yearMonth) {
  console.log(chalk.cyan('🔗 Cross-referencing results...\n'));

  let sourcesResponded = 0;

  // ── Step 1: Primary Star (NASA Exoplanet) ─────────────────────────────────
  let primaryStar = null;
  const exoplanets = raw.exoplanets;

  if (exoplanets && Array.isArray(exoplanets) && exoplanets.length > 0) {
    sourcesResponded++;
    const top = exoplanets[0];
    primaryStar = buildPrimaryStar(top);
    console.log(chalk.gray(`[CrossRef] Primary star: ${primaryStar.hostStar} (host of ${primaryStar.name})`));

    // ── Steps 2–4: SIMBAD Enrichment ────────────────────────────────────────
    const simbadData = await enrichStarFromSimbad(primaryStar.hostStar);
    if (simbadData) {
      sourcesResponded++;
      applySimbadEnrichment(primaryStar, simbadData);
      console.log(chalk.gray(
        `[CrossRef] SIMBAD enriched: spectral=${primaryStar.spectralType}, parallax=${simbadData.plx_value}`
      ));
    }
  }

  // ── Step 5: Supernova ─────────────────────────────────────────────────────
  let supernova = null;
  if (raw.supernovae && Array.isArray(raw.supernovae) && raw.supernovae.length > 0) {
    sourcesResponded++;
    const top = raw.supernovae[0];
    supernova = {
      name: top.name || 'Unknown',
      discoveredDate: top.discoverdate || yearMonth,
      type: top.claimedtype || 'Unknown',
      hostGalaxy: top.host || 'Unknown host galaxy',
      magnitude: top.maxappmag ? parseFloat(top.maxappmag) : null,
      distance: top.distance || (top.redshift ? `z = ${top.redshift}` : 'Unknown'),
      note: top.note || null,
    };
    console.log(chalk.gray(`[CrossRef] Supernova: ${supernova.name} (Type ${supernova.type})`));
  }

  // ── Step 6: Asteroid ──────────────────────────────────────────────────────
  let asteroid = null;
  if (raw.asteroids && Array.isArray(raw.asteroids) && raw.asteroids.length > 0) {
    sourcesResponded++;
    const top = raw.asteroids[0];
    asteroid = {
      designation: top.full_name?.trim() || top.spkid || 'Unknown',
      name: extractAsteroidName(top.full_name),
      orbitType: mapOrbitClass(top.class),
      discoveryDate: top.first_obs || yearMonth,
    };
    console.log(chalk.gray(`[CrossRef] Asteroid: ${asteroid.designation} (${asteroid.orbitType})`));
  }

  // ── Step 7: APOD Image ───────────────────────────────────────────────────
  let apodImage = null;
  if (raw.apod) {
    sourcesResponded++;
    apodImage = {
      title: raw.apod.title,
      url: raw.apod.url || '',
      hdUrl: raw.apod.hdUrl || '',
      explanation: raw.apod.explanation || '',
      mediaType: raw.apod.mediaType || 'image',
    };
    console.log(chalk.gray(`[CrossRef] APOD: "${apodImage.title}"`));
  }

  // ── Determine data quality ────────────────────────────────────────────────
  let dataQuality = 'full';
  if (!primaryStar) dataQuality = 'fallback';
  else if (sourcesResponded < 3) dataQuality = 'partial';

  const result = {
    queryDate: dateStr,
    searchMonth: yearMonth,
    primaryStar,
    supernova,
    asteroid,
    apodImage,
    narrative: '',
    dataQuality,
    sourcesResponded,
    totalSources: 5,
    fallbackUsed: false,
    fallbackRange: null,
  };

  console.log(chalk.gray(`[CrossRef] Data quality: ${dataQuality} (${sourcesResponded}/5 sources)\n`));
  return result;
}

// ─── Helper functions ───────────────────────────────────────────────────────

function buildPrimaryStar(row) {
  const distParsecs = row.sy_dist || null;
  const distLY = distParsecs ? +(distParsecs * PARSEC_TO_LY).toFixed(1) : null;

  return {
    name: row.pl_name || 'Unknown Planet',
    hostStar: row.hostname || 'Unknown Star',
    discoveredDate: row.disc_pubdate || `${row.disc_year}` || 'Unknown',
    telescope: row.disc_telescope || row.disc_facility || 'Unknown',
    constellation: deriveConstellation(row.ra, row.dec),
    distance: { lightyears: distLY, parsecs: distParsecs, source: 'NASA' },
    temperature: row.st_teff || null,
    radius: row.st_rad || null,
    mass: row.st_mass || null,
    age: row.st_age || null,
    spectralType: null,
    coordinates: { ra: row.ra || null, dec: row.dec || null },
  };
}

function applySimbadEnrichment(star, simbadData) {
  if (simbadData.sp_type) {
    star.spectralType = simbadData.sp_type.trim();
  }
  if (simbadData.plx_value && simbadData.plx_value > 0) {
    const parsecs = 1000 / simbadData.plx_value;
    const ly = +(parsecs * PARSEC_TO_LY).toFixed(1);
    if (!star.distance.lightyears || star.distance.source === 'NASA') {
      star.distance = { lightyears: ly, parsecs: +parsecs.toFixed(2), source: 'SIMBAD' };
    }
  }
  if (simbadData.ra != null && simbadData.dec != null) {
    star.coordinates = { ra: simbadData.ra, dec: simbadData.dec };
    star.constellation = deriveConstellation(simbadData.ra, simbadData.dec);
  }

  // Estimate missing properties from spectral type
  if (star.spectralType) {
    const estimates = estimateFromSpectralType(star.spectralType);
    if (estimates) {
      if (!star.radius) star.radius = estimates.radius;
      if (!star.mass) star.mass = estimates.mass;
      if (!star.age) star.age = estimates.age;
      if (!star.temperature) star.temperature = estimates.temperature;
    }
  }
}

/**
 * Estimate stellar properties from spectral type when NASA data is missing.
 * Uses standard main-sequence stellar parameters from astrophysics tables.
 *
 * @param {string} spectralType - e.g. "G2V", "K5III", "F8V"
 * @returns {object|null} { radius, mass, age, temperature }
 */
function estimateFromSpectralType(spectralType) {
  if (!spectralType) return null;

  // Extract the letter class (first character)
  const classChar = spectralType.charAt(0).toUpperCase();

  // Main-sequence typical values by spectral class
  // Values: [radius (solar), mass (solar), age (Gyr), temperature (K)]
  const mainSequence = {
    O: { radius: 12,   mass: 30,    age: 0.005, temperature: 35_000 },
    B: { radius: 5,    mass: 8,     age: 0.05,  temperature: 20_000 },
    A: { radius: 1.8,  mass: 2.1,   age: 1.0,   temperature: 8_500 },
    F: { radius: 1.3,  mass: 1.4,   age: 3.0,   temperature: 6_700 },
    G: { radius: 1.05, mass: 1.05,  age: 5.5,   temperature: 5_800 },
    K: { radius: 0.8,  mass: 0.75,  age: 8.0,   temperature: 4_500 },
    M: { radius: 0.4,  mass: 0.35,  age: 10.0,  temperature: 3_300 },
  };

  const estimate = mainSequence[classChar];
  if (!estimate) return null;

  // Refine by subclass digit if present (0-9, where 0 is hotter)
  const subMatch = spectralType.match(/^[OBAFGKM](\d)/i);
  if (subMatch) {
    const sub = parseInt(subMatch[1], 10);
    // Interpolate slightly within the class based on subclass
    const factor = 1 - (sub - 5) * 0.03; // small adjustment
    return {
      radius: +(estimate.radius * factor).toFixed(2),
      mass: +(estimate.mass * factor).toFixed(2),
      age: +estimate.age.toFixed(1),
      temperature: Math.round(estimate.temperature * factor),
    };
  }

  return estimate;
}

function deriveConstellation(ra, dec) {
  if (ra == null || dec == null) return null;
  const raH = ra / 15;
  const constellations = [
    { name: 'Pegasus', raMin: 21, raMax: 24, decMin: 2, decMax: 36 },
    { name: 'Andromeda', raMin: 0, raMax: 2, decMin: 21, decMax: 53 },
    { name: 'Orion', raMin: 5, raMax: 6.5, decMin: -11, decMax: 23 },
    { name: 'Cygnus', raMin: 19, raMax: 22, decMin: 27, decMax: 61 },
    { name: 'Lyra', raMin: 18, raMax: 19.5, decMin: 25, decMax: 48 },
    { name: 'Sagittarius', raMin: 17.5, raMax: 20, decMin: -45, decMax: -12 },
    { name: 'Scorpius', raMin: 15.5, raMax: 17.5, decMin: -45, decMax: -8 },
    { name: 'Leo', raMin: 9.5, raMax: 12, decMin: -6, decMax: 33 },
    { name: 'Virgo', raMin: 11.5, raMax: 15, decMin: -22, decMax: 14 },
    { name: 'Aquarius', raMin: 20.5, raMax: 23.5, decMin: -25, decMax: 3 },
    { name: 'Pisces', raMin: 23, raMax: 24, decMin: -6, decMax: 33 },
    { name: 'Taurus', raMin: 3.5, raMax: 6, decMin: 0, decMax: 31 },
    { name: 'Gemini', raMin: 6, raMax: 8, decMin: 10, decMax: 35 },
    { name: 'Cancer', raMin: 8, raMax: 9.5, decMin: 7, decMax: 33 },
    { name: 'Aries', raMin: 1.5, raMax: 3.5, decMin: 10, decMax: 31 },
    { name: 'Capricornus', raMin: 20, raMax: 21.5, decMin: -28, decMax: -8 },
    { name: 'Libra', raMin: 14.5, raMax: 16, decMin: -30, decMax: 0 },
    { name: 'Centaurus', raMin: 11, raMax: 15, decMin: -64, decMax: -30 },
    { name: 'Ursa Major', raMin: 8, raMax: 14, decMin: 28, decMax: 73 },
    { name: 'Cassiopeia', raMin: 22, raMax: 24, decMin: 46, decMax: 77 },
    { name: 'Canis Major', raMin: 6, raMax: 7.5, decMin: -33, decMax: -11 },
    { name: 'Draco', raMin: 9, raMax: 21, decMin: 47, decMax: 86 },
    { name: 'Boötes', raMin: 13.5, raMax: 15.5, decMin: 7, decMax: 55 },
    { name: 'Ophiuchus', raMin: 16, raMax: 18, decMin: -30, decMax: 14 },
    { name: 'Hercules', raMin: 16, raMax: 18.5, decMin: 14, decMax: 51 },
    { name: 'Aquila', raMin: 18.5, raMax: 20.5, decMin: -12, decMax: 18 },
    { name: 'Pisces', raMin: 0, raMax: 2, decMin: -6, decMax: 33 },
    { name: 'Puppis', raMin: 6, raMax: 8.5, decMin: -51, decMax: -11 },
  ];
  for (const c of constellations) {
    if (raH >= c.raMin && raH < c.raMax && dec >= c.decMin && dec < c.decMax) return c.name;
  }
  return null;
}

function extractAsteroidName(fullName) {
  if (!fullName) return null;
  const match = fullName.trim().match(/^\d+\s+([A-Z][a-zA-Z]+)/);
  return match ? match[1] : null;
}

function mapOrbitClass(cls) {
  const map = {
    AMO: 'Amor (Near-Earth)', APO: 'Apollo (Near-Earth)',
    ATE: 'Aten (Near-Earth)', IEO: 'Atira (Interior Near-Earth)',
    MBA: 'Main Belt Asteroid', MCA: 'Mars-Crossing Asteroid',
    OMB: 'Outer Main Belt', TJN: 'Jupiter Trojan',
    CEN: 'Centaur', TNO: 'Trans-Neptunian Object',
    COM: 'Comet', JFC: 'Jupiter-Family Comet',
    HTC: 'Halley-Type Comet',
  };
  return map[cls] || cls || 'Unknown orbit type';
}
