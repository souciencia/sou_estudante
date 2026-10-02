import { MODULE_META, type Module } from "@/lib/module";
import { Curso, Oferta } from "@/services/api";
import { Profile } from "../..";
import { Tag } from "@/components/ui/tag/tag";
import Menu from "@/components/layout/menu/menu";
import { MapPin } from "lucide-react";
import { Route } from "@/components/ui/route/route";
import { Callout } from "@/components/ui/callout/callout";

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

            {/* Card de ofertas */}

            {/* Texto "“Escola pública” inclui..." */}

            <Callout v="info" className="bg-accent/10 border-accent/50 text-accent-deep mt-5 mx-4">
                A nota de corte que você está vendo é da plataforma Sisu — e é da <strong>primeira chamada</strong>. As universidades fazem várias chamadas e esta nota <strong>tende a cair</strong>: portanto, fique atento!
                <br/>
                Se sua nota estiver próxima, vale acompanhar até o fim: <strong>a lista de espera também resulta em matrículas.</strong>
            </Callout>

            <Callout v="info" className="mt-3 mx-4">
                <strong>Prazos valem vaga.</strong> Inscrição, chamadas e matrícula têm datas definidas no edital de cada universidade — perder um prazo pode significar perder a vaga. Leia o edital e acompanhe o processo até o fim.
            </Callout>

            {/* Mesmo Curso em outros locais */}

            <Profile.Section title="Continue sua rota" className="mt-1">
                <Route
                    module="3"
                    variant="inline"
                    title="Vou conseguir me manter?"
                    description="Bolsas, cotas e apoios à permanência — Âncora"
                />
                <Route
                    module="4"
                    variant="inline"
                    title="Conheça a instituição"
                    description="Indicadores oficiais e perfil da IES — Telescópio"
                />
            </Profile.Section>


        </Profile>
    )
}