import { isValid, parseISO, isFuture, format } from 'date-fns';
import { cacheGet, cacheSet, cacheHas } from '@/lib/star-discovery/cache/cacheManager.js';
import { queryAll } from '@/lib/star-discovery/engine/queryAll.js';
import { crossReference } from '@/lib/star-discovery/engine/crossReference.js';
import { applyFallbackChain } from '@/lib/star-discovery/engine/fallbackChain.js';
import { buildNarrative } from '@/lib/star-discovery/engine/narrativeBuilder.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');

  // Validate input
  if (!dateStr) {
    return Response.json({ error: 'Missing "date" query parameter.' }, { status: 400 });
  }

  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) {
    return Response.json({ error: `Invalid date format: "${dateStr}". Use YYYY-MM-DD.` }, { status: 400 });
  }
  if (isFuture(parsed)) {
    return Response.json({ error: 'Date cannot be in the future.' }, { status: 400 });
  }

  const yearMonth = format(parsed, 'yyyy-MM');

  // Check cache
  const cacheKey = `web-${dateStr}`;
  if (cacheHas(cacheKey)) {
    return Response.json({ ...cacheGet(cacheKey), fromCache: true });
  }

  try {
    const overallStart = performance.now();

    // Step 1: Query all APIs
    const rawResults = await queryAll(parsed, dateStr, yearMonth);

    // Step 2: Cross-reference
    let result = await crossReference(rawResults, dateStr, yearMonth);

    // Step 3: Fallback chain
    result = await applyFallbackChain(result, rawResults, parsed, dateStr, yearMonth);

    // Step 4: Narrative
    result.narrative = buildNarrative(result);

    const totalTime = Math.round(performance.now() - overallStart);
    result.queryTimeMs = totalTime;

    // Cache it
    cacheSet(cacheKey, result);

    return Response.json({ ...result, fromCache: false });
  } catch (error) {
    console.error('[API] Error:', error);
    return Response.json({ error: 'Failed to query the cosmos.' }, { status: 500 });
  }
}
