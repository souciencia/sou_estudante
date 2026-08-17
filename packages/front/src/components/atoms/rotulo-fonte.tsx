/**
 * Átomo RotuloFonte — pill de fonte inline em todo dado exibido
 * (regra editorial 5). Rótulos padronizados: "Censo" e "Sisu" — SEM
 * ano: o contexto temporal vive no drawer "Como interpretar?"
 * (decisão do v21, regra do CLAUDE.md).
 * Visual do v21 (.sb-fonte): pill 10px com ícone de informação, nas
 * cores claras do módulo — derivadas do accent via color-mix.
 */

interface Props {
  /** Rótulo padronizado da fonte: "Sisu" ou "Censo". */
  fonte: string;
  /** Cor do módulo (accent) — ex. var(--color-m2-accent) ou #00E5FF. */
  cor?: string;
  /** Tom companheiro legível para o texto — ex. var(--color-m2-deep). */
  corTexto?: string;
}

export default function RotuloFonte({ fonte, cor, corTexto }: Props) {
  const accent = cor ?? "var(--color-m2-accent)";
  const texto = corTexto ?? "var(--color-text-muted)";
  return (
    <span
      className="inline-flex items-center gap-[5px] rounded-[20px] border px-[9px] py-[2px] text-[10px]"
      style={{
        color: texto,
        background: `color-mix(in srgb, ${accent} 12%, white)`,
        borderColor: `color-mix(in srgb, ${accent} 45%, white)`,
      }}
    >
      <svg viewBox="0 0 10 10" fill="none" width="10" height="10" aria-hidden>
        <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
        <path
          d="M5 4.5V7M5 2.8V3.8"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      {fonte}
    </span>
  );
}
