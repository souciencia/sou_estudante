import { type Module } from "@/lib/module";
import { Curso, Oferta } from "@/services/api";
import { Profile } from "../..";
import { Tag } from "@/components/ui/tag/tag";
import Menu from "@/components/layout/menu/menu";
import { MapPin } from "lucide-react";
import { Route } from "@/components/ui/route/route";
import { Callout } from "@/components/ui/callout/callout";
import { ProfileIngressoShift } from "./profile-ingresso-shift";

interface ProfileIngressoProps {
    curso: Curso
    module?: Module
}

type OfertasPorTurno = {
    [turno: string]: Oferta[]
}

export const ProfileIngresso = ({ curso, module = '2' }: ProfileIngressoProps) => {
    const nomeCurso = curso.curso.no_curso
    const grau = curso.curso.no_grau_academico
    const titulo = `${nomeCurso} — ${grau}`
    const subtitulo = `${curso.instituicao.no_ies} · ${curso.instituicao.sg_ies}`
    const cidade = curso.localizacao.no_municipio
    const uf = curso.localizacao.sg_uf
    const ofertas = curso.sisu.ofertas

    const ofertasPorTurno = ofertas.reduce<OfertasPorTurno>((dic, oferta) => {
        const turno = oferta.turno || 'OUTROS'

        if(!dic[turno]) dic[turno] = []

        dic[turno].push(oferta)
        return dic;
        
    }, {})

    const turnosUnicos = Object.keys(ofertasPorTurno);

    return (
        <Profile module={module} className="p-4">
            <Profile.TopBar backLabel="Voltar para a lista" backHref="/ingressos" className="p-0">
                <div className="flex items-center gap-2">
                    <Tag label={"Como ingressar"} module={"2"} className="font-semibold px-[10px] py-[3px] tracking-[0.5px] mr-0" />
                    <Menu />
                </div>
            </Profile.TopBar>

            <Profile.Header
                badge={'Ingresso via Sisu'}
                title={titulo}
                subtitle={subtitulo}
                className="px-0"
                >
                <Tag label={'Tem Sisu'} module={'2'} className='py-[2px]' />
                {turnosUnicos.map((turno) => (
                    <Tag key={turno} label={turno} className='py-[2px]' />
                ))}
                {cidade && <Tag label={`${cidade}, ${uf}`} className='py-[2px]' />}
            </Profile.Header>

            {cidade && (
                <Profile.Location
                    icon={<MapPin className="size-4" />}
                    eyebrow="Local de oferta"
                    value={cidade}
                    source="Sisu · 2026"
                    tag={uf}
                    module="2"
                    variant={true}
                    className="mb-4"
                />
            )}

            {/* Card de ofertas agrupadas por turno */}
            {Object.entries(ofertasPorTurno).map(([turno, listaDeOfertas]) => {
                const temMaisDeUmTurno = Object.keys(ofertasPorTurno).length > 1;

                return (
                    <div key={turno} className="mb-4">
                        {temMaisDeUmTurno && (
                            <div className="mb-2 text-coadjuvant-xs font-bold uppercase tracking-[0.6px] text-text-muted">
                                Turno: {turno}
                            </div>
                        )}

                        <ProfileIngressoShift ofertas={listaDeOfertas} />
                    </div>
                );
            })}
            

            <span className="mt-3 flex items-start gap-2 px-1 text-coadjuvant-xs leading-[1.6] text-text-muted">
              &ldquo;Escola pública&rdquo; inclui escolas comunitárias de
              educação do campo conveniadas com o poder público. &ldquo;Baixa
              renda&rdquo; é renda familiar de até 1 salário mínimo por pessoa.
              Modalidades definidas pela Lei de Cotas (Lei nº 12.711/2012);
              reservas de vagas e bônus próprios são políticas de cada
              instituição.
            </span>

            <Callout v="info" className="bg-accent/10 border-accent/50 text-accent-deep mt-5">
                A nota de corte que você está vendo é da plataforma Sisu — e é da <strong>primeira chamada</strong>. As universidades fazem várias chamadas e esta nota <strong>tende a cair</strong>: portanto, fique atento!
                <br/>
                Se sua nota estiver próxima, vale acompanhar até o fim: <strong>a lista de espera também resulta em matrículas.</strong>
            </Callout>

            <Callout v="info" className="mt-3">
                <strong>Prazos valem vaga.</strong> Inscrição, chamadas e matrícula têm datas definidas no edital de cada universidade — perder um prazo pode significar perder a vaga. Leia o edital e acompanhe o processo até o fim.
            </Callout>

            {/* Mesmo Curso em outros locais */}

            <Profile.Section title="Continue sua rota" className="mt-1 px-0">
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