/**
 * Molécula CardResumoCurso — card resumido e clicável da lista da
 * Bússola, fiel ao .course-card do v21 (s_m2_results): nome, IES,
 * badges e local. SEM nota de corte — o v21 a reserva ao detalhe
 * deliberadamente (correção editorial D4, Lote 1 da auditoria);
 * card inteiro clicável, com foco de teclado visível e nome
 * acessível (I1). Leva ao detalhe preservando UF e área.
 */
import Link from "next/link";
import BadgeGratuito from "@/components/atoms/badge-gratuito";
import ChipTemSisu from "@/components/atoms/chip-tem-sisu";
import { chaveGrupo } from "@/lib/ofertas";
import { grauExibivel } from "@/lib/rotulos";
import type { Oferta } from "@/lib/tipos";

interface Props {
  /** Ofertas do mesmo curso×turno — uma por modalidade. */
  ofertas: Oferta[];
  sgUf: string;
  coArea: string;
}

export default function CardResumoCurso({ ofertas, sgUf, coArea }: Props) {
  const base = ofertas[0];
  const destino = `/ingresso/oferta/?uf=${encodeURIComponent(sgUf)}&area=${encodeURIComponent(
    coArea,
  )}&curso=${encodeURIComponent(chaveGrupo(base))}`;

  return (
    <Link
      href={destino}
      aria-label={`${base.no_curso} — ${base.no_ies}`}
      className="block cursor-pointer rounded-[20px] border-[1.5px] border-plum-100 bg-surface p-4 transition-transform duration-fast ease-prow hover:-translate-y-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-m2-deep active:scale-[0.99]"
    >
      <div className="min-w-0">
        <div className="mb-[2px] truncate text-sm font-bold leading-tight text-text">
          {base.no_curso}
          {grauExibivel(base.ds_grau) && ` — ${grauExibivel(base.ds_grau)}`}
        </div>
        <div className="mb-[6px] truncate text-xs text-text-muted">
          {[base.no_ies, base.no_campus].filter(Boolean).join(" · ")}
        </div>
        <div className="flex flex-wrap gap-[5px]">
          <ChipTemSisu temSisu />
          {/* Ordem do v21: badge-sisu → badge-pub */}
          <BadgeGratuito inGratuito={base.in_gratuito} />
          {base.ds_turno && (
            <span className="rounded-[20px] border border-plum-100 bg-surface-alt px-2 py-[2px] text-[10px] font-semibold text-text-muted">
              {base.ds_turno}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 border-t border-plum-100 pt-2">
        <span className="inline-flex items-center gap-[3px] rounded-[20px] border border-plum-100 bg-surface-alt px-2 py-[2px] text-[11px] font-bold text-text-muted">
          <svg viewBox="0 0 10 10" fill="none" width="10" height="10" aria-hidden>
            <circle cx="5" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.1" />
            <path
              d="M5 7C5 7 2.5 8.8 2.5 4C2.5 2.6 3.6 1.5 5 1.5S7.5 2.6 7.5 4C7.5 8.8 5 7 5 7Z"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          </svg>
          {[base.no_municipio, base.sg_uf].filter(Boolean).join(", ")}
          <span className="text-[9px] font-medium opacity-65">· Sisu</span>
        </span>
      </div>
    </Link>
  );
}
