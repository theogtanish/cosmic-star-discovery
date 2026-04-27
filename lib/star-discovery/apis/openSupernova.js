/**
 * @fileoverview Curated supernova database — replaces the unreliable Astrocats API.
 * Contains ~50 real, famous supernovae covering every year from 1985–2023.
 * Lookup is by year/month with graceful closest-match fallback.
 */

import chalk from 'chalk';

/**
 * Curated database of famous supernovae, sourced from IAU records.
 * Every entry is a real, documented supernova event.
 */
const SUPERNOVAE = [
  // ── 1980s ─────────────────────────────────────────────────────────────────
  { name: 'SN 1885A', year: 1885, month: 8, type: 'I Pec', host: 'Andromeda Galaxy (M31)', magnitude: 5.8, distance: '2.5 million light-years', note: 'First extragalactic supernova ever recorded' },
  { name: 'SN 1983N', year: 1983, month: 7, type: 'Ib', host: 'M83 Southern Pinwheel', magnitude: 11.5, distance: '15 million light-years', note: 'Helped define the Type Ib class' },
  { name: 'SN 1985F', year: 1985, month: 3, type: 'Ib/c', host: 'NGC 4618', magnitude: 11.8, distance: '25 million light-years', note: 'Key object in stripped-envelope supernova research' },
  { name: 'SN 1986G', year: 1986, month: 5, type: 'Ia Pec', host: 'NGC 5128 (Centaurus A)', magnitude: 11.4, distance: '13 million light-years', note: 'Peculiar Type Ia in famous radio galaxy' },
  { name: 'SN 1987A', year: 1987, month: 2, type: 'II', host: 'Large Magellanic Cloud', magnitude: 2.9, distance: '168,000 light-years', note: 'Closest supernova since 1604' },
  { name: 'SN 1988A', year: 1988, month: 1, type: 'II', host: 'M58', magnitude: 13.5, distance: '68 million light-years', note: 'Well-studied Type II plateau supernova' },
  { name: 'SN 1989B', year: 1989, month: 1, type: 'Ia', host: 'NGC 3627 (M66)', magnitude: 12.2, distance: '36 million light-years', note: 'Important calibrator for Type Ia distances' },

  // ── 1990s ─────────────────────────────────────────────────────────────────
  { name: 'SN 1990N', year: 1990, month: 7, type: 'Ia', host: 'NGC 4639', magnitude: 12.7, distance: '72 million light-years', note: 'Helped calibrate the cosmic distance ladder' },
  { name: 'SN 1991T', year: 1991, month: 4, type: 'Ia Pec', host: 'NGC 4527', magnitude: 11.5, distance: '55 million light-years', note: 'Prototype of overluminous Type Ia supernovae' },
  { name: 'SN 1991bg', year: 1991, month: 12, type: 'Ia Pec', host: 'NGC 4374 (M84)', magnitude: 14.0, distance: '60 million light-years', note: 'Prototype of subluminous Type Ia supernovae' },
  { name: 'SN 1992A', year: 1992, month: 1, type: 'Ia', host: 'NGC 1380', magnitude: 12.6, distance: '66 million light-years', note: 'One of best-observed early CCD-era supernovae' },
  { name: 'SN 1993J', year: 1993, month: 3, type: 'IIb', host: 'M81 Galaxy', magnitude: 10.8, distance: '11.7 million light-years', note: 'Second brightest in modern times' },
  { name: 'SN 1994D', year: 1994, month: 3, type: 'Ia', host: 'NGC 4526', magnitude: 11.8, distance: '55 million light-years', note: "Hubble's most photographed supernova" },
  { name: 'SN 1994I', year: 1994, month: 4, type: 'Ic', host: 'M51 Whirlpool Galaxy', magnitude: 12.9, distance: '23 million light-years', note: 'Prototype stripped-envelope core collapse in iconic galaxy' },
  { name: 'SN 1995al', year: 1995, month: 11, type: 'Ia', host: 'NGC 3021', magnitude: 13.0, distance: '92 million light-years', note: 'Used to refine Hubble constant measurement' },
  { name: 'SN 1996cb', year: 1996, month: 12, type: 'IIb', host: 'NGC 3510', magnitude: 13.5, distance: '46 million light-years', note: 'Textbook hydrogen envelope stripping case' },
  { name: 'SN 1997ef', year: 1997, month: 11, type: 'Ic-BL', host: 'UGC 4107', magnitude: 17.0, distance: '180 million light-years', note: 'Broad-lined Ic, possible hypernova candidate' },
  { name: 'SN 1998bw', year: 1998, month: 4, type: 'Ic-BL', host: 'ESO 184-G82', magnitude: 13.8, distance: '140 million light-years', note: 'First supernova linked to gamma-ray burst' },
  { name: 'SN 1998S', year: 1998, month: 3, type: 'IIn', host: 'NGC 3877', magnitude: 11.7, distance: '49 million light-years', note: 'Spectacular interaction with circumstellar medium' },
  { name: 'SN 1999em', year: 1999, month: 10, type: 'II-P', host: 'NGC 1637', magnitude: 12.5, distance: '26 million light-years', note: 'Most observed Type II-P ever' },

  // ── 2000s ─────────────────────────────────────────────────────────────────
  { name: 'SN 2000cx', year: 2000, month: 7, type: 'Ia Pec', host: 'NGC 524', magnitude: 13.0, distance: '80 million light-years', note: 'Unusually bright and fast-declining peculiar Ia' },
  { name: 'SN 2001el', year: 2001, month: 9, type: 'Ia', host: 'NGC 1448', magnitude: 12.8, distance: '56 million light-years', note: 'First detection of high-velocity calcium features' },
  { name: 'SN 2002ap', year: 2002, month: 1, type: 'Ic-BL', host: 'M74', magnitude: 12.3, distance: '30 million light-years', note: 'Nearest broad-lined Ic in a decade' },
  { name: 'SN 2003fg', year: 2003, month: 9, type: 'Ia', host: 'Anonymous', magnitude: 17.5, distance: '4 billion light-years', note: 'The "Champagne Supernova" — exceeded Chandrasekhar mass limit' },
  { name: 'SN 2004dj', year: 2004, month: 7, type: 'II-P', host: 'NGC 2403', magnitude: 11.2, distance: '10 million light-years', note: 'Youngest progenitor ever identified' },
  { name: 'SN 2004et', year: 2004, month: 9, type: 'II-P', host: 'NGC 6946', magnitude: 12.0, distance: '22 million light-years', note: 'Progenitor confirmed as red supergiant' },
  { name: 'SN 2005cs', year: 2005, month: 6, type: 'II-P', host: 'M51 Whirlpool Galaxy', magnitude: 14.0, distance: '23 million light-years', note: 'Progenitor star identified in Hubble archives' },
  { name: 'SN 2005gj', year: 2005, month: 9, type: 'Ia/IIn', host: 'Anonymous', magnitude: 16.3, distance: '850 million light-years', note: 'Rare hybrid showing both Ia and IIn features' },
  { name: 'SN 2006gy', year: 2006, month: 9, type: 'IIn', host: 'NGC 1260', magnitude: 15.2, distance: '250 million light-years', note: 'Brightest supernova ever recorded at the time' },
  { name: 'SN 2007bi', year: 2007, month: 4, type: 'Ic', host: 'Anonymous dwarf galaxy', magnitude: 18.3, distance: '1.5 billion light-years', note: 'First confirmed pair-instability supernova' },
  { name: 'SN 2008D', year: 2008, month: 1, type: 'Ib', host: 'NGC 2770', magnitude: 17.0, distance: '88 million light-years', note: 'First supernova caught in X-ray at moment of shock breakout' },
  { name: 'SN 2008ha', year: 2008, month: 11, type: 'Iax', host: 'UGC 12682', magnitude: 17.7, distance: '69 million light-years', note: 'Prototype of the faint Type Iax class' },
  { name: 'SN 2009ip', year: 2009, month: 8, type: 'IIn', host: 'NGC 7259', magnitude: 17.8, distance: '73 million light-years', note: 'Supernova impostor that eventually exploded for real in 2012' },
  { name: 'SN 2009kf', year: 2009, month: 10, type: 'II-P', host: 'Anonymous', magnitude: 17.0, distance: '600 million light-years', note: 'One of the most luminous Type II ever recorded' },

  // ── 2010s ─────────────────────────────────────────────────────────────────
  { name: 'SN 2010jl', year: 2010, month: 11, type: 'IIn', host: 'UGC 5189A', magnitude: 12.9, distance: '160 million light-years', note: 'Extremely luminous, studied for dust formation' },
  { name: 'SN 2011fe', year: 2011, month: 8, type: 'Ia', host: 'M101 Pinwheel Galaxy', magnitude: 9.9, distance: '21 million light-years', note: 'Brightest Type Ia in 25 years' },
  { name: 'SN 2012aw', year: 2012, month: 3, type: 'II-P', host: 'M95', magnitude: 12.6, distance: '33 million light-years', note: 'Bright supernova visible in Leo Triplet' },
  { name: 'SN 2013ej', year: 2013, month: 7, type: 'II-L', host: 'M74', magnitude: 12.4, distance: '30 million light-years', note: 'Rare Type II-L with linear light curve decline' },
  { name: 'SN 2014J', year: 2014, month: 1, type: 'Ia', host: 'M82 Cigar Galaxy', magnitude: 10.5, distance: '11.4 million light-years', note: 'Closest Type Ia in decades' },
  { name: 'SN 2015F', year: 2015, month: 3, type: 'Ia', host: 'NGC 2442', magnitude: 13.0, distance: '50 million light-years', note: 'Well-observed normal Ia in southern skies' },
  { name: 'SN 2016bkv', year: 2016, month: 3, type: 'IIn', host: 'NGC 3184', magnitude: 14.5, distance: '40 million light-years', note: 'Showed signs of pre-explosion mass loss' },
  { name: 'SN 2017eaw', year: 2017, month: 5, type: 'II-P', host: 'NGC 6946', magnitude: 12.0, distance: '22 million light-years', note: 'Visible in amateur telescopes for months' },
  { name: 'SN 2018gv', year: 2018, month: 1, type: 'Ia', host: 'NGC 2525', magnitude: 12.7, distance: '70 million light-years', note: 'Captured in Hubble time-lapse video' },
  { name: 'SN 2019ehk', year: 2019, month: 4, type: 'Ca-rich Ib', host: 'M100', magnitude: 15.7, distance: '55 million light-years', note: 'Rare calcium-rich transient in Virgo Cluster' },

  // ── 2020s ─────────────────────────────────────────────────────────────────
  { name: 'SN 2020jfo', year: 2020, month: 5, type: 'II-P', host: 'M61', magnitude: 13.0, distance: '52 million light-years', note: 'Caught within hours of explosion' },
  { name: 'SN 2021aefx', year: 2021, month: 11, type: 'Ia', host: 'NGC 1566', magnitude: 12.0, distance: '40 million light-years', note: 'JWST calibration target, extremely well-observed' },
  { name: 'SN 2022acko', year: 2022, month: 12, type: 'II-P', host: 'NGC 1300', magnitude: 14.0, distance: '61 million light-years', note: 'Discovered in iconic barred spiral galaxy' },
  { name: 'SN 2023ixf', year: 2023, month: 5, type: 'II', host: 'M101 Pinwheel Galaxy', magnitude: 11.0, distance: '21 million light-years', note: 'Closest supernova in a decade, amateur discovery' },
];

/**
 * Find a supernova for the given date.
 * Strategy:
 *   1. Exact year + month match
 *   2. Same year, pick the brightest (lowest magnitude)
 *   3. Closest year, pick the brightest
 *   Always returns something.
 *
 * @param {Date} date - The reference date.
 * @returns {Promise<object|null>} Supernova object shaped for the cross-reference engine.
 */
export async function querySupernovae(date) {
  const label = '[Supernova DB]';
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;

  console.log(chalk.gray(`${label} Searching curated database for ${year}-${String(month).padStart(2, '0')}...`));
  const start = performance.now();

  // Step 1: Exact year + month
  let matches = SUPERNOVAE.filter((sn) => sn.year === year && sn.month === month);

  // Step 2: Same year, pick brightest
  if (matches.length === 0) {
    matches = SUPERNOVAE.filter((sn) => sn.year === year);
  }

  // Step 3: Closest year, pick brightest
  if (matches.length === 0) {
    const sorted = [...SUPERNOVAE].sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year));
    matches = sorted.slice(0, 3);
  }

  // Sort by magnitude (brightest = lowest) and pick the best
  matches.sort((a, b) => a.magnitude - b.magnitude);
  const best = matches[0];

  const elapsed = Math.round(performance.now() - start);

  if (!best) {
    console.log(chalk.gray(`${label} ✓ ${elapsed}ms — no match (unexpected)`));
    return null;
  }

  const result = {
    name: best.name,
    discoverdate: `${best.year}/${String(best.month).padStart(2, '0')}`,
    claimedtype: best.type,
    host: best.host,
    maxappmag: String(best.magnitude),
    redshift: null,
    distance: best.distance,
    note: best.note,
  };

  const matchType = (best.year === year && best.month === month)
    ? 'exact match'
    : best.year === year
      ? 'same year'
      : `nearest (${best.year})`;

  console.log(chalk.gray(`${label} ✓ ${elapsed}ms — ${best.name} (${matchType})`));
  return [result];
}
