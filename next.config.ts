import type { NextConfig } from 'next';
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  output: 'standalone',
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
};

// Sửa lại: bọc config của bạn bằng withBundleAnalyzer
export default withBundleAnalyzer(nextConfig);
