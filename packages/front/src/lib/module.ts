export const MODULES = ['1', '2', '3', '4', '5'] as const

export type Module = (typeof MODULES)[number]
