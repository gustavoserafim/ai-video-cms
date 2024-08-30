/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img-dev.fanherocdn.com',
      },
      {
        protocol: 'https',
        hostname: 'luwurfwcmfjxayzivkgc.supabase.co',
      },
    ],
  },
};

export default nextConfig;
