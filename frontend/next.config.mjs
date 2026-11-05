/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_BUILD_DIR || ".next",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl && !backendUrl.includes('127.0.0.1') && !backendUrl.includes('localhost')) {
      return [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ];
    }
    return [];
  },
  async redirects() {
    return [
      {
        source: '/transparency',
        destination: '/public',
        permanent: false,
      },
      {
        source: '/settings',
        destination: '/command',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
