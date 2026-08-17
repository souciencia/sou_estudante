"use client";

/**
 * Molécula AvisoEstado — estados de erro e de "não encontrado", sem
 * lacuna silenciosa: mensagem honesta sobre o que falhou e caminho
 * de saída (tentar de novo / voltar). Sem linguagem valorativa.
 */

interface Props {
  titulo: string;
  mensagem: string;
  /** Rótulo + ação do botão principal (ex. tentar novamente). */
  acao?: { rotulo: string; onClick: () => void };
}

export default function AvisoEstado({ titulo, mensagem, acao }: Props) {
  return (
    <div
      role="alert"
      className="rounded-[14px] border border-plum-100 bg-surface p-4"
    >
      <div className="mb-1 text-sm font-bold text-text">{titulo}</div>
      <p className="text-xs leading-relaxed text-text-muted">{mensagem}</p>
      {acao && (
        <button
          type="button"
          onClick={acao.onClick}
          className="mt-3 inline-flex cursor-pointer items-center rounded-[10px] bg-text px-4 py-2 text-[13px] font-semibold text-white transition-transform duration-fast ease-prow active:scale-[0.97]"
        >
          {acao.rotulo}
        </button>
      )}
    </div>
  );
}
