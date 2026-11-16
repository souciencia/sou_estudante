import Link from 'next/link'
import { cn } from '@/utils/cn'

const H2 = 'font-display text-lg font-bold text-fg'

const P = 'font-sans text-base leading-[1.7] text-fg'

export default function SobrePage() {
  return (
    <div className="mx-auto w-full max-w-home px-3 py-8 bg-surface-lv1 rounded-b-callout">
      <article className="mx-auto max-w-2xl">
        <header>
          <h1 className="font-sans text-display font-bold leading-[1.08] tracking-[-0.02em] text-fg">
            Sobre
          </h1>
          <p className="mt-2 font-sans text-base text-fg-muted">
            Um mapa do ensino superior brasileiro feito para quem está
            escolhendo onde estudar.
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-8">
          <section>
            <h2 className={H2}>O que é</h2>
            <p className={P}>
              O SoU_Estudante reúne, em um só lugar, informações públicas sobre
              cursos e instituições de ensino superior no Brasil: vagas, formas
              de ingresso, apoios à permanência, avaliação e perfil das
              instituições. Os dados existem há anos, espalhados em bases
              oficiais que poucos estudantes conhecem. Aqui eles aparecem
              organizados a partir das perguntas de quem decide: que curso,
              onde, como entrar, como ficar.
            </p>
            <p className={cn('mt-3', P)}>
              A plataforma foi pensada para estudantes que são os primeiros da
              família a chegar à universidade e que, por isso, contam menos com
              a experiência de quem veio antes. Ela não indica um melhor curso
              nem monta rankings. Mostra o que os dados dizem, de onde eles vêm
              e de que ano são — e deixa a escolha com você.
            </p>
          </section>

          <section>
            <h2 className={H2}>Quem faz</h2>
            <p className={P}>
              O SoU_Estudante é um produto do SoU_Ciência — Centro de Estudos
              Sociedade, Universidade e Ciência, think tank vinculado à
              Universidade Federal de São Paulo (Unifesp). Criado em 2021, o
              Centro reúne pesquisadores de diferentes campi da Unifesp e de
              outras universidades brasileiras que estudam as políticas de
              educação superior, ciência e tecnologia: sua expansão, seu
              financiamento e seu impacto social.
            </p>
            <p className={cn('mt-3', P)}>
              A plataforma é construída por uma equipe de pesquisa, dados,
              design e desenvolvimento do Centro. Ela faz parte do painel
              Expansão do Ensino Superior Privado e segue os princípios do
              SoU_Ciência: ciência aberta, dados transparentes e divulgação
              científica que aproxima a universidade da sociedade.
            </p>
          </section>

          <section>
            <h2 className={H2}>Dados e licenças</h2>
            <p className={P}>
              Todos os dados vêm de fontes públicas do governo federal: Censo da
              Educação Superior e Enade, do Inep; Sisu, do Ministério da
              Educação; e cadastro e-MEC. A página{' '}
              <Link
                href="/metodologia"
                className="text-accent-deep underline underline-offset-2 transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
              >
                Metodologia
              </Link>{' '}
              explica como cada informação é lida e quais são seus limites.
            </p>
            <p className={cn('mt-3', P)}>
              O código da plataforma é aberto, sob licença MIT. Os dados
              tratados e os textos estão sob licença Creative Commons BY 4.0:
              podem ser reutilizados, inclusive comercialmente, desde que a
              fonte seja citada.
            </p>
          </section>

          <section>
            <h2 className={H2}>Como colaborar</h2>
            <p className={P}>
              Encontrou um erro, uma informação desatualizada ou algo difícil de
              entender? Escreva para o SoU_Ciência. A plataforma está em versão
              Beta e melhora com o retorno de quem a usa.
            </p>
            <a
              href="https://souciencia.unifesp.br"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center rounded-full bg-fg px-4 py-2 font-sans text-sm font-semibold text-on-dark transition-colors hover:bg-fg/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-deep"
            >
              Falar com o SoU_Ciência
            </a>
          </section>
        </div>
      </article>
    </div>
  )
}
