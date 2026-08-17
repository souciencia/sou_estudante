/**
 * Átomo ChipTemSisu — badge "Tem Sisu" / "Não usa Sisu" do v21
 * (.badge-sisu / .badge-vest). Regra 6: instituições fora do Sisu são
 * "Não usa Sisu" — nunca citar FUVEST ou outros exames.
 */

interface Props {
  temSisu: boolean;
}

export default function ChipTemSisu({ temSisu }: Props) {
  if (!temSisu) {
    return (
      <span className="whitespace-nowrap rounded-[20px] border-[1.5px] border-plum-100 bg-surface-alt px-2 py-[2px] text-[10px] font-bold text-text-muted">
        Não usa Sisu
      </span>
    );
  }
  return (
    <span
      className="whitespace-nowrap rounded-[20px] border-[1.5px] px-2 py-[2px] text-[10px] font-bold text-m2-deep"
      style={{
        background: "color-mix(in srgb, var(--color-m2-accent) 12%, white)",
        borderColor: "color-mix(in srgb, var(--color-m2-accent) 45%, white)",
      }}
    >
      Tem Sisu
    </span>
  );
}
