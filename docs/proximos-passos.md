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

Veja o arquivo docs/imgs/2026-09-30T18:19:58,155400049-03:00.png, ele mostra como seria o `FiltersPanel`estilizado. Aplique esta estilização no componente. Você deve alterar somente os arquivos que estão em `front/src/components/search/filters-panel/` e se necessário, em `front/src/app/globals.css/`. Não precisa ler outros arquivos. 


`docs/imgs/`