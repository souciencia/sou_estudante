/**
 * Molécula PonteM3 — bridge "Continue sua rota" → M3 Âncora
 * (.rota-next/.bridge do v21, 1357–1367 e 1596–1606; D-M3-10).
 * Ícone âncora simplificado sobre o quadrado rosa 40px do v21
 * (fidelidade do glifo na auditoria visual do Lote 2).
 */
import Link from "next/link";

interface Props {
  titulo: string;
  subtitulo: string;
  href: string;
}

export default function PonteM3({ titulo, subtitulo, href }: Props) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center gap-[5px] text-[9px] font-bold uppercase tracking-[0.7px] text-text-muted">
        <svg viewBox="0 0 12 12" fill="none" width="12" height="12" aria-hidden>
          <path
            d="M2 9 Q4 4 6 6 T10 3"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        Continue sua rota
      </div>
      <Link
        href={href}
        className="flex w-full cursor-pointer items-center gap-[0.875rem] rounded-[20px] border border-plum-100 bg-surface p-4 text-left transition-transform duration-fast ease-prow active:scale-[0.99]"
      >
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[8px] bg-[#FF67BE]">
          <svg viewBox="0 0 13 13" fill="none" width="18" height="18" aria-hidden>
            <path
              d="M6.5 1.5V11M6.5 11C6.5 11 3 9.5 3 6.5M6.5 11C6.5 11 10 9.5 10 6.5M4.5 3.5H8.5"
              stroke="#1A0E23"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="6.5" cy="2.2" r="1.2" stroke="#1A0E23" strokeWidth="1.1" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-text">{titulo}</span>
          <span className="block text-[11px] text-text-muted">{subtitulo}</span>
        </span>
        <svg
          viewBox="0 0 16 16"
          fill="none"
          width="16"
          height="16"
          aria-hidden
          className="shrink-0 text-text-muted"
        >
          <path
            d="M4 8H12M9 5L12 8L9 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}
