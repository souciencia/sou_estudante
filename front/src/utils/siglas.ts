export function getValidSigla(sigla?: string | null): string | undefined {
  if (!sigla || sigla === 'INEXISTENTE') return undefined

  return sigla
}
