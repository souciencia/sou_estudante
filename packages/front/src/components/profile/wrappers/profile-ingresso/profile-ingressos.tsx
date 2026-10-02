import type { Module } from "@/lib/module";
import { Curso, Oferta } from "@/services/api";
import { Profile } from "../..";
import { Tag } from "@/components/ui/tag/tag";
import Menu from "@/components/layout/menu/menu";

interface ProfileIngressosProps {
    curso: Curso
    ofertas: Oferta[]
    module?: Module
}

export const ProfileIngressos = ({ curso, ofertas, module = '2' }: ProfileIngressosProps) => {
    const nomeCurso = curso.curso.no_curso
    const grau = curso.curso.no_grau_academico
    const titulo = `{nomeCurso} — {grau}`
    const subtitulo = `{curso.instituicao.no_ies} · {curso.instituicao.sg_ies}`
    const cidade = curso.localizacao.no_municipio
    const uf = curso.localizacao.sg_uf

    return (
        <Profile module={module}>
            <Profile.TopBar backLabel="Voltar para a lista" backHref="/ingressos">
                <div className="flex items-center gap-2">
                    <Tag label={"Como ingressar"} module={"2"} className="font-semibold" />
                    <Menu />
                </div>
            </Profile.TopBar>


        </Profile>
    )
}