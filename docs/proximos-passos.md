### Página de Detalhes do Curso (`/cursos/[id]`) *(Recomendado para avanço funcional)*
- **Contexto**: Atualmente, a listagem e os filtros estão completos, mas clicar em um card não leva a uma página com os detalhes aprofundados do curso.
- **Escopo**:
  - **Backend Go**: Implementar endpoint `GET /cursos/{id}` no módulo de cursos.
  - **Frontend**: Criar a rota dinâmica `src/app/cursos/[id]/page.tsx` exibindo:
    - Dados completos da Instituição e do Curso.
    - Métricas do Censo (vagas, ingressantes, matriculados, apoio social).
    - Selo e histórico do ENADE.
    - Taxas de Desistência e Conclusão (TDA).
    - Ofertas e notas de corte do SISU.

### Drawer / Modal de Filtros para Mobile (UX & Responsividade)
- **Contexto**: Em telas grandes (`md+`), os filtros ocupam 1 coluna lateral. Em telas mobile (`< 768px`), eles ficam empilhados antes dos resultados, empurrando a lista de cursos para baixo.
- **Escopo**:
  - Adicionar botão "Filtros" visível apenas em mobile.
  - Abrir um drawer/bottom-sheet ou painel colapsável com `CourseFilters`.
  - Aplicar as regras das skills `accessibility` e `accessibility-for-focus-navigation` (foco preso no modal, fechar com ESC).

## Outros
- **Atualização/Criação de Stories no Storybook**
- Script que pega a Api-Key e atualiza o `.env`
