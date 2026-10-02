# PRÓXIMOS PASSOS

### evolução da busca
- algoritmo de relevância (aproximação e ordenação) no dicionário de cursos
- incluir na instituição
  - filtro por local de oferta
  - busca por município já na página do curso

### callout (compoud)
coisas do callout
- LeftAccent
- Icon
- Footer

### Drawer / Modal de Filtros para Mobile (UX & Responsividade)
- **Contexto**: Em telas grandes (`md+`), os filtros ocupam 1 coluna lateral. Em telas mobile (`< 768px`), eles ficam empilhados antes dos resultados, empurrando a lista de cursos para baixo.
- **Escopo**:
  - Adicionar botão "Filtros" visível apenas em mobile.
  - Abrir um drawer/bottom-sheet ou painel colapsável com `CourseFilters`.
  - Aplicar as regras das skills `accessibility` e `accessibility-for-focus-navigation` (foco preso no modal, fechar com ESC).

## Outros
- [] **Atualização/Criação de Stories no Storybook**
- [] Script que pega a Api-Key e atualiza o `.env`

---


### callout (compoud)
coisas do callout
- LeftAccent
- Icon
- Footer


Veja a imagem `docs/2026-10-01T16:52:42,893459520-03:00.png`, ela mostra dois componentes visuais que nós vamos implementar, mas estou pensando em implementar um componente só que é capaz de assumir as duas formas (quero sua opinião sobre isso). Quero que você discuta sobre quais estratégias vamos usar para implementá-lo. Já tenho em mente, de antemão, que vamos fazer um compound-component (por causa dos diferentes detalhes que cdada componente possui). Primeira coisa que vamos decidir é o nome desse componente. Acha que "callout" é um nome paropriado?