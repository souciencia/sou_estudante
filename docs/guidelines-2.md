# Diretrizes de Arquitetura de Componentes

Padrão vigente para componentes de UI do `packages/front`: **Compound Component Pattern** e **Componentes Agnósticos com Wrappers de Especialização** (padrão *agnóstico + wrappers*).

---

## 1. Princípios Fundamentais

### 1.1 Compound Component Pattern

Sempre que um componente for expansível ou tiver estrutura interna complexa, use o padrão composto. Os subcomponentes ficam no **namespace** do pai e compartilham estado implícito via **React Context**.

- **Escopo e diretórios:** todos os subcomponentes residem na mesma pasta do componente pai. Subcomponentes internos **não** são exportados como componentes soltos no repositório.
- **Composição:** exponha a API via `Object.assign(Root, { ...subcomponentes })`, num `index.tsx`.
- **União dos arquivos:** cada subcomponente tem seu próprio arquivo (`<componente>-<parte>.tsx`); o `index.tsx` só monta o namespace e reexporta os tipos de props.
- **Estado compartilhado:** o Contexto carrega apenas o que os subcomponentes precisam (ex.: `module`, aba ativa).
- **Autonomia do consumidor:** o consumidor controla ordem, layout e elementos intermediários.
- **Validação de contexto:** todo subcomponente valida que está dentro do pai e **lança erro descritivo** caso contrário (ver §4).

> Use Contexto quando os subcomponentes precisam **coordenar estado** (ex.: `Profile.Tabs`). Para composição puramente visual, slots/props bastam — evite over-engineering.

### 1.2 Componentes Agnósticos e Wrappers Especializados

1. **Componente agnóstico (raiz):** foca em apresentação, layout e estado. Não conhece regras de domínio. Props e subcomponentes têm nomes neutros (`Profile`, `SearchHeader`, `FiltersPanel`, `ActiveFilters`).
2. **Wrappers de especialização:** contêm o conhecimento de domínio (hooks, mapeamentos, textos) e consomem a estrutura agnóstica. Ex.: `ProfileCursos`, `ProfileIES`, `SearchHeaderCursos`, `ActiveFiltersIes`.

Regras de ouro:

- O agnóstico **nunca** importa hook/serviço de domínio (`useSearchCursos`, `useSearchIes`, etc.).
- Lógica compartilhada entre wrappers de domínios diferentes **sobe** para o agnóstico (ex.: `useFilterPanel`, `buildFilterOptions` em `search/filters-panel`).
- Se dois wrappers divergem só em configuração, o wrapper fica **fino** (config + composição).

---

## 2. Estrutura de Diretórios

Componentes são agrupados por **domínio/responsabilidade** diretamente em `src/components/`:

```txt
src/components/
├── ui/       # primitivos/átomos agnósticos (button, tag, typo, spinner, card, ...)
├── layout/   # moldura do site (header, site-menu, hero)
├── search/   # blocos de busca agnósticos (+ wrappers por domínio)
├── profile/  # compound agnóstico de perfil (+ wrappers por domínio)
├── enade/    # formas-enade, selo-enade
└── home/     # home-search
```

Cada **componente** tem sua própria pasta (kebab-case). Os **subcomponentes** ficam nessa mesma pasta; os **wrappers** ficam em `<agnóstico>/wrappers/<wrapper>/`:

```txt
src/components/profile/
├── index.tsx               # Object.assign do namespace Profile
├── profile-context.ts      # Contexto + hook de validação
├── profile-root.tsx
├── profile-header.tsx
├── profile-tabs.tsx, profile-tab.tsx, profile-tab-list.tsx, profile-tab-panel.tsx
├── ...
└── wrappers/
    ├── profile-cursos/
    └── profile-ies/
```

```txt
src/components/search/
├── active-filters/                       # agnóstico
│   └── wrappers/
│       ├── active-filters-cursos/
│       └── active-filters-ies/
├── filters-panel/                        # agnóstico (+ filters-helpers.ts, use-filter-panel.ts)
│   └── wrappers/
│       ├── filters-panel-cursos/
│       └── filters-panel-ies/
├── search-header/                        # agnóstico (compound)
│   └── wrappers/
│       ├── search-header-cursos/
│       └── search-header-ies/
├── search-result-section/                # agnóstico (genérico <TItem>)
│   └── wrappers/
│       ├── search-result-section-cursos/   (+ search-result-item.tsx)
│       └── search-result-section-ies/      (+ ies-result-item.tsx)
├── sorting-options/
│   └── wrappers/
│       └── sorting-options-cursos/
└── (sem wrapper: active-filters-bar, filter-group, search-autocomplete,
    search-pagination, search-results)
```

Regras:

- **Nunca** criar um componente especializado fora do `wrappers/` do seu agnóstico.
- Componentes de domínio não ocupam pastas próprias na raiz de `components/` — eles vivem dentro do agnóstico correspondente.
- `index.tsx` é usado quando há namespace/compound; componentes de arquivo único podem ser `<nome>.tsx` direto na pasta (ex.: `ui/typo.tsx`).

---

## 3. Nomenclatura

| Item                         | Convenção                                   | Exemplo                                                |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------ |
| Pastas                       | `kebab-case`                                | `search-header`, `profile-cursos`                      |
| Componente agnóstico         | `PascalCase`                                | `Profile`, `SearchHeader`, `FiltersPanel`              |
| Subcomponente (namespace)    | `<Pai>.<Parte>`                             | `Profile.Header`, `SearchHeader.Autocomplete`          |
| Wrapper de especialização    | `<Agnóstico><Domínio>`                      | `ProfileCursos`, `SearchHeaderCursos`, `ActiveFiltersIes` |
| Contexto/hook de validação   | `<componente>-context.ts` / `use<X>Context` | `profile-context.ts`, `useProfileContext`              |
| Arquivo de subcomponente     | `<pai>-<parte>.tsx`                         | `profile-tab-list.tsx`                                 |

- **Domínios (sufixo):** `Cursos` e `Ies` (ex.: `ProfileCursos`, `ActiveFiltersIes`).
  - ⚠️ Inconsistência atual a alinhar: `ProfileIES` (maiúsculo) deve virar `ProfileIes` para casar com o sufixo.
- Tipos de props de cada subcomponente são definidos no seu arquivo e reexportados no `index.tsx`.

---

## 4. Contexto e Validação de Uso

Todo compound tem um arquivo de contexto que expõe um hook **com validação**:

```ts
// profile-context.ts
import { createContext, useContext } from 'react'
import type { Module } from '@/lib/module'

export interface ProfileContextValue {
  module?: Module
}

export const ProfileContext = createContext<ProfileContextValue | null>(null)

/** Lê o contexto do Profile; lança erro claro se usado fora do pai. */
export function useProfileContext(subComponent: string): ProfileContextValue {
  const context = useContext(ProfileContext)
  if (context === null) {
    throw new Error(`${subComponent} must be rendered inside <Profile>.`)
  }
  return context
}
```

Uso no subcomponente:

```tsx
export function ProfileHeader({ badge, title }: ProfileHeaderProps) {
  const { module } = useProfileContext('Profile.Header')
  return <header data-module={module}>{/* ... */}</header>
}
```

O consumidor recebe a mensagem de erro (`Profile.Tab must be rendered inside <Profile.Tabs>.`) quando usa o subcomponente fora do pai.

---

## 5. Exemplo Real — `Profile` (compound agnóstico + wrappers)

`index.tsx` monta o namespace:

```tsx
export const Profile = Object.assign(ProfileRoot, {
  TopBar: ProfileTopBar,
  Header: ProfileHeader,
  Location: ProfileLocation,
  Tabs: ProfileTabs,
  TabList: ProfileTabList,
  Tab: ProfileTab,
  TabPanel: ProfileTabPanel,
  Overview: ProfileOverview,
  Section: ProfileSection,
})
```

Wrapper de domínio (`wrappers/profile-cursos/profile-cursos.tsx`):

```tsx
export const ProfileCursos = ({ curso, module = '1' }: ProfileCursosProps) => (
  <Profile module={module}>
    <Profile.Header badge={MODULE_META[module].badge} title={titulo} subtitle={sigla} />

    <Profile.Tabs defaultValue="overview">
      <Profile.TabList>
        <Profile.Tab value="overview">Visão geral</Profile.Tab>
        <Profile.Tab value="quality">Qualidade</Profile.Tab>
      </Profile.TabList>
      <Profile.TabPanel value="overview">
        <Profile.Overview items={buildOverviewItems(curso)} />
      </Profile.TabPanel>
      <Profile.TabPanel value="quality">
        <ProfileCursosQuality curso={curso} />
      </Profile.TabPanel>
    </Profile.Tabs>
  </Profile>
)
```

O agnóstico não conhece `Curso`; o wrapper é quem traz o dado e a copy.

---

## 6. Exemplo Real — `Search` (agnóstico + wrappers por domínio)

`SearchHeader` é um compound com slots:

```tsx
export const SearchHeader = Object.assign(SearchHeaderRoot, {
  Autocomplete: SearchHeaderAutocomplete, // injeta `module` do contexto
  Actions: SearchHeaderActions,           // faixa de controles extras
  Sorting: SearchHeaderSorting,           // área de ordenação (com divisória)
})
```

Wrappers paralelos por domínio:

```tsx
// search/search-header/wrappers/search-header-cursos/search-header-cursos.tsx
export function SearchHeaderCursos({ module }: { module?: Module }) {
  const { query, setQuery, updateParams } = useSearchCursos()
  return (
    <SearchHeader module={module}>
      <SearchHeader.Autocomplete defaultValue={query} onSearchSubmit={setQuery} />
      <SearchHeader.Actions>{/* alternador de busca exata */}</SearchHeader.Actions>
      <SearchHeader.Sorting>
        <SortingOptionsCursos module={module} />
      </SearchHeader.Sorting>
    </SearchHeader>
  )
}
```

O wrapper IES (`search-header-ies`) usa o mesmo `SearchHeader`, mudando só sugestões/opções.

Componentes genéricos de resultado usam generics, e o domínio entra por props:

```tsx
// search/search-result-section/search-result-section.tsx
export function SearchResultSection<TItem>({ items, labels, getItemKey, renderItem, ... }: Props<TItem>) {
  return <SearchResults<TItem> /* ... */ />
}
```

---

## 7. Storybook

Títulos padronizados:

- Componente: `Components/<Área>/<Nome>` — ex.: `Components/Ui/Button`, `Components/Search/SearchHeader`.
- Wrapper: `Components/<Área>/<Agnóstico>/Wrappers/<Domínio>` — ex.: `Components/Search/SearchHeader/Wrappers/Ies`, `Components/Profile/Wrappers/ProfileCursos`.

---

## 8. Checklist do Desenvolvedor

Ao criar/revisar um componente ou refatoração:

- [ ] Os subcomponentes estão na mesma pasta do pai e expostos por **namespace** (`<Profile.Header>`)?
- [ ] O componente agnóstico está livre de regras de domínio (nenhum hook/serviço de `cursos`/`ies` importado na base)?
- [ ] Cada subcomponente valida o Contexto e lança erro descritivo fora do pai?
- [ ] Subcomponentes internos **não** foram exportados como componentes soltos (atoms/molecules) no repositório?
- [ ] A especialização de domínio está isolada em `<agnóstico>/wrappers/<wrapper>/`?
- [ ] Nomes de wrapper seguem `<Agnóstico><Domínio>` (`ProfileCursos`, `SearchHeaderCursos`, ...)?
- [ ] Lógica compartilhada entre wrappers subiu para o agnóstico (helpers/hooks), em vez de duplicada?
- [ ] O título do Storybook segue `Components/<Área>/<Nome>` (e `.../Wrappers/<Domínio>` para wrappers)?
