// app/page.tsx

import { Hero } from '@/components/organisms/hero'
import { SearchCursos } from '@/components/organisms/search/search-cursos'

export default function Home() {
  return (
    <div className="flex justify-center min-h-screen w-full bg-site-background">
      <main className="max-w-5xl flex-col py-20 px-6 sm:px-16">
        <Hero />
        <h1>Teste 08.11 </h1>
        <SearchCursos />
      </main>
    </div>
  )
}
