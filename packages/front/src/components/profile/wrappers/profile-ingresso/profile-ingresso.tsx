import { MODULE_META, type Module } from "@/lib/module";
import { Curso, Oferta } from "@/services/api";
import { Profile } from "../..";
import { Tag } from "@/components/ui/tag/tag";
import Menu from "@/components/layout/menu/menu";
import { MapPin } from "lucide-react";

interface ProfileIngressoProps {
    curso: Curso
    ofertas: Oferta[]
    module?: Module
}

export const ProfileIngresso = ({ curso, ofertas, module = '2' }: ProfileIngressoProps) => {
    const nomeCurso = curso.curso.no_curso
    const grau = curso.curso.no_grau_academico
    const titulo = `${nomeCurso} — ${grau}`
    const subtitulo = `${curso.instituicao.no_ies} · ${curso.instituicao.sg_ies}`
    const cidade = curso.localizacao.no_municipio
    const uf = curso.localizacao.sg_uf

    return (
        <Profile module={module}>
            <Profile.TopBar backLabel="Voltar para a lista" backHref="/ingressos">
                <div className="flex items-center gap-2">
                    <Tag label={"Como ingressar"} module={"2"} className="font-semibold px-[10px] py-[3px] tracking-[0.5px] mr-0" />
                    <Menu />
                </div>
            </Profile.TopBar>

            <Profile.Header
                badge={'Ingresso via Sisu'}
                title={titulo}
                subtitle={subtitulo}
                >
                <Tag label={'Tem Sisu'} module={'2'} className='py-[2px]' />
                {/*falta tag de turno da oferta de ampla + tag de <cidade>, <estado>*/}
            </Profile.Header>

            {cidade && (
                <Profile.Location
                icon={<MapPin className="size-4" />}
                eyebrow="Local de oferta"
                value={cidade}
                source="Sisu · 2026"
                tag={uf}
                module="2"
                />
            )}


        </Profile>
    )
}