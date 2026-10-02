import { Tag } from "@/components/ui/tag/tag"
import { Oferta } from "@/services/api"
import { ProfileIngressoQuotas } from "./profile-ingresso-quotas"
import { Button } from "@/components/ui/button/button"
import { Info } from "lucide-react"

interface ProfileIngressoShiftProps {
    ofertas: Oferta[]
    className?: string
}

const formatNotaCorte = (value: number) =>
  `${new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`

const formatarTurno = (turno?: string) => {
    if (!turno) return ""
    return turno.charAt(0).toUpperCase() + turno.slice(1).toLowerCase()
};

export const ProfileIngressoShift = ({ ofertas, className }: ProfileIngressoShiftProps) => {
    if (ofertas.length === 0) return null

    const ampla = ofertas[0]
    const cotas = ofertas.filter(o => o.modalidade !== 'AC');

    return (
        <article className="relative overflow-hidden rounded-card border-[1.5px] border-plum-100 bg-surface p-4 sm:p-[1.125rem]">
            <div className="mb-[0.875rem] rounded-card border-[1.5px] border-plum-100 bg-surface p-5">

                <div className="mb-1 text-coadjuvant-xs font-bold uppercase tracking-[0.6px] text-text-muted">
                    Nota de corte · Chamada regular · Ampla concorrência
                </div>

                <div className="mb-1">
                    <span className="font-mono text-protagonist-xl font-bold leading-none text-text">
                        {ampla.nota_corte ? formatNotaCorte(ampla.nota_corte) : '—'}
                        {ampla.nota_corte && (
                            <small className="font-coadjuvant text-coadjuvant font-normal text-text-muted">
                                {" "}
                                pts
                            </small>
                        )}
                    </span>
                </div>

                <div className="text-coadjuvant-sm text-text-muted">
                    Último classificado · 1ª chamada
                </div>

                <div className="mt-[10px]">
                    <Tag label={"Sisu"} module={"2"} className='py-[2px] font-normal'/>
                </div>
            </div>

            <div className="mb-[0.875rem] grid grid-cols-1 gap-[0.625rem] sm:grid-cols-2">
                <div className="rounded-[14px] border border-plum-100 bg-surface p-[0.875rem]">
                    <div className="mb-1 text-coadjuvant-xs font-bold uppercase tracking-[0.6px] text-text-muted">
                        Vagas ofertadas
                    </div>
                    <div className="font-mono text-protagonist-lg font-bold leading-none text-text">
                        {ampla.vagas !== null && ampla.vagas !== undefined
                        ? (ampla.vagas)
                        : "—"}
                    </div>
                    <div className="mt-[3px] text-coadjuvant-xs text-text-muted">
                        Ampla concorrência · 2026
                    </div>
                </div>

                <div className="rounded-[14px] border border-plum-100 bg-surface p-[0.875rem]">
                    <div className="mb-1 text-coadjuvant-xs font-bold uppercase tracking-[0.6px] text-text-muted">
                        Turno · Sisu
                    </div>
                    <div className="pt-1 text-coadjuvant-lg font-bold text-text">
                        {formatarTurno(ampla.turno)}
                    </div>
                </div>
            </div>

            {cotas.length > 0 && (
                <>
                    <div className="mb-[10px] mt-4 flex items-center gap-2">
                        <div className="h-px flex-1 bg-plum-100" />
                        <div className="whitespace-nowrap text-coadjuvant-xs font-bold uppercase tracking-[0.7px] text-text-muted">
                            Modalidades de cota — Sisu
                        </div>
                        <div className="h-px flex-1 bg-plum-100" />
                    </div>

                    <div className="mb-[0.875rem] flex flex-col gap-2">
                        {cotas.map((o, index) => {
                            return (
                                <ProfileIngressoQuotas key={index} nome={o.modalidade} descricao={o.descricao} vagas={o.vagas} nota={o.nota_corte}/>
                            )
                        })}
                    </div>
                </>
            )}

            <footer className="flex items-center justify-between gap-2 border-t border-plum-100 pt-2">
                <Tag label={"Sisu"} module={"2"} className='py-[2px] font-normal'/>
                <Button
                    v="outline"
                    module={'2'}
                    className="inline-flex cursor-pointer items-center gap-[5px] rounded-[10px] border-[1.5px] px-3 py-[6px] font-protagonist text-coadjuvant-xs font-semibold transition-transform duration-fast ease-prow active:scale-[0.97] mt-1 bg-accent/10"
                >
                    <Info className="size-3" aria-hidden="true" />
                    Como interpretar?
                </Button>
            </footer>
            
        </article>
    )
}