interface IngressoDetalhePageProps {
    params: Promise<{ id: string }>
}

export default async function IngressoDetalhePage({
    params,
}: IngressoDetalhePageProps) {
    const { id } = await params

    return (
        <main className="mx-auto min-h-screen max-w-2xl bg-site-background p-4 pb-28">
            
        </main>
    )
}