export const ENADE_FAIXAS = ['1', '2', '3', '4', '5'] as const

export type EnadeFaixa = (typeof ENADE_FAIXAS)[number]
