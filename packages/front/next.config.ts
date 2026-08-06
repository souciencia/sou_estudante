import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Proxy para a API do backend (resolve CORS e comunicação interna Docker)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://se_api:8080"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
