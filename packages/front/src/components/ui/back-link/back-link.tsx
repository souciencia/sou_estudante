'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utils/cn'

interface BackLinkProps {
  label: string
  fallbackHref?: string
  className?: string
}

export const BackLink = ({
  label,
  fallbackHref = '/',
  className,
}: BackLinkProps) => {
  const router = useRouter()

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }
    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1 font-coadjuvant text-coadjuvant font-semibold text-fg-protagonist',
        'transition-colors hover:text-accent-deep',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep',
        className,
      )}
    >
      <ChevronLeft className="size-5" aria-hidden="true" />
      {label}
    </button>
  )
}
