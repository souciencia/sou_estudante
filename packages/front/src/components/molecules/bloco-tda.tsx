/**
 * Molécula BlocoTDA — taxa de desistência acumulada, portada do
 * .tda-detail do v21 com fidelidade total: cor ÚNICA E NEUTRA
 * #64748B (token --color-tda), NUNCA semáforo, NUNCA linguagem
 * valorativa (regra editorial 2). Os anos da coorte
 * (nu_ano_ingresso_tda → nu_ano_referencia_tda) são contexto
 * OBRIGATÓRIO — sem eles a taxa desinforma.
 *
 * REATIVADA no reprocessamento de 06/08 (carga corrigida da Ecila,
 * docs/decisoes.md). TDA 0% é taxa válida e renderiza "0%" — coorte
 * sem desistência existe; diferente da nota de corte, onde 0 é
 * ausência. Curso sem TDA: o elemento permanece, com travessão no
 * valor e barra vazia (estado de ausência DENTRO do elemento — regra
 * de fidelidade 1; mesmo tratamento do card, decisão A2/Lote 1).
 *
 * Fonte inline: "Base de Fluxo/INEP, coorte 2020–2024" — substitui o
 * rótulo "Censo" do v21 (regra editorial vence; decisão 06/08).
 * Média Brasil: referência ponderada gravada pelo pipeline no
 * manifesto; exibida apenas como "média Brasil", sem promessa de
 * precisão de coorte. A linha vertical na barra marca a média, como
 * no v21 (.tda-avg-line). O CTA do v21 para o M5 (comparação) entra
 * quando o M5 existir — divergência registrada.
 */
import type { CursoUF } from "@/lib/cursos";

const pct = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const FONTE_TDA = "Base de Fluxo/INEP, coorte 2020–2024";

interface Props {
  curso: CursoUF;
  /** Média BR ponderada (referencias do manifesto); null = sem referência. */
  mediaBr?: number | null;
}

export default function BlocoTDA({ curso, mediaBr = null }: Props) {
  const temTda = curso.tda !== null && curso.tda !== undefined;
  return (
    <div className="mb-[0.875rem] rounded-[20px] border border-plum-100 bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-text-muted">
          Desistência acumulada — 5 anos
        </div>
        <div className="font-mono text-2xl font-bold text-text">
          {temTda ? `${pct.format(curso.tda!)}%` : "—"}
        </div>
      </div>
      {/* Barra: cor única neutra do token --color-tda (#64748B).
          A linha vertical é a média Brasil (v21: .tda-avg-line). */}
      <div className="relative mb-2 h-[10px] rounded-[5px] bg-plum-100">
        {temTda && (
          <div
            className="h-full rounded-[5px]"
            style={{
              width: `${Math.min(100, Math.max(0, curso.tda!))}%`,
              background: "var(--color-tda)",
            }}
          />
        )}
        {mediaBr !== null && (
          <div
            aria-hidden
            className="absolute top-[-3px] h-4 w-[2px] rounded-[1px] bg-text-muted"
            style={{ left: `${Math.min(100, Math.max(0, mediaBr))}%` }}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-4 text-[11px] text-text-muted">
        <span>
          Este curso:{" "}
          <strong className="text-text">
            {temTda ? `${pct.format(curso.tda!)}%` : "—"}
          </strong>
        </span>
        {mediaBr !== null && (
          <span>
            Média Brasil:{" "}
            <strong className="text-text">{pct.format(mediaBr)}%</strong>
          </span>
        )}
        {temTda &&
          curso.nu_ano_ingresso_tda !== null &&
          curso.nu_ano_referencia_tda !== null && (
            <span>
              Coorte: ingressantes de{" "}
              <strong className="text-text">{curso.nu_ano_ingresso_tda}</strong>{" "}
              acompanhados até{" "}
              <strong className="text-text">
                {curso.nu_ano_referencia_tda}
              </strong>
            </span>
          )}
        <span>{FONTE_TDA}</span>
      </div>
      <div className="mt-[0.625rem] border-t border-dashed border-plum-100 pt-[0.625rem] text-[10.5px] leading-[1.55] text-text-muted">
        A taxa varia muito conforme a área — não existe valor
        &ldquo;bom&rdquo; ou &ldquo;ruim&rdquo; em si. É lado a lado com
        cursos parecidos que ela ganha sentido.
      </div>
    </div>
  );
}
