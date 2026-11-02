import Link from 'next/link'
import { cn } from '@/utils/cn'

const H2 = 'font-display text-lg font-bold text-fg'

const P = 'font-sans text-base leading-[1.7] text-fg'

export default function MetodologiaPage() {
  return (
    <div className="mx-auto w-full max-w-pages px-4 py-6 bg-surface-lv1 rounded-b-callout">
      <article className="mx-auto max-w-3xl">
        <div>
          <span className="text-2xs text-fg-muted font-bold tracking-[0.7px]">
            SoU_Estudante
          </span>
          <h1 className="font-sans text-display font-bold leading-[1.08] tracking-[-0.02em] text-fg mt-4">
            Metodologia
          </h1>
          <p className="mt-2 font-sans text-base text-fg-muted">
            De onde vêm os dados, como lemos cada número e o que eles não
            mostram.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8">
          <section>
            <h2 className={H2}>Princípios</h2>
            <p className={P}>
              Três regras valem em toda a plataforma. Cada informação traz a
              fonte e o ano de referência ao lado. Nenhum indicador é somado a
              outro para formar nota ou ranking. Quando um dado não existe para
              um curso, dizemos isso em vez de preencher o espaço.
            </p>
          </section>

          <section>
            <h2 className={H2}>Fontes e anos de referência</h2>
            <p className={P}>Nesta edição, a plataforma usa:</p>
            <div className="mt-3 mb-3 bg-white rounded-panel p-4 border border-border-primary mr-8">
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong className="font-semibold text-fg">
                    Censo da Educação Superior 2024
                  </strong>{' '}
                  (Inep): cursos, vagas, matrículas, modalidade, local de
                  oferta, polos de EaD, corpo docente, bolsas, financiamento e
                  apoios aos estudantes.
                </li>
                <li>
                  <strong className="font-semibold text-fg">Sisu 2026</strong>{' '}
                  (MEC): vagas, modalidades de concorrência e nota do último
                  candidato classificado na chamada regular.
                </li>
                <li>
                  <strong className="font-semibold text-fg">
                    Enade ciclo 2021–2023
                  </strong>{' '}
                  (Inep): Conceito Enade do ciclo mais recente de cada área.
                </li>
                <li>
                  <strong className="font-semibold text-fg">
                    Base de Fluxo/INEP, coorte 2020–2024
                  </strong>
                  : taxa de desistência acumulada, por turma de ingresso
                  acompanhada.
                </li>
                <li>
                  <strong className="font-semibold text-fg">
                    Cadastro e-MEC
                  </strong>{' '}
                  (MEC): identificação dos cursos e das instituições.
                </li>
              </ul>
            </div>
            <p className={cn('mt-4', P)}>
              Cada base tem calendário próprio. O Censo é publicado com cerca de
              dois anos de defasagem, por isso vagas, docentes e polos refletem
              2024, não o ano corrente. O Sisu é anual. O Enade avalia cada área
              a cada três anos.
            </p>
          </section>

          <section>
            <h2 className={H2}>Cursos e vagas</h2>
            <p className={P}>
              Um curso é uma oferta de graduação de uma instituição, em um
              município e uma modalidade, como registrado no Censo. As vagas são
              as oferecidas no ano do Censo. Para cursos a distância, mostramos
              os municípios com polo registrados no Censo; o endereço de cada
              polo não consta nas bases públicas, por isso indicamos a
              confirmação no site da instituição.
            </p>
          </section>

          <section>
            <h2 className={H2}>Taxa de desistência</h2>
            <p className={P}>
              A taxa de desistência acumulada mostra a proporção dos
              ingressantes de um mesmo ano que deixaram o curso ao longo de
              cinco anos de acompanhamento. Ela vem dos indicadores de fluxo do
              Inep e aparece sempre com o ano de ingresso da turma acompanhada.
              A desistência varia muito entre áreas; a comparação faz sentido
              entre cursos semelhantes. A linha “Média Brasil” do comparador é a
              média das taxas publicadas, ponderada pelo número de matriculados
              de cada curso.
            </p>
          </section>

          <section>
            <h2 className={H2}>Conceito Enade</h2>
            <p className={P}>
              O Enade avalia o desempenho dos estudantes concluintes em relação
              aos conteúdos e às competências previstos para o curso. A partir
              dos resultados, o Inep calcula o Conceito Enade, de 1 a 5. Como as
              áreas são avaliadas em anos diferentes, mostramos o ciclo mais
              recente de cada curso, com o ano indicado. Um curso pode não ter
              conceito por não ter sido avaliado no ciclo ou por não ter
              concluintes suficientes para o cálculo (Sem conceito, SC). O
              Conceito Enade é um dos indicadores sobre o curso e não deve ser
              lido, sozinho, como medida de qualidade.
            </p>
          </section>

          <section>
            <h2 className={H2}>Ingresso pelo Sisu</h2>
            <p className={P}>
              A Bússola mostra os cursos com vagas ofertadas na edição do Sisu
              carregada no painel (Sisu 2026): vagas por modalidade de
              concorrência e a nota do último candidato classificado na chamada
              regular. Essa nota é uma referência de edições anteriores, não uma
              previsão. Nem todas as vagas das instituições públicas passam pelo
              Sisu; as demais formas de ingresso estão nos sites das
              instituições. As modalidades de concorrência seguem a
              classificação da própria base do Sisu.
            </p>
          </section>

          <section>
            <h2 className={H2}>Apoios à permanência</h2>
            <p className={P}>
              A Âncora usa o Censo para contar, em cada curso, quantos
              estudantes receberam ProUni, usaram Fies, ingressaram por reserva
              de vagas, tiveram apoio social ou participaram de atividades
              extracurriculares. Bolsas, financiamento e reserva de vagas são
              contados entre os ingressantes do ano; apoio social e atividades
              extracurriculares, entre os matriculados. As proporções nunca
              misturam as duas bases. Em grupos com menos de dez estudantes
              mostramos só o número absoluto, porque percentuais sobre bases
              pequenas distorcem a leitura. Zero significa que não houve
              beneficiário registrado — o que não quer dizer que a instituição
              não ofereça o apoio.
            </p>
          </section>

          <section>
            <h2 className={H2}>Instituições e corpo docente</h2>
            <p className={P}>
              O Telescópio mostra o número de estudantes matriculados na
              graduação, o número de cursos e o perfil de titulação dos docentes
              de cada instituição, segundo o Censo. Cada docente é contado uma
              vez, na sua titulação mais alta. O endereço registrado no Censo é
              o da sede administrativa, não o dos cursos; o local de oferta é
              informação de cada curso.
            </p>
          </section>

          <section>
            <h2 className={H2}>Limitações conhecidas</h2>
            <div className="mt-3 bg-white rounded-panel p-4 border border-border-primary mr-8">
              <ul className="list-disc space-y-1.5 pl-5">
                <li className={P}>
                  O endereço exato dos polos de EaD não está nas bases públicas;
                  mostramos apenas os municípios.
                </li>
                <li className={P}>
                  Cursos a distância com polos em mais de um estado podem
                  aparecer mais de uma vez na lista de cursos, uma por estado.
                  Esse comportamento está em correção.
                </li>
                <li className={P}>
                  A unidade dos dados de apoio social e atividade
                  extracurricular está em conferência com a equipe de dados; os
                  cartões mostram números absolutos.
                </li>
                <li className={P}>
                  A nota de corte do Sisu refere-se à chamada regular; chamadas
                  seguintes e lista de espera podem ter notas diferentes.
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className={H2}>Atualização</h2>
            <p className={P}>
              A plataforma é atualizada a cada nova divulgação das bases: Censo
              e Enade pelo Inep, Sisu pelo MEC. A versão dos dados em uso
              aparece nesta página e no ano ao lado de cada informação. Esta é
              uma versão Beta: textos e indicadores podem mudar com o retorno
              dos usuários.
            </p>
            <p className={cn('mt-3 mb-4', P)}>
              Quem faz a plataforma e sob que licenças está na página{' '}
              <Link
                href="/sobre"
                className="text-accent-deep underline underline-offset-2 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
              >
                Sobre
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  )
}
