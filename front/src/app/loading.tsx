import { Spinner } from '@/components/ui/spinner'

export default function Loading() {
  return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  )
}
