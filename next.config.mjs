/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow APOD images from NASA
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'apod.nasa.gov' },
    ],
  },
};

export default nextConfig;
