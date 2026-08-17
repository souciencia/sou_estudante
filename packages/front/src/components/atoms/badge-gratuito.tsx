/**
 * Átomo BadgeGratuito — badge "Gratuito" do v21 (.badge-pub).
 * Renderiza APENAS quando in_gratuito === 1 (D-M2-7): nos 9 docs UFPR
 * com in_gratuito=0 (pendência Ecila) o badge não aparece; nunca
 * inferir "Pago". Cores do v21 sem token por ora (pauta Lote 2).
 */
interface Props {
  inGratuito: number | null | undefined;
}

export default function BadgeGratuito({ inGratuito }: Props) {
  if (inGratuito !== 1) return null;
  return (
    <span className="whitespace-nowrap rounded-[20px] border-[1.5px] border-[rgba(46,204,138,.3)] bg-[#E8F7F0] px-2 py-[2px] text-[10px] font-bold text-[#1B8A5A]">
      Gratuito
    </span>
  );
}
