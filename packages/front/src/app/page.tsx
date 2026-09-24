import { HomeSearch } from '@/components/home/home-search/home-search'
import { Hero } from '@/components/layout/hero'
import { Route } from '@/components/ui/route/route'

export default function Home() {
  return (
    <div className="flex justify-center min-h-screen w-full bg-site-background">
      <main className="max-w-5xl flex-col py-20 px-6 sm:px-16">
        <Hero />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 max-w-[820px] mx-auto mt-10">
          <Route module={'1'} />
          <Route module={'2'} />
          <Route module={'3'} />
          <Route module={'4'} />
          <Route module={'5'} />
        </div>
        <div className="mt-10">
          <HomeSearch />
        </div>
      </main>
    </div>
  )
}
