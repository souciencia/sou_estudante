
# Frontend (`front/`)

## Core Tech Stack
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Linter: Biome
- Test Runner: Vitest
- Render: React Testing Library (RTL) + jsdom

## Regras

⚠️​ Whenever your write code, format it according to the rules in the `.editorconfig` file and `biome.json`.

### Componentes
Detalhes em [`_docs/30.frontend.md`](../_docs/30.frontend.md) (convenções do projeto) e [`_docs/31.component-composition.md`](../_docs/31.component-composition.md) (quando usar cada padrão). Leia-os antes de criar ou estruturar componentes. Resumo:
- Pastas por domínio em `src/components/`: `ui`, `layout`, `search`, `profile`, `enade`.
- Comece com props simples; Compound, Context e Agnóstico + Wrapper só com caso de uso real.
- Wrappers em `<agnóstico>/wrappers/<wrapper>/`, nomeados `<Agnóstico><Domínio>`.
- Só variação visual: Scoped-Variable (`data-*`), sem Context.
- DRY a partir do segundo uso real.

### Design System (página oculta)
- Toda alteração que afete o design system (tokens em `globals.css`, componentes base de `ui/`, composições/estados visuais) exige atualizar a página oculta em `src/app/design-system/` na mesma mudança.

### Semantic Tokens & CSS Architecture
- **File Reference:** Always consult `/front/src/app/globals.css` first to search for existing semantic tokens or to define new ones when needed.
- Reference semantic tokens only.
- **Naming:** acento por módulo `--color-m{N}-accent` / `--color-m{N}-deep`; acento escopado `--color-accent`, `--color-accent-deep`, `--color-accent-fg`; demais tokens por categoria (ver [`_docs/30.frontend.md`](../_docs/30.frontend.md)). Não crie tokens `--{component}-{property}-module-{N}` por módulo.
- **Scoped-Variable Pattern:** o componente recebe `module` e emite `data-module` no elemento raiz; `[data-module="N"]` em `globals.css` reatribui `--color-accent*` para toda a subárvore, e os descendentes usam `bg-accent`, `text-accent-deep`, `border-accent` (transparência com `/NN`), sem cor fixa e sem repetir tokens 5x.

**Example:**
```css
  /* globals.css */
  [data-module="3"] {
    --color-accent: var(--color-m3-accent);
    --color-accent-deep: var(--color-m3-deep);
    --color-accent-fg: var(--color-m3-deep);
  }
```
```tsx
  <article data-module={module} className="bg-accent/10 border-accent">
    <h3 className="text-accent-deep">...</h3>
  </article>
```
- Always use `cn()` from `@/utils/cn` for dynamic, conditional, or forwarded `className` attributes. Never use manual concatenation, template literals, or raw `clsx`/`classnames`.
- **Conditional Classes & Props:** Pass conditions directly as arguments. Always place the forwarded `className` last to allow overrides.
  ```tsx
  <div className={cn('p-4 rounded-md', isActive ? 'bg-blue-500' : 'bg-gray-200', className)} />
  ```

- **Object Flags**: Use objects for complex variants or state flags.

```TypeScript
    <button className={cn('px-4 py-2', { 'bg-blue-500': variant === 'primary', 'opacity-50': disabled }, className)} />
```

## Anti-Patterns to Avoid
  ❌ Manual template literals: `base ${extra}` or 'base ' + extra.
  ❌ Using clsx() or tailwind-merge directly inside components (always use the centralized cn).