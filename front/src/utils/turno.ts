import { Curso } from "@/services/api";

const capitalize = (value?: string) => value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''

export function buildTurno(curso: Curso): { value: string; note?: string } {
    const temSisu = curso.sisu.tem_sisu
    let turnos: string[] = []
    
    if(temSisu) {
        const ofertas = curso.sisu.ofertas ?? [];
        const turnosUnicos = [...new Set(ofertas.map((o) => o.turno))];

        turnos = turnosUnicos.filter(Boolean).map(capitalize);
    }
    
    else {
        const censo = curso.censo_metricas

        if ((censo?.qt_vg_total_diurno ?? 0) > 0) turnos.push('Diurno')
        if ((censo?.qt_vg_total_noturno ?? 0) > 0) turnos.push('Noturno')
        if ((censo?.qt_vg_total_ead ?? 0) > 0) turnos.push('EaD')
    }

    // Caso não encontre turno nem no Sisu nem no Censo
    if (turnos.length === 0) {
        return { value: "Não informado" };
    }

    return {
        value: turnos.join(" / "),
        note: temSisu ? "Sisu 2026" : "com vagas no Censo 2024"
    };
}