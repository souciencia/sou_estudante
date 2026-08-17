"use client";

/**
 * Átomo BotaoComoInterpretar — presente em toda tela de dados
 * (CLAUDE.md). Visual do v21 (.btn-ghost): 11px semibold, pill com
 * ícone de informação SVG inline na cor do módulo. Por ora só dispara
 * o callback recebido — o drawer vem depois.
 *
 * Motion: apenas transform/opacity, com tokens (--motion-fast /
 * --ease-prow); prefers-reduced-motion já é respeitado globalmente
 * pelos tokens.
 */

interface Props {
  /** Cor do módulo (accent) — ex. #00E5FF (M2). Usada em borda/fundo. */
  cor: string;
  /** Tom companheiro legível para o texto — ex. var(--color-m2-deep). */
  corTexto?: string;
  onClick: () => void;
}

export default function BotaoComoInterpretar({ cor, corTexto, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-[5px] rounded-[10px] border-[1.5px] px-3 py-[6px] font-sans text-[11px] font-semibold transition-transform duration-fast ease-prow active:scale-[0.97]"
      style={{
        color: corTexto ?? cor,
        background: `color-mix(in srgb, ${cor} 12%, white)`,
        borderColor: `color-mix(in srgb, ${cor} 45%, white)`,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M6 5.5V8.5M6 3.2V4.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      Como interpretar?
    </button>
  );
}
