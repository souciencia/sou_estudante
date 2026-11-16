import { cn } from '@/utils/cn'

interface Props {
  className?: string
  title: string
  percentage?: string
  emptyValue?: string
  emptyHint?: string
}

export const CardProgressBar = ({
  title,
  className,
  percentage,
  emptyValue = '—',
  emptyHint,
}: Props) => {
  const format = 'h-1.5 rounded-sm'
  const hasData = percentage !== undefined
  const displayTitle = !hasData && emptyHint ? `${title} • ${emptyHint}` : title
  const displayValue = hasData ? percentage : emptyValue
  const fillWidth = hasData ? percentage : '0%'

  return (
    <div className="m-1 max-w-[20rem]">
      <div className="flex justify-between font-sans text-xs text-fg-muted">
        <p>{displayTitle}</p>
        <p>{displayValue}</p>
      </div>
      <div
        className={cn(
          'my-1 w-full bg-progress-bar-background',
          format,
          className,
        )}
        aria-hidden="true"
      >
        <div
          className={cn('bg-progress-bar-foreground', format)}
          style={{ width: fillWidth }}
        />
      </div>
    </div>
  )
}
