// app/page.tsx
import { SearchCursos } from '@/components/search/search-cursos';
import { Hero } from '@/components/site-elements/hero';

export default async function Home({ searchParams }: any) {
  const params = await searchParams;
  const query = params.q || '';

  return (
    <div className='flex justify-center min-h-screen w-full bg-site-background'>
      <main className='max-w-5xl flex-col py-20 px-6 sm:px-16'>
      <Hero />
          <SearchCursos />
      </main>
    </div>
  );
}