/**
 * Molécula LinhaModalidade — uma modalidade de concorrência do card de
 * oferta, no visual do v21 (.cota-item): nome por extenso + descrição
 * à esquerda; nota (NotaCorte) e vagas à direita (inscritos não são
 * exibidos — D-M2-2).
 *
 * Dois estados de nota (D-M2-6): null = modalidade não ofertada —
 * estilo "vazia" (borda tracejada), sem vagas nem texto (regra 6);
 * zero = ofertada sem nota formada nesta chamada — borda sólida,
 * vagas visíveis, microtexto "sem nota nesta chamada".
 */
import NotaCorte from "@/components/atoms/nota-corte";

const inteiro = new Intl.NumberFormat("pt-BR");

interface Props {
  /** Nome por extenso — nunca código (regra 6). */
  nome: string;
  descricao?: string | null;
  vagas: number | null;
  nota: number | null;
  /** Microtexto sob a nota (herança do bônus, D-M2-1). */
  microtexto?: string | null;
  /** Suprime vagas — grupo B (D-M2-1: qt_vagas=0 nos 24 docs; o bônus
      concorre pelas vagas da ampla e "0 vagas" induziria erro). */
  ocultarVagas?: boolean;
}

export default function LinhaModalidade({
  nome,
  descricao,
  vagas,
  nota,
  microtexto,
  ocultarVagas = false,
}: Props) {
  const vazia = nota === null || nota === undefined;
  // Gatilho estrito === 0: nota negativa não é estado de exibição, é
  // anomalia de triagem (parada obrigatória) — o travessão do átomo
  // NotaCorte a cobre até a triagem decidir.
  const semNotaFormada = nota === 0;
  // Precedência microtexto-bônus > microtexto-zero: decisão consciente
  // para o caso teórico B1 × nota zero (inexistente na carga 13/08).
  const texto =
    microtexto ?? (semNotaFormada ? "sem nota nesta chamada" : null);
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-[14px] border p-3 ${
        vazia
          ? "border-dashed border-plum-100 bg-surface-alt"
          : "border-plum-100 bg-surface"
      }`}
    >
      <div>
        <div className="mb-px text-xs font-bold text-text">{nome}</div>
        {descricao && (
          <div className="text-[10px] text-text-muted">{descricao}</div>
        )}
      </div>
      <div className="text-right">
        <NotaCorte valor={nota} />
        {!vazia && !ocultarVagas && vagas !== null && (
          <div className="font-mono text-[10px] text-text-muted">
            {inteiro.format(vagas)} {vagas === 1 ? "vaga" : "vagas"}
          </div>
        )}
        {texto && <div className="text-[9px] text-text-muted">{texto}</div>}
      </div>
    </div>
  );
}
