// app/page.tsx

import { HomeSearch } from '@/components/features/home-search/home-search'
import { Hero } from '@/components/site-blocks/hero'

export default function Home() {
  return (
    <div className="flex justify-center min-h-screen w-full bg-site-background">
      <main className="max-w-5xl flex-col py-20 px-6 sm:px-16">
        <Hero />
        <div className="mt-10">
          <HomeSearch />
        </div>
      </main>
    </div>
  )
}
