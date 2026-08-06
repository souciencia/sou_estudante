import type { HTMLAttributes } from "react"
import { cn } from "@/utils/cn"

type TagProps = HTMLAttributes<HTMLDivElement> & {
  label: string
  module: '1' | '2' | '3' | '4' | '5'
}

export const Tag = ({ label, module, ...props }: TagProps) => {
  return (
    <span data-module={`${module}`}
      {...props}

      className={
        cn(
          'bg-button-surface text-button-fg',
          'border text-xs px-2 py-1 mr-1',
          'rounded-2xl transition duration-300',
          'text-tag font-bold'
        )}
    >
        {label}
    </span>
  )
}
