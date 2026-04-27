import ResultView from './ResultView';
import { Suspense } from 'react';
import LoadingState from '../../components/LoadingState';
import CustomCursor from '../../components/CustomCursor';

export async function generateMetadata({ searchParams }) {
  const { date } = await searchParams;
  
  if (!date) return { title: 'Cosmic Discovery' };

  return {
    title: `Star Discovery — ${date}`,
    description: `What did the universe discover on ${date}? Exploring exoplanets, supernovae, and cosmic captures from that day.`,
    openGraph: {
      title: `The Universe Discovered a Star for Me on ${date}`,
      description: 'Discover your own cosmic story. Powered by NASA and 4 other astronomical databases.',
      images: [
        {
          url: `/api/og?date=${date}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Star Discovery — ${date}`,
      images: [`/api/og?date=${date}`],
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
