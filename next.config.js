/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Configure image domains for external images (we'll add Firebase storage later)
  images: {
    domains: [],
  },
}

module.exports = nextConfig

