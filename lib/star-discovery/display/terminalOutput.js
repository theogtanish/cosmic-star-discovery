/**
 * @fileoverview Beautiful terminal output using chalk, boxen, and cli-table3.
 * This module only formats — it receives the final object, it does not compute.
 */

import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';
import { format, parseISO } from 'date-fns';

/**
 * Render the full discovery result to the terminal.
 *
 * @param {object}  result     - The unified result object.
 * @param {number}  queryTimeMs - Total query time in milliseconds.
 * @param {boolean} fromCache  - Whether the result came from cache.
 */
export function renderResult(result, queryTimeMs, fromCache = false) {
  const dateDisplay = formatDateLong(result.queryDate);

  // ── Header Box ────────────────────────────────────────────────────────────
  const headerText = [
    chalk.yellow.bold('✦  WHAT THE UNIVERSE DISCOVERED ON YOUR DAY  ✦'),
    chalk.white.bold(dateDisplay),
  ].join('\n');

  console.log('\n' + boxen(headerText, {
    padding: 1,
    margin: { top: 0, bottom: 0, left: 2, right: 2 },
    borderStyle: 'double',
    borderColor: 'yellow',
    textAlignment: 'center',
  }));

  // ── Star Section ──────────────────────────────────────────────────────────
  if (result.primaryStar) {
    renderStarSection(result.primaryStar);
  }

  // ── Supernova Section ─────────────────────────────────────────────────────
  if (result.supernova) {
    renderSupernovaSection(result.supernova);
  }

  // ── Asteroid Section ──────────────────────────────────────────────────────
  if (result.asteroid) {
    renderAsteroidSection(result.asteroid);
  }

  // ── APOD Section ──────────────────────────────────────────────────────────
  if (result.apodImage) {
    renderApodSection(result.apodImage);
  }

  // ── Narrative Section ─────────────────────────────────────────────────────
  if (result.narrative) {
    renderNarrativeSection(result.narrative);
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  renderFooter(result, queryTimeMs, fromCache);
}

/**
 * Render the primary star section.
 * @param {object} star
 */
function renderStarSection(star) {
  console.log('\n  ' + chalk.yellow.bold('🌟  YOUR STAR'));
  console.log('  ' + chalk.gray('─'.repeat(60)));

  const rows = [
    ['Name', `${star.hostStar}${star.name !== star.hostStar ? ` (host of ${star.name})` : ''}`],
    ['Discovered', formatDiscovery(star.discoveredDate)],
    ['Distance', star.distance?.lightyears
      ? `${star.distance.lightyears.toLocaleString()} light-years (source: ${star.distance.source})`
      : 'Unknown'],
    ['Type', star.spectralType || 'Unknown spectral type'],
    ['Temperature', star.temperature ? `${star.temperature.toLocaleString()} K` : 'Unknown'],
    ['Radius', star.radius ? `${star.radius} solar radii` : 'Unknown'],
    ['Mass', star.mass ? `${star.mass} solar masses` : 'Unknown'],
    ['Age', star.age ? `~${star.age} billion years` : 'Unknown'],
    ['Constellation', star.constellation || 'Unknown'],
    ['Telescope', star.telescope || 'Unknown'],
  ];

  for (const [key, value] of rows) {
    const paddedKey = key.padEnd(14);
    console.log(`  ${chalk.gray(paddedKey)} ${chalk.white.bold(value)}`);
  }
}

/**
 * Render the supernova section.
 * @param {object} sn
 */
function renderSupernovaSection(sn) {
  console.log('\n  ' + chalk.red.bold('💥  A STAR ALSO DIED'));
  console.log('  ' + chalk.gray('─'.repeat(60)));

  const rows = [
    ['Name', sn.name],
    ['Type', `Type ${sn.type} supernova`],
    ['Host Galaxy', sn.hostGalaxy],
    ['Discovered', sn.discoveredDate || 'Unknown'],
    ['Magnitude', sn.magnitude != null ? String(sn.magnitude) : 'Unknown'],
    ['Distance', sn.distance || 'Unknown'],
  ];
  if (sn.note) rows.push(['Note', sn.note]);

  for (const [key, value] of rows) {
    const paddedKey = key.padEnd(14);
    console.log(`  ${chalk.gray(paddedKey)} ${chalk.white.bold(value)}`);
  }
}

/**
 * Render the asteroid section.
 * @param {object} ast
 */
function renderAsteroidSection(ast) {
  console.log('\n  ' + chalk.green.bold('🪨  YOUR ASTEROID'));
  console.log('  ' + chalk.gray('─'.repeat(60)));

  const rows = [
    ['Designation', ast.designation],
    ['Name', ast.name || '(unnamed)'],
    ['Orbit Type', ast.orbitType],
    ['Discovered', ast.discoveryDate || 'Unknown'],
  ];

  for (const [key, value] of rows) {
    const paddedKey = key.padEnd(14);
    console.log(`  ${chalk.gray(paddedKey)} ${chalk.white.bold(value)}`);
  }
}

/**
 * Render the APOD image section.
 * @param {object} apod
 */
function renderApodSection(apod) {
  console.log('\n  ' + chalk.blue.bold("📸  NASA'S SKY THAT DAY"));
  console.log('  ' + chalk.gray('─'.repeat(60)));

  const rows = [
    ['Title', `"${apod.title}"`],
    ['Type', apod.mediaType === 'video' ? 'Video' : `Image`],
  ];

  if (apod.hdUrl) rows.push(['HD Image', apod.hdUrl]);
  else if (apod.url) rows.push(['URL', apod.url]);

  for (const [key, value] of rows) {
    const paddedKey = key.padEnd(14);
    console.log(`  ${chalk.gray(paddedKey)} ${chalk.white.bold(value)}`);
  }
}

/**
 * Render the poetic narrative section.
 * @param {string} narrative
 */
function renderNarrativeSection(narrative) {
  console.log('\n  ' + chalk.magenta.bold('✍   YOUR COSMIC STORY'));
  console.log('  ' + chalk.gray('─'.repeat(60)));

  // Word-wrap narrative to ~70 chars and indent
  const wrapped = wordWrap(narrative, 68);
  for (const line of wrapped.split('\n')) {
    console.log(`  ${chalk.cyan(line)}`);
  }
}

/**
 * Render the footer with data quality and timing info.
 * @param {object}  result
 * @param {number}  queryTimeMs
 * @param {boolean} fromCache
 */
function renderFooter(result, queryTimeMs, fromCache) {
  console.log('\n  ' + chalk.gray('─'.repeat(60)));

  const quality = result.dataQuality === 'full'
    ? chalk.green.bold('FULL')
    : result.dataQuality === 'partial'
    ? chalk.yellow.bold('PARTIAL')
    : chalk.red.bold('FALLBACK');

  const sources = `${result.sourcesResponded || 0}/${result.totalSources || 5} APIs responded`;
  const cached = fromCache ? chalk.green('Yes') : chalk.gray('No');
  const time = fromCache
    ? chalk.green(`${queryTimeMs}ms`)
    : chalk.white(`${(queryTimeMs / 1000).toFixed(1)}s`);

  const fallback = result.fallbackUsed
    ? chalk.yellow(` | Fallback: ${result.fallbackRange}`)
    : '';

  console.log(`  Data Quality: ${quality}  |  Sources: ${sources}`);
  console.log(`  Cached: ${cached}  |  Query time: ${time}${fallback}`);
  console.log('  ' + chalk.gray('─'.repeat(60)) + '\n');
}

/**
 * Format a date string into long form for the header.
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {string}
 */
function formatDateLong(dateStr) {
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Format a discovery date for display.
 * @param {string} d
 * @returns {string}
 */
function formatDiscovery(d) {
  if (!d) return 'Unknown';
  if (/^\d{4}-\d{2}$/.test(d)) {
    try {
      return format(parseISO(`${d}-01`), 'MMMM yyyy');
    } catch {
      return d;
    }
  }
  return d;
}

/**
 * Simple word-wrap utility.
 * @param {string} text
 * @param {number} maxWidth
 * @returns {string}
 */
function wordWrap(text, maxWidth) {
  const paragraphs = text.split('\n\n');
  return paragraphs.map((para) => {
    const words = para.replace(/\n/g, ' ').split(/\s+/);
    const lines = [];
    let current = '';
    for (const word of words) {
      if ((current + ' ' + word).trim().length > maxWidth) {
        lines.push(current.trim());
        current = word;
      } else {
        current = current ? current + ' ' + word : word;
      }
    }
    if (current.trim()) lines.push(current.trim());
    return lines.join('\n');
  }).join('\n\n');
}
