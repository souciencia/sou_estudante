/**
 * Átomo Esqueleto — bloco de carregamento. Motion só de opacity
 * (classe .esqueleto em globals.css, easing --ease-tide dos tokens;
 * prefers-reduced-motion respeitado globalmente).
 */

interface Props {
  /** Classes de dimensão/raio (ex. "h-4 w-40"). */
  className?: string;
}

export default function Esqueleto({ className = "" }: Props) {
  return <div aria-hidden className={`esqueleto ${className}`} />;
}

/** Skeleton com o formato de um card de oferta da lista. */
export function EsqueletoCard() {
  return (
    <div className="rounded-[20px] border-[1.5px] border-plum-100 bg-surface p-4">
      <Esqueleto className="mb-2 h-4 w-3/5" />
      <Esqueleto className="mb-3 h-3 w-2/5" />
      <div className="flex gap-2">
        <Esqueleto className="h-5 w-16" />
        <Esqueleto className="h-5 w-20" />
        <Esqueleto className="h-5 w-24" />
      </div>
    </div>
  );
}
