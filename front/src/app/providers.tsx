'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type ReactNode, useState } from 'react'
import { CompareProvider } from '@/components/compare/compare-provider'

/**
 * Providers globais do app. Mantém um `QueryClient` por sessão (via estado
 * preguiçoso) para compartilhar o cache de buscas entre os componentes da mesma
 * rota, evitando requisições duplicadas.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <CompareProvider>{children}</CompareProvider>
    </QueryClientProvider>
  )
}
