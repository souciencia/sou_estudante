import { cn } from '@/utils/cn'

interface Props {
  className?: string
  title: string
  percentage: string
}

export const CardProgressBar = ({
  title,
  className = '',
  percentage,
}: Props) => {
  const format = `h-1.5 rounded-sm`

  return (
    <div className="m-1">
      <div className="flex justify-between text-xs font-bold uppercase text-zinc-500">
        <p>{title}</p>
        <p>{percentage}</p>
      </div>
      <div className={cn(`w-full bg-zinc-200  my-1`, `${format} ${className}`)}>
        <div
          className={cn(`bg-zinc-400 ${format}`)}
          style={{ width: percentage }}
        ></div>
      </div>
    </div>
  )
}
