import { cn } from '@/utils/cn'

interface Props {
  className?: string
  title: string
  percentage: string
}

export const CardProgressBar = ({ title, className, percentage }: Props) => {
  const format = 'h-1.5 rounded-sm'

  return (
    <div className="m-1">
      <div className="flex justify-between font-coadjuvant text-coadjuvant-sm font-bold uppercase text-fg-muted">
        <p>{title}</p>
        <p>{percentage}</p>
      </div>
      <div
        className={cn(
          'my-1 w-full bg-progress-bar-background',
          format,
          className,
        )}
      >
        <div
          className={cn('bg-progress-bar-foreground', format)}
          style={{ width: percentage }}
        />
      </div>
    </div>
  )
}
