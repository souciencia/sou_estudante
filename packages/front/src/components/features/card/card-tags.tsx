import { Tag } from '@/components/atoms/tag'
import { cn } from '@/utils/cn'
import { useCardModule } from './card-context'

interface Props {
  className?: string
  source: string[]
}

export const CardTags = ({ className, source }: Props) => {
  const module = useCardModule()

  return (
    <div className={cn('flex py-1', className)}>
      {source.map((t) => (
        <Tag key={t} label={t} module={module} />
      ))}
    </div>
  )
}
