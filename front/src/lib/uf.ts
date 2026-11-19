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

/** Todas as 27 UFs como opções de filtro, em ordem alfabética pelo nome. */
export function ufOptions(): UfOption[] {
  return Object.keys(UF_NOMES)
    .map((sigla) => ({ label: UF_NOMES[sigla], value: sigla }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}
