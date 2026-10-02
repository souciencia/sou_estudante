import { cn } from "@/utils/cn"

interface ProfileIngressoQuotasProps {
    nome: string | undefined
    descricao?: string | undefined
    vagas: number | undefined
    nota: number | undefined
}

const formatNotaCorte = (value: number) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`

export const ProfileIngressoQuotas = ({ nome, descricao, vagas, nota }: ProfileIngressoQuotasProps) => {
    const vazia = nota === null || nota === undefined;

    return (
        <div className={cn(
            'flex items-center justify-between gap-2 rounded-[14px] border p-3', 
            vazia ? 'border-dashed border-plum-100 bg-site-background' : 'border-plum-100 bg-surface'
        )}>

            <div>
                <div className="mb-px text-xs font-bold text-text">{nome}</div>
                {descricao && (
                    <div className="text-coadjuvant-xs text-text-muted">{descricao}</div>
                )}
            </div>

            <div className="text-right">

                <span className="font-mono text-base font-bold text-text">
                    {nota ? formatNotaCorte(nota) : '—'}
                </span>

                {!vazia && vagas !== null && (
                    <div className="font-mono text-coadjuvant-xs text-text-muted">
                        {vagas} {vagas === 1 ? "vaga" : "vagas"}
                    </div>
                )}
            </div>

        </div>
    )
}