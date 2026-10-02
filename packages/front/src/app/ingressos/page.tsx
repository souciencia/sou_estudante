'use client'

import Menu from "@/components/layout/menu/menu";
import { Button } from "@/components/ui/button/button";
import { Tag } from "@/components/ui/tag/tag";
import { ChevronLeft, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function IngressoDetalhePage() {
    const router = useRouter();

    return (
        <main className="mx-auto min-h-screen max-w-2xl bg-site-background p-4 pb-28">

            <header className="mb-4 flex items-center justify-between">
                <button onClick={() => router.back()} className="cursor-pointer inline-flex items-center gap-[5px] text-coadjuvant-sm font-medium text-text-muted">
                    <ChevronLeft className="size-5" aria-hidden="true" />
                    Voltar para a lista
                </button>
                <div className="flex items-center gap-2">
                    <Tag label={"Como ingressar"} module={"2"} className="font-semibold" />
                    <Menu />
                </div>
            </header>

            <section className="mb-4">
                <span className="mb-[6px] text-coadjuvant-xs font-bold uppercase tracking-[0.7px] text-m2-deep">
                    Ingresso via Sisu
                </span>
                <h1 className="mb-1 font-display text-xl font-bold leading-tight tracking-[-0.2px] text-text">
                    MEDICINA — BACHARELADO
                </h1>
                <p className="mb-2 text-coadjuvant-sm text-text-muted">
                    UNIVERSIDADE FEDERAL DE SÃO CARLOS · UNIDADE SEDE
                </p>
                <div className="flex flex-wrap gap-[5px]">
                    <Tag label={"Tem Sisu"} module={"2"} className="px-2 py-[2px]" />
                    <span className="rounded-[20px] border border-plum-100 bg-site-background px-2 py-[2px] text-coadjuvant-xs font-semibold text-text-muted">
                        INTEGRAL
                    </span>
                    <span className="rounded-[20px] border border-plum-100 bg-site-background px-2 py-[2px] text-coadjuvant-xs font-semibold text-text-muted">
                        SÃO CARLOS, SP
                    </span>
                </div>
            </section>

            <section className="mb-4 flex items-center justify-between gap-3 rounded-[14px] border-b-2 bg-[rgba(0,229,255,.06)] p-[0.875rem]"
                style={{ borderBottomColor: "var(--color-m2-accent)" }}
            >
                <div className="flex items-center gap-[10px]">
                    <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[rgba(0,229,255,.12)] text-m2-deep">
                        <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden>
                        <circle cx="8" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                        <path
                            d="M8 12.5C8 12.5 3.5 10 3.5 6.5C3.5 4 5.5 2 8 2s4.5 2 4.5 4.5C12.5 10 8 12.5 8 12.5Z"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinejoin="round"
                        />
                        </svg>
                    </div>
                    <div>
                        <p className="mb-px text-coadjuvant-xs font-bold uppercase tracking-[0.6px] text-m2-deep">
                            Local de oferta
                        </p>
                        <p className="text-coadjuvant font-bold leading-[1.1] tracking-[-0.2px] text-text">
                            SÃO CARLOS
                        </p>
                        <p className="mt-px text-coadjuvant-sm text-m2-deep opacity-75">
                            UNIDADE SEDE
                        </p>
                        <p className="mt-[2px] text-coadjuvant-xs text-text-muted">
                            Sisu · 2026
                        </p>
                    </div>
                </div>
                <div className="shrink-0 text-right">
                    <p className="mb-[3px] inline-block rounded-[20px] bg-m2-deep px-[9px] py-[2px] text-xs font-bold text-white">
                        SP
                    </p>
                    <p className="text-coadjuvant-xs text-text-muted">
                        Sudeste · Brasil
                    </p>
                </div>
            </section>

            <article className="relative overflow-hidden rounded-[20px] border-[1.5px] border-plum-100 bg-surface p-4 sm:p-[1.125rem]">
                <div className="mb-[0.875rem] rounded-[20px] border-[1.5px] border-plum-100 bg-surface p-5">
                    <div className="mb-1 text-coadjuvant-xs font-bold uppercase tracking-[0.6px] text-text-muted">
                        Nota de corte · Chamada regular · Ampla concorrência
                    </div>
                    <div className="mb-1">
                        <span className="font-mono text-protagonist-xl font-bold leading-none text-text">
                            805,22
                            <small className="font-protagonist text-coadjuvant font-normal text-text-muted">
                                {" "}
                                pts
                            </small>
                        </span>
                    </div>
                    
                    <div className="text-coadjuvant-sm text-text-muted">
                        Último classificado · 1ª chamada
                    </div>
                    <div className="mt-[10px]">
                        <Tag label={"Sisu"} module={"2"} className="font-normal px-[9px] py-[2px]" />
                    </div>
                </div>

                <div className="mb-[0.875rem] grid grid-cols-1 gap-[0.625rem] sm:grid-cols-2">
                    <div className="rounded-[14px] border border-plum-100 bg-surface p-[0.875rem]">
                    <div className="mb-1 text-coadjuvant-xs font-bold uppercase tracking-[0.6px] text-text-muted">
                        Vagas ofertadas
                    </div>
                    <div className="font-mono text-protagonist-lg font-bold leading-none text-text">
                        38
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
                        Integral
                    </div>
                    </div>
                </div>

                <div className="mb-[10px] mt-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-plum-100" />
                    <div className="whitespace-nowrap text-coadjuvant-xs font-bold uppercase tracking-[0.7px] text-text-muted">
                        Modalidades de cota — Sisu
                    </div>
                    <div className="h-px flex-1 bg-plum-100" />
                </div>
                <div className="mb-[0.875rem] flex flex-col gap-2">

                    <div className="flex items-center justify-between gap-2 rounded-[14px] border p-3 border-plum-100 bg-surface">
                        <div>
                            <div className="mb-px text-xs font-bold text-text">Baixa renda · demais candidatos</div>
                            
                            <div className="text-coadjuvant-xs text-text-muted">Escola pública · renda até 1 salário mínimo por pessoa</div>
                            
                        </div>
                        <div className="text-right">

                            <span className="font-mono text-base font-bold text-text">
                                775,45
                            </span>

                            <div className="font-mono text-coadjuvant-xs text-text-muted">
                                13 vagas
                            </div>
                        </div>
                    </div>

                </div>

                    <div className="flex items-center justify-between gap-2 border-t border-plum-100 pt-2">
                        <Tag module={"2"} label={"Sisu"} className="font-normal px-[9px] py-[2px]" />
                        <Button module={'2'} className="inline-flex cursor-pointer items-center gap-[5px] rounded-[10px] border-[1.5px] px-3 py-[6px] font-protagonist text-coadjuvant-xs font-semibold transition-transform duration-fast ease-prow active:scale-[0.97]">
                            <Info className="size-3" aria-hidden="true"/>
                            Como interpretar?
                        </Button>
                    </div>
            </article>


        </main>
    )
}