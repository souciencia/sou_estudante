import { cn } from '@/utils/cn'

export interface Props {
  className?: string
}

export const ShapeCurveInvert = (className: Props) => {
  return (
    <svg
      className={cn('absolute inset-x-0 bottom-0 block h-9 w-full', className)}
      viewBox="0 0 1440 36"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M1440 18C1080 1.52588e-05 360 36 0 18V1.52588e-05H1440V18Z"
        fill="var(--color-surface-lv1)"
      />
    </svg>
  )
}
