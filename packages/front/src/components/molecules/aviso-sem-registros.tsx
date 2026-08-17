/**
 * Molécula AvisoSemRegistros — estado de tela vazia do M3 (D-M3-A):
 * elemento NOVO, fora do contrato visual do v21 (extensão registrada;
 * regra editorial 5 vence). O chamador decide com telaVazia(doc) —
 * colunas em estado na ficam FORA do teste (precisão 13/08); os
 * cartões permanecem abaixo, cada um com seu estado. Título distinto
 * da copy do estado zero dos cartões (ajuste aprovado 13/08).
 */
interface Props {
  ano: number | null;
}

export default function AvisoSemRegistros({ ano }: Props) {
  return (
    <div className="mb-4 rounded-[20px] border border-plum-100 bg-surface-alt p-4">
      <div className="mb-1 text-[13px] font-bold text-text">
        Sem beneficiários registrados neste curso
        {ano !== null ? ` em ${ano}` : ""}
      </div>
      <p className="text-[12px] leading-[1.55] text-text-muted">
        Nas turmas de referência deste curso, nenhum dos apoios, bolsas ou
        reservas desta tela teve beneficiário registrado. Zero também é
        informação — os cartões abaixo detalham cada base.
      </p>
    </div>
  );
}
