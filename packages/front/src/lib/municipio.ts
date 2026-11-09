import type { MunicipiosMap } from '@/services/api/types'

/**
 * Nome de um município a partir do seu código IBGE, procurando em todas as
 * UFs. Devolve `undefined` quando o código não é encontrado.
 */
export function municipioNome(
  municipios: MunicipiosMap,
  codigo: string,
): string | undefined {
  for (const lista of Object.values(municipios)) {
    const encontrado = lista.find((municipio) => municipio.codigo === codigo)
    if (encontrado) return encontrado.nome
  }
  return undefined
}
