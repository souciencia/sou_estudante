'use client'

/**
 * Boundary de erro de último recurso. Substitui o layout raiz, por isso não
 * depende das classes do `globals.css` e usa estilos inline mínimos.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0 }}>Algo deu errado</h1>
        <p style={{ margin: 0, color: '#555' }}>
          {error.message || 'Erro inesperado.'}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            border: '1px solid currentColor',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  )
}
