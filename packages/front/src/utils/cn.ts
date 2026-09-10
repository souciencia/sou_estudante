import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const FONT_SIZES = [
  'protagonist-sm',
  'protagonist',
  'protagonist-lg',
  'protagonist-xl',
  'coadjuvant-xs',
  'coadjuvant-sm',
  'coadjuvant',
  'coadjuvant-lg',
] as const

const FONT_FAMILIES = [
  'protagonist',
  'coadjuvant',
  'title-protagonist',
  'title-coadjuvant',
] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...FONT_SIZES] }],
      'font-family': [{ font: [...FONT_FAMILIES] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
