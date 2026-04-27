import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
config.autoAddCss = false;

export const metadata = {
  title: 'Star Discovery — What Did The Universe Discover On Your Day?',
  description: 'Enter any date and discover which star, supernova, asteroid, and cosmic event the universe revealed that day. Powered by 5 real astronomical databases.',
  keywords: 'star discovery, exoplanet, supernova, asteroid, NASA, astronomy, cosmic story',
};

import ClientGalaxy from '../components/ClientGalaxy';

import { Figtree } from 'next/font/google';

const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={figtree.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <link rel="dns-prefetch" href="https://exoplanetarchive.ipac.caltech.edu" />
        <link rel="dns-prefetch" href="https://api.nasa.gov" />
        <link rel="dns-prefetch" href="https://simbad.u-strasbg.fr" />
      </head>
      <body style={{ background: '#020408', color: '#F0EDE6' }}>
        <ClientGalaxy />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
