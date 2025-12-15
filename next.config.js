/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable server components (default in App Router)
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
};

module.exports = nextConfig;

