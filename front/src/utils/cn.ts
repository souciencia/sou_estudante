import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const RADII = ['card', 'callout', 'panel', 'control'] as const

// `text-display` é o único tamanho de fonte próprio; sem registrá-lo o
// tailwind-merge o trataria como cor. `font-display` já é reconhecido.
const twMerge = extendTailwindMerge({
  extend: {
    theme: { text: ['display'] },
    classGroups: {
      rounded: [{ rounded: [...RADII] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
