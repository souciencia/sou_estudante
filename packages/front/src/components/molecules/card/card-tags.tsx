import { Tag } from '@/components/atoms/tag'
import { cn } from '@/utils/cn'

interface Props {
  className?: string
  source: string[]
}

export const CardTags = ({ className = '', source }: Props) => {
  return (
    <div className={cn(`flex py-1`, `${className}`)}>
      {source.map((t) => (
        <Tag key={t} label={t} module="1" />
      ))}
    </div>
  )
}
