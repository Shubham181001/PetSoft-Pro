import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bytegrad.com",
        pathname: "/course-assets/react-nextjs/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  allowedDevOrigins: [
    "alivia-cornual-domenica.ngrok-free.dev",
    "*.ngrok-free.dev",
  ],
};

export default nextConfig;
