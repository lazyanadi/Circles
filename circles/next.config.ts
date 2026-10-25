import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The landing page is a self-contained HTML page (three.js scene, calculator); serve it as the home page.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/landing.html" }],
    };
  },
};

export default nextConfig;
