import {
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import { Tag } from '@/components/ui/tag/tag'
import { cn } from '@/utils/cn'

export interface CardTag {
  label: string
  icon?: ReactNode
  source?: string
  /** Reservado para a estilização em andamento: hoje não altera o visual. */
  tone?: 'blue' | 'green'
}

interface Props {
  className?: string
  source: Array<string | CardTag | ReactElement>
}

const isCardTag = (item: unknown): item is CardTag =>
  typeof item === 'object' && item !== null && !isValidElement(item)

export const CardTags = ({ className, source }: Props) => {
  return (
    <div className={cn('flex flex-wrap gap-y-1  my-2', className)}>
      {source.map((item, index) => {
        if (isValidElement(item)) {
          return <Fragment key={item.key ?? index}>{item}</Fragment>
        }

        const tag: CardTag = isCardTag(item) ? item : { label: item }
        return (
          <Tag
            key={tag.label}
            label={tag.label}
            icon={tag.icon}
            source={tag.source}
            variant={tag.tone ?? 'curso'}
          />
        )
      })}
    </div>
  )
}
