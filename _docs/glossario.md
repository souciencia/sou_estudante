# Glossário do domínio

> **Revisão pendente:** as definições abaixo seguem o vocabulário público dos
> dados abertos do Inep/MEC e o uso no código. Peça à equipe de dados que
> confirme antes de tratá-las como definitivas.

| Termo | Significado | Onde aparece |
| :--- | :--- | :--- |
| **IES** | Instituição de Ensino Superior. `co_ies` é o código dela. | índice `ies`, `instituicao.*` |
| **Censo** | Censo da Educação Superior (Inep); fonte dos dados cadastrais e de vagas/ingressos/matrículas. | `censo_metricas`, `nu_ano_censo` |
| **CINE** | Classificação Internacional Normalizada da Educação; organiza cursos em área geral, específica e detalhada, e rótulo. | `curso.cine.*` |
| **Enade** | Exame Nacional de Desempenho dos Estudantes. Avalia cursos por ciclos (nem todo curso é avaliado todo ano). | `enade.*` |
| **Conceito contínuo (Enade)** | Nota numérica do curso no Enade. Base da ordenação `sort=enade`. | `enade.conceito_continuo_enade` |
| **Faixa (Enade)** | Conceito em 5 níveis (1 a 5) derivado do contínuo. `SC` = sem conceito no ciclo. Filtro `enade` da API. | `enade.conceito_faixa_enade` |
| **Sisu** | Sistema de Seleção Unificada: ingresso pela nota do Enem. | `sisu.tem_sisu`, `sisu.ofertas` |
| **Oferta (Sisu)** | Uma vaga ofertada por turno, modalidade de concorrência e grupo, com vagas, inscrições e nota de corte. | `sisu.ofertas[]` |
| **Modalidade de concorrência / grupo** | Categoria de acesso à vaga (ampla concorrência, cotas). | `ofertas[].modalidade`, `grupo`, `descricao` |
| **TAP** | Taxa de permanência (indicador de trajetória do Inep). | `tda.tap` |
| **TCA** | Taxa de conclusão acumulada. | `tda.tca` |
| **TDA** | Taxa de desistência acumulada; o front a exibe como "Desistência acumulada" com a média nacional como referência. Base da ordenação `sort=desistencia`. | `tda.tda` |
| **Ano de ingresso / referência (TDA)** | Coorte de ingressantes acompanhada e ano em que a taxa foi medida. | `tda.nu_ano_ingresso_tda`, `nu_ano_referencia_tda` |
| **Grau acadêmico** | Bacharelado, Licenciatura ou Tecnológico. | `curso.no_grau_academico` |
| **Modalidade de ensino** | Presencial ou a distância (EaD). | `curso.no_modalidade_ensino` |
| **Categoria administrativa** | Natureza da IES: pública federal/estadual/municipal, privada com ou sem fins lucrativos. A API simplifica em `privada`, `federal`, `estadual`, `municipal`. | `instituicao.categoria_administrativa` |
| **Organização acadêmica** | Universidade, Centro Universitário, Faculdade etc. | `instituicao.organizacao_academica` |
| **Apoio social / atividade extracurricular** | Quantidades de estudantes com cada apoio, usadas no módulo "permanecer". | `censo_metricas.qt_apoio_social`, `qt_ativ_extracurricular` |

## Módulos de produto

| Nº | Nome (tema náutico) | Pergunta que responde | Rota |
| :--- | :--- | :--- | :--- |
| 1 | Carta Náutica | Escolher curso | `/cursos` |
| 2 | Bússola | Como ingressar (Sisu) | `/ingresso` |
| 3 | Âncora | Como permanecer | `/permanencia` |
| 4 | Telescópio | Conhecer a instituição | `/ies` |
| 5 | Sextante | Comparar cursos | `/comparar` |

Fonte: `MODULE_META` em `front/src/lib/module.ts`.

## Termos de arquitetura de componentes

Agnóstico, Wrapper, Compound, Scoped-Variable e Slot estão definidos em
[31.component-composition.md](31.component-composition.md#9-terminologia).
