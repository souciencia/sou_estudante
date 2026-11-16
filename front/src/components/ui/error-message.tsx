import { AlertCircle } from 'lucide-react'
import { cn } from '@/utils/cn'

type ErrorMessageProps = {
  message: string
  className?: string
}

/**
 * Componente ErrorMessage - Mensagem de erro amigável
 *
 * @example
 * {error && <ErrorMessage message={error} />}
 */
export function ErrorMessage({ message, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-error/30 bg-error-surface p-4 font-sans text-error',
        className,
      )}
      role="alert"
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
