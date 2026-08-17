/**
 * Átomo NotaCorte — valor de nota de corte em DM Mono, sempre com duas
 * casas decimais (vírgula pt-BR).
 *
 * Travessão — quando nula, zero ou negativa (decisão 2026-07-30):
 * nota de corte 0 não existe na semântica do Sisu — significa que
 * nenhuma nota de corte se formou na modalidade. A regra é SÓ de
 * exibição: o pipeline nunca altera o dado bruto da Ecila.
 * Sem texto explicativo no item (regra 6); os dois casos (sem dado /
 * nota não formada) serão explicados no drawer "Como interpretar?".
 *
 * Variantes do v21: "destaque" (score-block, 2.3rem + "pts") e
 * "linha" (cota-item, 1rem).
 */

const formato = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface Props {
  valor: number | null;
  variante?: "destaque" | "linha";
}

export default function NotaCorte({ valor, variante = "linha" }: Props) {
  const destaque = variante === "destaque";
  const semNota = valor === null || valor === undefined || valor <= 0;
  if (semNota) {
    return (
      <span
        className={
          destaque
            ? "font-mono text-[2.3rem] font-bold leading-none text-text-muted"
            : "font-mono text-base font-bold text-text-muted"
        }
      >
        —
      </span>
    );
  }
  return (
    <span
      className={
        destaque
          ? "font-mono text-[2.3rem] font-bold leading-none text-text"
          : "font-mono text-base font-bold text-text"
      }
    >
      {formato.format(valor)}
      {destaque && (
        <small className="font-sans text-[0.9rem] font-normal text-text-muted">
          {" "}
          pts
        </small>
      )}
    </span>
  );
}
