/**
 * Configurações centralizadas da API
 */
export const API_CONFIG = {
  // Base URL: usa proxy do Next.js (/api) que faz rewrite interno para se_api:8080
  // Isso resolve problemas de CORS e permite comunicação via rede interna Docker
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "/api",

  // Configurações de cache do Next.js
  CACHE: {
    REVALIDATE_SECONDS: 10,
  },

  // Endpoints centralizados (facilita manutenção e descoberta)
  ENDPOINTS: {
    SEARCH_OFERTAS: "/ofertas",
    // Futuros endpoints dos 5 módulos:
    // GET_CURSO: '/cursos/:id',
    // COMO_INGRESSAR: '/ingresso',
    // COMO_PERMANECER: '/permanencia',
    // CONHECER_INSTITUICAO: '/instituicoes/:id',
    // COMPARAR_CURSOS: '/comparar',
  },

  // Timeouts e limites
  TIMEOUT_MS: 10000,

  // Configuração de debounce para busca em tempo real
  SEARCH_DEBOUNCE_MS: 300,

  // Validação de busca
  SEARCH_MIN_CHARS: 5,
} as const;
