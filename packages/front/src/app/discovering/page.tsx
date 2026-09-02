// src/app/discovering/page.tsx
import { Suspense } from 'react'
import { Typo } from '@/components/atoms/typo'
import { SearchPage } from '@/components/organisms/search-page'

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-site-background">
      <Suspense
        fallback={
          <Typo v="mute" s="sm">
            Carregando...
          </Typo>
        }
      >
        <SearchPage />
      </Suspense>
    </div>
  )
}
