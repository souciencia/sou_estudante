export type HelpBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'definition'; term: string; text: string }

export interface HelpItem {
  question: string
  blocks: HelpBlock[]
  /** Fonte e ano de referência, exibidos como legenda. */
  source?: string
  /** Ilustração exibida após a explicação (ex.: capturas de tela). */
  image?: {
    src: string
    alt: string
    width: number
    height: number
  }
}

export interface HelpSection {
  /** Título da seção (ex.: "Como interpretar esses dados"). */
  title?: string
  /** Parágrafo introdutório da seção. */
  intro?: string
  /** Lista de tópicos sem pergunta (ex.: dicas de como pesquisar). */
  bullets?: string[]
  /** Perguntas e respostas da seção. */
  items?: HelpItem[]
}

export const SEARCH_HELP_CONTENT: HelpSection[] = [
  {
    title: 'Como pesquisar',
    bullets: [
      'Busque pelo nome do curso: os resultados aparecem a partir de 5 letras digitadas.',
      'Refine com os filtros por estado, município, turno, grau acadêmico, categoria, modalidade, Conceito Enade e ingresso.',
      'Ative "Mostrar resultados parecidos" para incluir cursos com nome semelhante; desligado, a busca é por nome exato.',
      'Ordene por Maior Enade, Menor desistência ou ordem alfabética.',
    ],
  },
  {
    title: 'Você pode comparar cursos',
    intro:
      'Você pode colocar até 5 cursos lado a lado para comparar indicadores como taxa de desistência e Conceito Enade.',
    items: [
      {
        question: 'Como incluir um curso na comparação?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Na lista de resultados, cada curso tem um interruptor "Incluir na comparação". Ative-o nos cursos que quiser comparar.',
          },
        ],
        image: {
          src: '/img/comparar-incluir-resultado.png',
          alt: 'Interruptor "Incluir na comparação" em um resultado de busca de cursos.',
          width: 2000,
          height: 900,
        },
      },
      {
        question: 'Quando o botão Comparar aparece?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Assim que você seleciona dois ou mais cursos, uma barra de comparação aparece na página de busca com o botão "Comparar". Ele abre a página que coloca os cursos lado a lado.',
          },
        ],
        image: {
          src: '/img/comparar-botao.png',
          alt: 'Barra de comparação com o botão "Comparar" mostrando os cursos selecionados.',
          width: 2438,
          height: 806,
        },
      },
      {
        question: 'Como incluir pela página do curso?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Também dá para incluir um curso na comparação pelo botão "Comparar" dentro do perfil do curso. Quando o curso já está selecionado, o rótulo muda para "Na comparação".',
          },
        ],
        image: {
          src: '/img/comparar-incluir-perfil.png',
          alt: 'Botão "Comparar" dentro do perfil de um curso.',
          width: 1470,
          height: 800,
        },
      },
    ],
  },
  {
    title: 'Como interpretar esses dados',
    intro:
      'Cada métrica tem uma fonte e um ano de referência. Entender as diferenças evita leituras equivocadas.',
    items: [
      {
        question: 'Por que os dados são de anos diferentes?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Cada fonte é atualizada em um momento diferente. Por isso, você verá anos de referência diferentes no painel. Confira sempre o ano mostrado ao lado de cada informação. Nesta edição do painel: Censo da Educação Superior 2024, Sisu 2026, Enade ciclo 2021–2023 e cadastro e-MEC 2026. O Censo é publicado com cerca de dois anos de defasagem: vagas, docentes e municípios de polo refletem 2024, não o ano corrente.',
          },
        ],
      },
      {
        question: 'O que significa o Conceito Enade?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'O Enade avalia o desempenho dos estudantes concluintes em relação aos conteúdos e às competências previstos para o curso. A partir dos resultados, o Inep calcula o Conceito Enade, apresentado em uma escala de 1 a 5: quanto maior o conceito, melhor foi o desempenho do curso nesse indicador.',
          },
          {
            kind: 'paragraph',
            text: 'O Enade é realizado em ciclos, por isso nem todos os cursos são avaliados no mesmo ano. O Conceito Enade é um dos indicadores sobre o curso e não deve ser interpretado, sozinho, como uma medida de sua qualidade.',
          },
        ],
        source: 'Enade ciclo 2021–2023 · INEP',
      },
      {
        question: 'Por que alguns cursos não têm Conceito Enade?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'A ausência de conceito pode ter dois motivos:',
          },
          {
            kind: 'definition',
            term: 'Sem avaliação no ciclo:',
            text: 'o curso não foi avaliado no ciclo mais recente de sua área, pois as áreas são avaliadas em anos diferentes.',
          },
          {
            kind: 'definition',
            term: 'Sem conceito (SC):',
            text: 'o curso participou do Enade, mas o Inep não calculou um conceito — por exemplo, quando não há número suficiente de estudantes concluintes para isso.',
          },
          {
            kind: 'paragraph',
            text: 'No painel, essas duas situações aparecem com neblina no selo. Ela não indica uma nota baixa: indica que não há Conceito Enade disponível.',
          },
        ],
      },
      {
        question: 'O que significa a taxa de desistência?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Mostra a proporção acumulada de ingressantes que deixaram o curso ao longo de cinco anos. Por isso, a taxa sempre informa o ano de ingresso dos estudantes e o período em que foram acompanhados.',
          },
          {
            kind: 'paragraph',
            text: 'A desistência varia muito entre áreas. Para interpretar melhor esse dado, compare cursos semelhantes — Pedagogia com Pedagogia, Medicina com Medicina.',
          },
        ],
        source: 'Base de Fluxo/INEP, coorte 2020–2024',
      },
      {
        question: 'Onde o curso presencial é oferecido?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Mostra o município onde o curso é ofertado presencialmente, segundo os dados do Censo da Educação Superior.',
          },
        ],
        source: 'Censo da Educação Superior 2024 · INEP',
      },
      {
        question: 'Como saber onde ficam os polos de EaD?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Para cursos a distância, exibimos os municípios com polo registrados no Censo da Educação Superior 2024. Como o endereço exato dos polos não está disponível nos dados utilizados pelo painel, consulte o site da instituição para confirmar o endereço e se o polo continua em funcionamento.',
          },
        ],
        source: 'Censo da Educação Superior · e-MEC',
      },
      {
        question: 'O que muda entre presencial, semipresencial e EaD?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'A principal diferença está em como as atividades do curso são distribuídas entre encontros presenciais e atividades a distância.',
          },
          {
            kind: 'definition',
            term: 'Presencial:',
            text: 'a maior parte das atividades ocorre presencialmente na instituição.',
          },
          {
            kind: 'definition',
            term: 'Semipresencial:',
            text: 'combina uma parte importante de atividades presenciais com atividades a distância.',
          },
          {
            kind: 'definition',
            term: 'EaD:',
            text: 'a maior parte das atividades é realizada a distância, mas o curso também pode exigir atividades presenciais, inclusive em polos.',
          },
          {
            kind: 'paragraph',
            text: 'As regras mudaram em 2025 e estão sendo implantadas gradualmente. Por isso, confira no site da instituição como o curso que você está considerando está organizado.',
          },
        ],
      },
      {
        question: 'Cursos EaD e semipresenciais têm horário de aula?',
        blocks: [
          {
            kind: 'paragraph',
            text: 'No Censo da Educação Superior, cursos EaD e semipresenciais não são classificados por turno, como diurno ou noturno. Isso não significa que todas as atividades possam ser feitas em qualquer horário.',
          },
          {
            kind: 'paragraph',
            text: 'Algumas atividades podem ser assíncronas, realizadas em horários mais flexíveis. Outras podem ter dia e horário definidos, como aulas ao vivo, provas e atividades presenciais. Nos cursos semipresenciais, há também atividades presenciais regulares.',
          },
          {
            kind: 'paragraph',
            text: 'Antes de se inscrever, confira no site da instituição quais atividades têm horário fixo, quais exigem presença e com que frequência.',
          },
        ],
      },
    ],
  },
]
