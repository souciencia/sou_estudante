# Padrões de Estilização — Frontend

Documentação dos padrões de estilização adotados no pacote `packages/front/`:
tokens centralizados, temas por módulo (Scoped-Variable Pattern), escala
tipográfica e convenções de componentes.

- **Stack:** Next.js (App Router) + Tailwind CSS v4 + Biome.
- **Fonte única dos tokens:** `packages/front/src/app/globals.css`.
- **Utilitário de classes:** `cn()` em `packages/front/src/utils/cn.ts`.

---

## 1. Visão geral

Toda a estilização gira em torno de três ideias:

1. **Nenhuma cor/tamanho solto no componente.** Valores vêm de tokens
   declarados em `globals.css` (`--color-*`, `--text-*`, `--radius-*`,
   `--font-*`, `--motion-*`, `--ease-*`).
2. **Temas por módulo** aplicados com o **Scoped-Variable Pattern**: um
   atributo `data-module` sobrescreve variáveis de acento para toda a
   subárvore.
3. **Composição de classes** sempre via `cn()`, com o `className` recebido
   por último (permite override).

---

## 2. Tokens centralizados (`globals.css`)

O bloco `@theme` está organizado em categorias:

```
Cores · Acentos por módulo
Cores · Acento escopado
Cores · Texto por papel
Cores · Neutros semânticos
Cores · Feedback (Enade + progresso)
Tipografia · Famílias
Tipografia · Escala
Formas
```

### 2.1 Cores · Acentos por módulo

Paleta de identidade de cada módulo. São a **fonte** do acento escopado.

| Token               | Valor     | Módulo                       |
| ------------------- | --------- | ---------------------------- |
| `--color-m1-accent` | `#d4ff00` | M1 Carta Náutica — neon-lime |
| `--color-m2-accent` | `#00e5ff` | M2 Bússola — cyan            |
| `--color-m3-accent` | `#ff67be` | M3 Âncora — neon-pink        |
| `--color-m4-accent` | `#ae64fe` | M4 Telescópio — ultraviolet  |
| `--color-m5-accent` | `#ff8d3b` | M5 Sextante — mango          |

Cada módulo tem também um tom **companheiro** (`--color-m{1..5}-deep`),
legível sobre fundos claros, usado como texto/borda forte.

### 2.2 Cores · Acento escopado

| Token                | Padrão            | Uso                                  |
| -------------------- | ----------------- | ------------------------------------ |
| `--color-accent`     | `var(--color-m1-accent)` | Fundo/borda/ícone de destaque |
| `--color-accent-deep`| `var(--color-m1-deep)`   | Texto forte, foco, contraste  |
| `--color-accent-fg`  | `var(--color-m1-deep)`   | Foreground sobre `accent`     |

Esses três tokens são **sobrescritos** por `[data-module="1".."5"]` (ver §3).

### 2.3 Cores · Texto por papel

Assim como os tamanhos, a cor do texto segue o papel:

| Token                    | Valor             | Uso                          |
| ------------------------ | ----------------- | ---------------------------- |
| `--color-fg-protagonist` | `oklch(0.15 0 0)` | Conteúdo principal           |
| `--color-fg-coadjuvant`  | `oklch(0.15 0 0)` | Apoio (button, filtros, tips)|
| `--color-fg-muted`       | `oklch(0.55 0 0)` | Secundário / desabilitado    |

### 2.4 Cores · Neutros semânticos

| Token                     | Valor                 |
| ------------------------- | --------------------- |
| `--color-muted`           | `var(--color-gray-100)` |
| `--color-site-background` | `#f8f4fb`             |
| `--color-card-surface`    | `oklch(1 0 0)`        |
| `--color-card-border`     | `oklch(0.92 0 0)`     |

### 2.5 Cores · Feedback

Faixas de conceito do Enade e barra de progresso.

| Token                           | Valor                  |
| ------------------------------- | ---------------------- |
| `--color-enade-ok`              | `#1b8a5a`              |
| `--color-enade-ok-surface`      | `#e8f7f0`              |
| `--color-enade-warn`            | `#b06000`              |
| `--color-enade-warn-surface`    | `#fff3e0`              |
| `--color-enade-low`             | `#c0392b`              |
| `--color-enade-low-surface`     | `#fdecea`              |
| `--color-progress-bar-foreground` | `oklch(0.48 0.03 240)` |
| `--color-progress-bar-background` | `oklch(0.94 0.01 75)`  |

### 2.6 Tipografia · Famílias

As famílias também seguem o papel; **títulos são a exceção**.

| Token                      | Valor                                    |
| -------------------------- | ---------------------------------------- |
| `--font-protagonist`       | `"Source Sans 3", system-ui, sans-serif` |
| `--font-coadjuvant`        | `"Source Sans 3", system-ui, sans-serif` |
| `--font-title-protagonist` | `"Source Sans 3", system-ui, sans-serif` |
| `--font-title-coadjuvant`  | `"Source Sans 3", system-ui, sans-serif` |
| `--font-mono`              | `"DM Mono", ui-monospace, monospace`     |

### 2.7 Tipografia · Escala

A escala é dividida por **papel** do texto, não por componente:

- **Protagonista** — conteúdo principal (card, callout, textos principais).
- **Coadjuvante** — apoio (button, tag, filtros, tips).

| Token                     | Valor    | px   |
| ------------------------- | -------- | ---- |
| `--text-protagonist-sm`   | `0.875rem` | 14 |
| `--text-protagonist`      | `1rem`     | 16 |
| `--text-protagonist-lg`   | `1.25rem`  | 20 |
| `--text-protagonist-xl`   | `2.25rem`  | 36 |
| `--text-coadjuvant-xs`    | `0.625rem` | 10 |
| `--text-coadjuvant-sm`    | `0.75rem`  | 12 |
| `--text-coadjuvant`       | `0.875rem` | 14 |
| `--text-coadjuvant-lg`    | `1rem`     | 16 |

Ajuste de tamanho é feito **apenas aqui**.

### 2.8 Formas

| Token           | Valor  |
| --------------- | ------ |
| `--radius-card` | `26px` |

Medidas de layout (gaps, larguras, tamanho do checkbox) ficam como classes
Tailwind no próprio componente — não viram token.

---

## 3. Temas por módulo (Scoped-Variable Pattern)

### 3.1 Definição

No `globals.css`, cada módulo sobrescreve os tokens de acento:

```css
[data-module="1"] {
  --color-accent: var(--color-m1-accent);
  --color-accent-deep: var(--color-m1-deep);
  --color-accent-fg: var(--color-m1-deep);
}
/* [data-module="2".."5"] idem, com a paleta do módulo */
```

### 3.2 Consumo no componente

O componente recebe `module?`, emite `data-module` e usa as **utilities de
acento** — sem cores fixas:

```tsx
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'

interface Props {
  module?: Module
  active?: boolean
  className?: string
}

export const Example = ({ module, active, className }: Props) => (
  <button
    data-module={module}
    className={cn(
      'border-accent',
      active
        ? 'border-accent/70 bg-accent/10 text-accent-fg'
        : 'border-transparent bg-muted text-fg-muted',
      className,
    )}
  />
)
```

### 3.3 Opacity modifiers

O Tailwind aplica transparência sobre a cor do módulo com `/NN` — evita
criar variáveis `-surface`/`-light` por módulo:

| Classe            | Compila para                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `bg-accent/10`    | `background-color: color-mix(in oklab, var(--color-accent) 10%, transparent)` |
| `border-accent/30`| `border-color: color-mix(in oklab, var(--color-accent) 30%, transparent)` |
| `text-accent-deep`| `color: var(--color-accent-deep)`                                   |
| `bg-accent`       | `background-color: var(--color-accent)`                             |

### 3.4 Herança

`data-module` propaga por CSS: qualquer descendente herda o acento do
ancestral mais próximo. Componentes compostos (`Card`) também expõem o
módulo via React Context (`card-context.ts`) para repassá-lo a filhos que
não leem CSS (ex.: `Tag`).

### 3.5 Tipos compartilhados

- `Module` — `'1' | '2' | '3' | '4' | '5'` em `src/lib/module.ts`.
- `EnadeFaixa` — `'1' | '2' | '3' | '4' | '5'` em `src/lib/enade.ts`.

---

## 4. Convenções de componentes

- **`cn()` obrigatório** para classes dinâmicas/condicionais/forwarded.
  Nunca template literals, `clsx` ou `classnames` diretos.
- **`className` por último**, para permitir override:
  ```tsx
  <div className={cn('p-4 rounded-card', isActive && 'bg-accent/10', className)} />
  ```
- **Object flags** para variantes complexas:
  ```tsx
  <button className={cn('px-4 py-2', { 'bg-accent': active, 'opacity-50': disabled }, className)} />
  ```
- **Sem valores mágicos.** Cor/tamanho/família/raio sempre via token
  (`bg-accent`, `text-protagonist`, `font-coadjuvant`, `rounded-card`).
- **Sem `text-[...]` nem cores da paleta crua** (`text-gray-500`,
  `bg-blue-600`). Use tokens semânticos.
- **Texto por papel:** protagonista usa `font-protagonist` +
  `text-fg-protagonist`; coadjuvante usa `font-coadjuvant` +
  `text-fg-coadjuvant`; títulos usam `font-title-protagonist` /
  `font-title-coadjuvant`.

### 4.1 Composição de classes e tailwind-merge

`cn()` (`src/utils/cn.ts`) usa `extendTailwindMerge` para registrar os
tokens de **font-size** (`text-protagonist*`, `text-coadjuvant*`) e
**font-family** (`font-protagonist`, `font-coadjuvant`, `font-title-*`)
como grupos próprios.

Sem isso o tailwind-merge trataria `text-coadjuvant` como cor e o
descartaria ao combinar com `text-fg-*`. Ao criar novos tokens de tamanho
ou família, **registre-os em `src/utils/cn.ts`**.

### 4.2 Componentes com tema

Recebem `module?: Module` e emitem `data-module`:

| Componente            | Ponto de aplicação            |
| --------------------- | ----------------------------- |
| `Button`              | `<button data-module>`        |
| `Tag`                 | `<span data-module>`          |
| `Switch`              | `<button data-module>`        |
| `Checkbox`            | `<input data-module>`         |
| `Card`                | raiz + Context para filhos    |
| `FilterGroup`         | raiz (repassa por herança CSS)|
| `SearchAutocomplete`  | wrapper                       |
| `SearchPagination`    | `<nav data-module>`           |
| `ActiveFilters`       | `<section data-module>`       |
| `CourseFilters`       | raiz                          |
| `SearchHeaderBlock`   | raiz + repassa aos filhos     |
| `SearchSortignOptions`| repassa aos `Button`          |

O `FilterGroup` não tem mais tokens (`--filter-group-*`) nem classes próprias
(`.filter-group__*`) no `globals.css`: o checkbox virou o atom `Checkbox` e as
medidas/layout são classes Tailwind no componente.

---

## 5. Tipografia aplicada

| Onde                              | Tamanho                     |
| --------------------------------- | --------------------------- |
| `Card.Header` título              | `text-protagonist-lg`       |
| `Card.ProgressBar` labels         | `text-coadjuvant-sm`        |
| `Card.IconEnade` número / rótulo  | `text-protagonist-lg` / `text-coadjuvant-xs` |
| `Tag`                             | `text-coadjuvant-xs`        |
| `Button`                          | `text-coadjuvant`           |
| `ActiveFilters` chips / limpar    | `text-coadjuvant-sm`        |
| `SearchAutocomplete` input / opção| `text-protagonist` / `text-coadjuvant` |
| `SearchPagination`                | `text-coadjuvant`           |
| `ErrorMessage`                    | `text-protagonist-sm`       |
| `SeloEnade`                       | `text-protagonist-xl` / `text-protagonist-lg` / `text-coadjuvant-xs` |
| `FilterGroup` título/opção/contagem | `text-coadjuvant-lg` / `text-coadjuvant` / `text-coadjuvant-sm` |

**Família e cor por papel:** protagonistas (`Card`, `ErrorMessage`, input do
autocomplete) usam `font-protagonist text-fg-protagonist`; coadjuvantes
(`Button`, `Tag`, `FilterGroup`, `ActiveFilters`, `Pagination`, opções do
autocomplete) usam `font-coadjuvant text-fg-coadjuvant`; títulos usam
`font-title-protagonist` / `font-title-coadjuvant`. O `body` define o padrão
protagonista.

O primitivo `Typo` (`src/components/atoms/typo.tsx`) mapeia a prop `s` para a
escala. Ele não define família nem cor base (herda do contêiner); `title`
aplica `font-title-protagonist`, `mute` aplica `text-fg-muted` e `accent`
aplica `text-accent-deep`:

| `s`   | Token               |
| ----- | ------------------- |
| `xs`  | `text-coadjuvant-sm`|
| `sm`  | `text-coadjuvant`   |
| `md`  | `text-protagonist`  |
| `lg`  | `text-coadjuvant-lg`|
| `xl`  | `text-protagonist-lg` |
| `2xl` | `text-protagonist-lg` |

---

## 6. Como estender

**Novo módulo:** adicione `--color-mN-accent`/`--color-mN-deep` em
`Cores · Acentos por módulo` e um bloco `[data-module="N"]` mapeando
`--color-accent*`. Atualize `MODULES` em `src/lib/module.ts`.

**Novo tom/medida:** declare o token na categoria correspondente em
`globals.css` e consuma via utility. Evite variáveis de uso único quando um
`/NN` sobre `accent` resolve.

**Novo tamanho de fonte:** use a escala protagonista/coadjuvante; só crie um
token novo se o papel for realmente distinto.

---

## 7. Acessibilidade

- Foco sempre visível com acento: `focus-visible:outline-accent` /
  `outline-accent-deep`.
- Texto sobre `bg-accent` usa `text-accent-fg`/`text-accent-deep` (tons
  escuros) para manter contraste.
- `prefers-reduced-motion` zera animações/transições globalmente.

---

## 8. Referências

- Tokens: `packages/front/src/app/globals.css`
- Tipos: `packages/front/src/lib/module.ts`, `packages/front/src/lib/enade.ts`
- Utilitário de classes: `packages/front/src/utils/cn.ts`
- Contexto do Card: `packages/front/src/components/features/card/card-context.ts`
