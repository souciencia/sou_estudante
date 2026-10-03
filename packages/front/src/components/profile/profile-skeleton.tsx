interface Props {
  className?: string
}

export default function ProfileSkeleton({ className = '' }: Props) {
  return <div aria-hidden className={`esqueleto ${className}`} />
}

export function ProfileSkeletonCard() {
  return (
    <div className="rounded-[20px] border-[1.5px] border-plum-100 bg-surface p-4">
      <ProfileSkeleton className="mb-2 h-4 w-3/5" />
      <ProfileSkeleton className="mb-3 h-3 w-2/5" />
      <div className="flex gap-2">
        <ProfileSkeleton className="h-5 w-16" />
        <ProfileSkeleton className="h-5 w-20" />
        <ProfileSkeleton className="h-5 w-24" />
      </div>
    </div>
  )
}
