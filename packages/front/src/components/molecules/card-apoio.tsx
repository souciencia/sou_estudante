/**
 * Molécula CardApoio — .ap-card do v21 (linhas 516–542), coração do
 * M3. Estados resolvidos em src/lib/apoio.ts. Extensões registradas:
 * desdobramento do ProUni na linha de valor (D-M3-3); estados
 * absolutos sem barra nem % (D-M3-1 piso, D-M3-B suspensão);
 * base_ausente declara a base que falta (D-M3-9). Copy do estado
 * zero verbatim do v21. Fonte inline "Censo · {ano}" (D-M3-9).
 * Cores do v21 sem token por ora (pauta Lote 2), como BadgeGratuito.
 */
import type { ReactNode } from "react";
import {
  larguraBarra,
  percentualApoio,
  resolverEstadoApoio,
} from "@/lib/apoio";

type TipoApoio = "bolsa" | "financiamento" | "reserva" | "permanencia";

/* Tags e barras: literais do v21 (:root 14–20 e 488; pauta Lote 2). */
const TAG: Record<TipoApoio, { rotulo: string; bg: string; cor: string }> = {
  bolsa: { rotulo: "Bolsa", bg: "#E8F7F0", cor: "#1B8A5A" },
  financiamento: { rotulo: "Financiamento", bg: "#FFF3E0", cor: "#B06000" },
  reserva: { rotulo: "Reserva de vagas", bg: "#FCE4EC", cor: "#C2185B" },
  permanencia: { rotulo: "Permanência", bg: "#E0F7FA", cor: "#0097A7" },
};
const BARRA: Record<TipoApoio, string> = {
  bolsa: "#2ECC8A",
  financiamento: "#FFA000",
  reserva: "#FF67BE",
  permanencia: "#FF67BE",
};

interface Props {
  nome: string;
  tipo: TipoApoio;
  /** Sobrescreve o rótulo da tag (v21: "Integral ou parcial" etc.). */
  tag?: string;
  valor: number | null;
  base: number | null;
  baseRotulo: "ingressantes" | "matriculados";
  ano: number | null;
  descricao?: ReactNode;
  /** Estado não-se-aplica — só bolsas em curso gratuito (D-M3-2). */
  naTexto?: string;
  /** ProUni (D-M3-3): ex. "7 integrais · 3 parciais". */
  desdobramento?: string;
  /** D-M3-B: apoios sem % nem barra até resposta Ecila. */
  proporcaoSuspensa?: boolean;
  /** Slot pós-descrição (Painel de Cotas na Fase 3 — D-M3-8). */
  linkExtra?: ReactNode;
}

const num = new Intl.NumberFormat("pt-BR");

export default function CardApoio(props: Props) {
  const estado = resolverEstadoApoio(props);
  const t = TAG[props.tipo];
  const tag = (
    <span
      className="whitespace-nowrap rounded-[20px] px-[7px] py-[2px] text-[9px] font-bold uppercase tracking-[0.4px]"
      style={{ background: t.bg, color: t.cor }}
    >
      {props.tag ?? t.rotulo}
    </span>
  );
  const fonte = (
    <div className="mt-2 flex items-center gap-[6px] text-[10px] text-text-muted">
      <svg viewBox="0 0 10 10" fill="none" width="10" height="10" aria-hidden>
        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
        <path
          d="M5 4.5V7M5 2.8V3.8"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      Censo{props.ano !== null ? ` · ${props.ano}` : ""}
    </div>
  );

  if (estado === "na") {
    return (
      <div className="mb-3 rounded-[20px] border border-dashed border-plum-100 bg-surface-alt p-[1.125rem]">
        <div className="mb-[0.625rem] flex items-start justify-between gap-3">
          <div className="text-[14px] font-bold text-text">{props.nome}</div>
          {tag}
        </div>
        <div className="flex items-start gap-[7px] text-[12px] leading-[1.5] text-text-muted">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            width="15"
            height="15"
            aria-hidden
            className="mt-[1px] shrink-0"
          >
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="8" y1="5" x2="8" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="8" cy="11.2" r="0.9" fill="currentColor" />
          </svg>
          <span>{props.naTexto}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-[20px] border border-plum-100 bg-surface p-[1.125rem]">
      <div className="mb-[0.625rem] flex items-start justify-between gap-3">
        <div className="text-[14px] font-bold text-text">{props.nome}</div>
        {tag}
      </div>

      {estado === "sem_dado" && (
        <div className="mb-2 font-mono text-[1.35rem] font-bold leading-none text-text">
          —
        </div>
      )}

      {estado === "base_ausente" && (
        <>
          <div className="mb-1 font-mono text-[1.35rem] font-bold leading-none text-text">
            —
          </div>
          <div className="mb-2 text-[13px] font-semibold text-text-muted">
            Sem {props.baseRotulo} registrados
            {props.ano !== null ? ` em ${props.ano}` : ""} — não há base para
            calcular a proporção
          </div>
        </>
      )}

      {estado === "zero" && (
        <div className="mb-[0.375rem] text-[13px] font-semibold text-text-muted">
          Nenhum beneficiário registrado
          {props.ano !== null ? ` em ${props.ano}` : ""}
        </div>
      )}

      {(estado === "absoluto" || estado === "proporcao") && (
        <>
          <div className="mb-2 font-mono text-[1.35rem] font-bold leading-none text-text">
            {num.format(props.valor!)}{" "}
            <small className="font-sans text-[12px] font-medium text-text-muted">
              de {num.format(props.base!)} {props.baseRotulo}
              {estado === "proporcao" &&
                ` · ${percentualApoio(props.valor!, props.base!)}`}
            </small>
          </div>
          {props.desdobramento && (
            <div className="mb-2 text-[11px] text-text-muted">
              {props.desdobramento}
            </div>
          )}
          {estado === "proporcao" && (
            <div className="mb-2 h-[9px] overflow-hidden rounded-[5px] bg-plum-100">
              <div
                className="h-full rounded-[5px]"
                style={{
                  width: `${larguraBarra(props.valor!, props.base!)}%`,
                  background: BARRA[props.tipo],
                }}
              />
            </div>
          )}
        </>
      )}

      {props.descricao && (
        <div className="mb-1 text-[11.5px] leading-[1.55] text-text-muted">
          {props.descricao}
        </div>
      )}
      {fonte}
      {props.linkExtra}
    </div>
  );
}
