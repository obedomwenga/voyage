/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'thevoyage.io',
          pathname: '/wp-content/uploads/**',
        },
        {
          protocol: 'https',
          hostname: 'via.placeholder.com',
          pathname: '/**',
        },
      ],
    },
  };
  
  export default nextConfig;
  