/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
        destination: '/admin',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
