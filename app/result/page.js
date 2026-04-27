import ResultView from './ResultView';
import { Suspense } from 'react';
import LoadingState from '../../components/LoadingState';
import CustomCursor from '../../components/CustomCursor';
import { isValid, parseISO, format } from 'date-fns';
import { queryAll } from '@/lib/star-discovery/engine/queryAll.js';
import { crossReference } from '@/lib/star-discovery/engine/crossReference.js';
import { applyFallbackChain } from '@/lib/star-discovery/engine/fallbackChain.js';

export async function generateMetadata({ searchParams }) {
  const { date } = await searchParams;
  
  if (!date) return { title: 'Cosmic Discovery' };

  let starName = 'A New Star';
  let constellation = 'Deep Space';
  let distance = '—';
  let apodUrl = 'https://apod.nasa.gov/apod/image/0001/deepfield_hst_big.jpg';

  try {
    const parsed = parseISO(date);
    if (isValid(parsed)) {
      const dateStr = date;
      const yearMonth = format(parsed, 'yyyy-MM');
      
      const rawResults = await queryAll(parsed, dateStr, yearMonth);
      let result = await crossReference(rawResults, dateStr, yearMonth);
      result = await applyFallbackChain(result, rawResults, parsed, dateStr, yearMonth);
      
      if (result.primaryStar) {
        starName = result.primaryStar.name;
        constellation = result.primaryStar.constellation || 'Deep Space';
        distance = result.primaryStar.distance?.lightyears || '—';
      }
      if (result.apodImage?.url) {
        apodUrl = result.apodImage.url;
      }
    }
  } catch (e) {
    console.error('Metadata fetch error:', e);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cosmic-star-discovery.vercel.app';
  const ogImageUrl = `${baseUrl}/api/og?name=${encodeURIComponent(starName)}&date=${encodeURIComponent(date)}&constellation=${encodeURIComponent(constellation)}&distance=${encodeURIComponent(distance)}&img=${encodeURIComponent(apodUrl)}`;

  return {
    title: `${starName} — Your Star Discovery`,
    description: `Discovered the month you were born · ${constellation} · ${distance} ly`,
    openGraph: {
      title: `${starName} — Your Star Discovery`,
      description: `Discovered the month you were born · ${constellation} · ${distance} ly`,
      url: `${baseUrl}/result?date=${date}`,
      siteName: 'Star Discovery',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${starName} — Your Star Discovery`,
      description: `Discovered the month you were born · ${constellation} · ${distance} ly`,
      images: [ogImageUrl],
    },
  };
}

export default function Page() {
  return (
    <>
      <CustomCursor />
      <Suspense fallback={<LoadingState />}>
        <ResultView />
      </Suspense>
    </>
  );
}
