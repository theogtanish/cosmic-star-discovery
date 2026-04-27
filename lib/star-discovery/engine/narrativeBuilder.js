/**
 * @fileoverview Narrative builder — generates a poetic 3-paragraph story
 * from the unified result object. Pure template literals, no AI API needed.
 */

import { format, parseISO } from 'date-fns';

/**
 * Build a poetic narrative from the discovery result.
 *
 * @param {object} data - The unified result object from crossReference.
 * @returns {string} A 3-paragraph narrative string.
 */
export function buildNarrative(data) {
  if (!data.primaryStar) {
    return narratives.empty(data);
  }

  // Any real star — whether found on exact date or via fallback expansion —
  // gets the rich personal narrative. Only a truly empty result gets the
  // generic fallback text.
  return narratives.withExoplanet(data);
}

/**
 * Format a date string into a beautiful long-form date.
 * @param {string} dateStr - "YYYY-MM-DD"
 * @returns {string}
 */
function formatDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'MMMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Format a discovery date that might be YYYY-MM or YYYY.
 * @param {string} d
 * @returns {string}
 */
function formatDiscoveryDate(d) {
  if (!d) return 'an unknown date';
  if (/^\d{4}-\d{2}$/.test(d)) {
    try {
      return format(parseISO(`${d}-01`), 'MMMM yyyy');
    } catch {
      return d;
    }
  }
  return d;
}

const narratives = {
  /**
   * Full narrative with exoplanet data.
   */
  withExoplanet: (data) => {
    const star = data.primaryStar;
    const ageText = star.age
      ? `${Math.round(star.age * 1000)} million years`
      : 'billions of years';
    const distText = star.distance?.lightyears
      ? `${star.distance.lightyears.toLocaleString()} light-years`
      : 'an immeasurable distance';
    const constText = star.constellation || 'the night sky';
    const spectralText = star.spectralType || 'sun-like';

    let para1 = `On ${formatDate(data.queryDate)}, while the world went about its day, astronomers trained their instruments toward ${constText} and discovered something that had been waiting ${ageText} to be found — ${star.hostStar}, a ${spectralText} star ${distText} away. Its companion world, ${star.name}, was first catalogued in ${formatDiscoveryDate(star.discoveredDate)}, revealing that even in the vast emptiness of space, companionship endures.`;

    let para2 = '';
    if (data.supernova) {
      para2 = `That same cosmic moment, in a galaxy far beyond our own, a star known as ${data.supernova.name} ended its journey — a Type ${data.supernova.type} supernova blazing through ${data.supernova.hostGalaxy}. As one star was found, another said farewell. The universe breathes in cycles of creation and destruction, and your date held both.`;
    } else {
      para2 = `Across the cosmos, stars were being born and dying in equal measure. The Milky Way alone produces roughly three new stars each year, and somewhere in the observable universe, a supernova flares every ten seconds. Your date was no exception — the universe was restless, as always.`;
    }

    let para3 = '';
    if (data.asteroid) {
      para3 = `Closer to home, in our own solar system, ${data.asteroid.designation} was also logged for the first time — a ${data.asteroid.orbitType} object joining the ever-growing catalog of our cosmic neighborhood. From distant exoplanets to our own backyard, the universe was busy on your day.`;
    } else {
      para3 = `From the farthest reaches of known space to the quiet neighborhoods of our solar system, the universe was busy on your day. Every photon that reached Earth that evening had been traveling for years, decades, or millennia — all arriving precisely on time, just for you.`;
    }

    return `${para1}\n\n${para2}\n\n${para3}`;
  },

  /**
   * Fallback narrative when no specific discovery is found.
   */
  fallback: (data) => {
    const para1 = `Your date falls in an era before modern sky surveys catalogued every discovery with precision. But make no mistake — on ${formatDate(data.queryDate)}, the universe was no less busy. Astronomers estimate that roughly three new stars ignite somewhere in the Milky Way every year, and across the observable universe, the number is staggering beyond comprehension.`;

    const star = data.primaryStar;
    const para2 = star
      ? `We've assigned you ${star.hostStar} — a ${star.spectralType || 'remarkable'} star in ${star.constellation || 'the night sky'}. At ${star.distance?.lightyears?.toLocaleString() || 'an immense distance'} light-years away, its light has been traveling toward you since long before your date, arriving as a silent witness to every moment since.`
      : `On your day alone, over 250,000 stars were born across the observable universe. This is your star — not yet named, not yet found — but out there, burning.`;

    const para3 = `The cosmos does not wait for us to look up. It creates, destroys, and transforms with or without an audience. But now you have looked — and the universe, perhaps, is a little less lonely for it.`;

    return `${para1}\n\n${para2}\n\n${para3}`;
  },

  /**
   * Empty fallback — when truly nothing was found anywhere.
   */
  empty: (data) => {
    const para1 = `On ${formatDate(data.queryDate)}, the databases we queried came back quiet. But silence in astronomy is never truly silent — it simply means we haven't listened closely enough yet.`;

    const para2 = `Every second, the sun converts 600 million tons of hydrogen into helium. Every hour, a star somewhere in the Milky Way exhausts its fuel and collapses. Every day, asteroids trace invisible arcs through our solar system, most never seen by human eyes. Your date was no different.`;

    const para3 = `Your star is out there. It may not have a name yet. It may not have been discovered yet. But somewhere, in some corner of the universe, a star burned on your day — and it's still burning now, waiting to be found.`;

    return `${para1}\n\n${para2}\n\n${para3}`;
  },
};
