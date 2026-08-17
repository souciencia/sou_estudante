import { SearchPage } from '@/components/organisms/search-page'

export default async function Home({ searchParams }: any) {
  const params = await searchParams
  const query = params.q || ''

  return (
    <div className="min-h-screen w-full bg-site-background">
      <SearchPage />
    </div>
  )
}
