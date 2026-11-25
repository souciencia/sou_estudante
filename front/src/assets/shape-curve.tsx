import { cn } from '@/utils/cn'

export interface Props {
  className?: string
}

export const ShapeCurve = (className: Props) => {
  return (
    <svg
      className={cn('absolute inset-x-0 bottom-0 block h-9 w-full', className)}
      viewBox="0 0 1440 36"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,18 C360,36 1080,0 1440,18 L1440,36 L0,36 Z"
        fill="var(--color-surface-lv1)"
      />
    </svg>
  )
}
