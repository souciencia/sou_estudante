import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  experimental: {
    agentUpgrade: 'security',
  },

  // Gera um servidor mínimo autocontido para a imagem de produção (Dockerfile)
  output: 'standalone',

  // Imagens estáticas (capturas do modal de ajuda) são servidas direto de /public,
  // sem o endpoint /_next/image, que exige `sharp` no build standalone.
  images: {
    unoptimized: true,
  },

  // Proxy para a API do backend (resolve CORS e comunicação interna Docker)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://se_api:8080'}/:path*`,
      },
    ]
  },
}

export default nextConfig
