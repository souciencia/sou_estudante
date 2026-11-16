export const UF_NOMES: Record<string, string> = {
  AC: 'Acre',
  AL: 'Alagoas',
  AP: 'Amapá',
  AM: 'Amazonas',
  BA: 'Bahia',
  CE: 'Ceará',
  DF: 'Distrito Federal',
  ES: 'Espírito Santo',
  GO: 'Goiás',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  MS: 'Mato Grosso do Sul',
  MG: 'Minas Gerais',
  PA: 'Pará',
  PB: 'Paraíba',
  PR: 'Paraná',
  PE: 'Pernambuco',
  PI: 'Piauí',
  RJ: 'Rio de Janeiro',
  RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul',
  RO: 'Rondônia',
  RR: 'Roraima',
  SC: 'Santa Catarina',
  SP: 'São Paulo',
  SE: 'Sergipe',
  TO: 'Tocantins',
}

/** Nome por extenso da UF a partir da sigla; retorna a própria sigla se desconhecida. */
export function ufLabel(sigla: string): string {
  return UF_NOMES[sigla.toUpperCase()] ?? sigla
}

export interface UfOption {
  label: string
  value: string
}

/**
 * UFs mais representativas, exibidas antes das demais quando a lista é
 * recolhida. As 27 siglas seguem vindo de `UF_NOMES`.
 */
const UF_PRIORITY = [
  'SP',
  'BA',
  'RJ',
  'MG',
  'PR',
  'RS',
  'PE',
  'CE',
  'SC',
  'GO',
  'DF',
]

/** Todas as 27 UFs como opções de filtro, com as prioritárias primeiro. */
export function ufOptions(): UfOption[] {
  const priority = UF_PRIORITY.filter((sigla) => sigla in UF_NOMES)
  const rest = Object.keys(UF_NOMES)
    .filter((sigla) => !priority.includes(sigla))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))

  return [...priority, ...rest].map((sigla) => ({
    label: UF_NOMES[sigla],
    value: sigla,
  }))
}
