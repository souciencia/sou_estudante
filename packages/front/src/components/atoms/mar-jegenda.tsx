/**
 * Átomo MarLegenda — legenda de leitura do mar do Enade, portada do
 * v21 (.mar-legenda, l.1350): as duas ondinhas (serena verde, agitada
 * vermelha) e o texto verbatim. Acréscimo desta versão: a NEBLINA na
 * mesma linguagem (traços cinza suaves, opacidades da família do
 * v21), com os dois rótulos de ausência.
 */

export default function MarLegenda() {
  return (
    <div className="mt-2 flex flex-col gap-1 text-[9.5px] text-text-muted">
      {/* Verbatim v21 */}
      <div className="flex items-center gap-[6px]">
        <svg
          viewBox="0 0 68 20"
          fill="none"
          aria-hidden="true"
          className="h-[10px] w-[34px] shrink-0"
        >
          <path
            d="M2 14 Q6 12.5 10 14 T18 14 T26 14"
            stroke="#1B8A5A"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M40 14 Q43 8 46 14 T52 14 T58 14 T64 14"
            stroke="#C0392B"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <span>
          O mar do selo traduz a faixa do conceito: sereno no 5, agitado no 1 e
          2.
        </span>
      </div>
      {/* Neblina — estado novo, mesma linguagem e família de opacidades */}
      <div className="flex items-center gap-[6px]">
        <svg
          viewBox="0 0 68 20"
          fill="none"
          aria-hidden="true"
          className="h-[10px] w-[34px] shrink-0"
        >
          <g
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity=".45"
          >
            <line x1="6" y1="8" x2="26" y2="8" />
            <line x1="2" y1="13" x2="22" y2="13" />
            <line x1="10" y1="18" x2="28" y2="18" />
          </g>
          <path
            d="M40 14 Q44 12.8 48 14 T56 14 T64 14"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            opacity=".45"
          />
        </svg>
        <span>
          Neblina indica ausência: sem avaliação no ciclo, ou sem conceito (SC).
        </span>
      </div>
    </div>
  )
}
