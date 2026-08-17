/**
 * Molécula CardCurso — card de curso do M1 Carta Náutica, fiel ao
 * cardHTML do v21: SeloEnade (mar), nome + grau, IES, badges, o
 * tda-wrap (restauração A2/Lote 1, ATIVO desde o reprocessamento de
 * 06/08) e a banda de onda no fundo (BandaMar).
 *
 * EaD: chip de polos + aviso de transparência de local (regra 8 do
 * CLAUDE.md; visual .tag-ead-loc do v21). tem_sisu exibe "Tem Sisu"
 * — futura ponte para o M2.
 */
import Link from "next/link";
import ChipModalidadeEnsino from "@/components/atoms/chip-modalidade-ensino";
import ChipTemSisu from "@/components/atoms/chip-tem-sisu";
import SeloEnade, { BandaMar } from "@/components/atoms/selo-enade";
import type { CursoUF } from "@/lib/cursos";

const inteiro = new Intl.NumberFormat("pt-BR");
const pctTda = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** Converte conceito_enade_faixa do dado para o contrato do selo. */
export function faixaDoCurso(curso: CursoUF): number | "SC" | null {
  const f = curso.conceito_enade_faixa;
  if (f === null || f === undefined) return null;
  if (String(f).toUpperCase() === "SC") return "SC";
  const n = Number(f);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
}

function PinoLocal() {
  return (
    <svg viewBox="0 0 10 10" fill="none" width="10" height="10" aria-hidden>
      <circle cx="5" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M5 7C5 7 2.5 8.8 2.5 4C2.5 2.6 3.6 1.5 5 1.5S7.5 2.6 7.5 4C7.5 8.8 5 7 5 7Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Props {
  curso: CursoUF;
  /** Contexto de navegação — o detalhe preserva filtros no voltar. */
  sgUf: string;
  coArea: string;
  filtroModalidade?: string;
  filtroGrau?: string;
  /** Média BR de TDA (referencias do manifesto) — marcador "BR x%". */
  mediaBr?: number | null;
}

export default function CardCurso({
  curso,
  sgUf,
  coArea,
  filtroModalidade,
  filtroGrau,
  mediaBr = null,
}: Props) {
  const faixa = faixaDoCurso(curso);
  const ead = curso.dimensao !== "presencial";
  const gratuito = curso.in_gratuito === 1;
  // "INEXISTENTE" é marcador do Censo para sigla ausente — exibe o nome
  const ies =
    curso.sg_ies && curso.sg_ies !== "INEXISTENTE"
      ? curso.sg_ies
      : curso.no_ies;
  // TDA ativa desde o reprocessamento 06/08; 0% é taxa válida.
  const tdaExibivel = curso.tda !== null && curso.tda !== undefined;
  const destino = (() => {
    const q = new URLSearchParams({ uf: sgUf, area: coArea, curso: String(curso.co_curso) });
    if (filtroModalidade) q.set("mod", filtroModalidade);
    if (filtroGrau) q.set("grau", filtroGrau);
    return `/curso/?${q.toString()}`;
  })();

  return (
    <Link
      href={destino}
      aria-label={`${curso.no_curso} — ${ies}`}
      className="relative z-0 block cursor-pointer overflow-hidden rounded-[20px] border-[1.5px] border-plum-100 bg-surface p-4 transition-transform duration-fast ease-prow hover:-translate-y-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-m1-deep active:scale-[0.99]"
    >
      <BandaMar faixa={faixa} />

      <div className="flex items-start gap-[10px]">
        <SeloEnade faixa={faixa} />
        <div className="min-w-0 flex-1">
          <h3 className="mb-[2px] truncate text-sm font-bold leading-tight text-text">
            {curso.no_curso}
            {curso.ds_grau && !curso.ds_grau.startsWith("NÃO APLICÁVEL")
              ? ` — ${curso.ds_grau}`
              : ""}
          </h3>
          <div className="mb-[6px] truncate text-xs text-text-muted">
            {[ies, ead ? "EaD" : curso.no_municipio].filter(Boolean).join(" · ")}
          </div>
          <div className="flex flex-wrap gap-[5px]">
            {gratuito && (
              <span className="whitespace-nowrap rounded-[20px] border-[1.5px] border-[#2ECC8A]/30 bg-[#E8F7F0] px-2 py-[2px] text-[10px] font-bold text-[#1B8A5A]">
                Gratuito
              </span>
            )}
            {curso.tem_sisu && <ChipTemSisu temSisu />}
            {!curso.tem_sisu && !ead && <ChipTemSisu temSisu={false} />}
            <ChipModalidadeEnsino
              dimensao={curso.dimensao}
              qtPolos={curso.qt_polos}
            />
          </div>

          {/* tda-wrap do v21 — restauração A2 (Lote 1), ativa desde o
              reprocessamento 06/08. TDA nula: travessão no valor e
              barra vazia — o elemento permanece, o dado declara
              ausência (decisão 2026-07-30). Marcador "BR x%" na barra
              é a média Brasil do manifesto (v21: .tda-avg). Cor única
              neutra --color-tda, nunca semáforo (regra editorial 2). */}
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.4px] text-text-muted">
                Desistência acumulada (5 anos)
              </span>
              <span className="font-mono text-[11px] font-bold text-text">
                {tdaExibivel ? `${pctTda.format(curso.tda!)}%` : "—"}
              </span>
            </div>
            <div className="relative h-[6px] rounded-[3px] bg-plum-100">
              {tdaExibivel && (
                <div
                  className="h-full rounded-[3px]"
                  style={{
                    width: `${Math.min(100, Math.max(0, curso.tda!))}%`,
                    background: "var(--color-tda)",
                  }}
                />
              )}
              {mediaBr !== null && (
                <div
                  aria-hidden
                  className="absolute top-[-2px] h-[10px] w-[2px] rounded-[1px] bg-text-muted/70"
                  style={{ left: `${Math.min(100, Math.max(0, mediaBr))}%` }}
                >
                  <span className="absolute left-[4px] top-[-2px] whitespace-nowrap text-[8px] font-semibold leading-none text-text-muted">
                    BR {pctTda.format(mediaBr)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-[5px] border-t border-plum-100 pt-2">
        <div className="flex flex-wrap items-center gap-[5px]">
          {curso.dimensao === "presencial" && curso.no_municipio && (
            <span className="inline-flex items-center gap-[3px] rounded-[20px] border border-[#B3E0F0] bg-[#F0F9FF] px-2 py-[2px] text-[11px] font-bold text-[#005B6E]">
              <PinoLocal />
              {curso.no_municipio}
              {curso.sg_uf && `, ${curso.sg_uf}`}
              <span className="text-[9px] font-medium opacity-65">· Censo</span>
            </span>
          )}
          {curso.dimensao === "ead_polo" && (
            // Aviso de transparência de local EaD — regra 8 do CLAUDE.md
            <span className="inline-flex items-center gap-1 rounded-[20px] border border-[#FFCC80] bg-[#FFF3E0] px-[9px] py-[2px] text-[11px] font-semibold text-[#E65100]">
              <PinoLocal />
              Polos em{" "}
              {curso.qt_polos !== null ? inteiro.format(curso.qt_polos) : "—"}{" "}
              municípios
              <span className="text-[9px] font-medium opacity-65">· Censo</span>
            </span>
          )}
          {curso.dimensao === "ead_sem_local" && (
            <span className="inline-flex items-center gap-1 rounded-[20px] border border-[#FFCC80] bg-[#FFF3E0] px-[9px] py-[2px] text-[11px] font-semibold text-[#E65100]">
              <PinoLocal />
              Local não informado nas bases públicas
              <span className="text-[9px] font-medium opacity-65">· Censo</span>
            </span>
          )}
          {curso.qt_vg_total !== null && (
            <span className="rounded-[20px] border border-plum-100 bg-surface-alt px-2 py-[2px] text-[11px] font-medium text-text-muted">
              {inteiro.format(curso.qt_vg_total)} vagas
              <span className="text-[9px] opacity-65"> · Censo</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
