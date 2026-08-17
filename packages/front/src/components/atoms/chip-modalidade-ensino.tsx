/**
 * Átomo ChipModalidadeEnsino — modalidade de ensino do curso no card
 * do M1. "Presencial" no estilo tag neutro; EaD no badge roxo do v21
 * (.badge-ead), com a contagem de polos quando houver (qt_polos).
 * EaD sem local informado (dim 4) declara a ausência — sem lacuna
 * silenciosa.
 */
import type { CursoUF } from "@/lib/cursos";

interface Props {
  dimensao: CursoUF["dimensao"];
  qtPolos: number | null;
}

export default function ChipModalidadeEnsino({ dimensao, qtPolos }: Props) {
  if (dimensao === "presencial") {
    return (
      <span className="whitespace-nowrap rounded-[20px] border border-plum-100 bg-surface-alt px-2 py-[2px] text-[10px] font-bold text-text-muted">
        Presencial
      </span>
    );
  }
  const texto =
    dimensao === "ead_polo" && qtPolos !== null
      ? `EaD · ${qtPolos.toLocaleString("pt-BR")} ${qtPolos === 1 ? "polo" : "polos"}`
      : "EaD · local não informado";
  return (
    <span className="whitespace-nowrap rounded-[20px] border-[1.5px] border-[#CE93D8] bg-[#F3E5F5] px-2 py-[2px] text-[10px] font-bold text-[#7B1FA2]">
      {texto}
    </span>
  );
}
