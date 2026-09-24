
# Frontend (`front/`)

## Core Tech Stack
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Linter: Biome
- Test Runner: Vitest
- Render: React Testing Library (RTL) + jsdom
- Storybook

## Regras

⚠️​ Whenever your write code, format it according to the rules in the `.editorconfig` file and `biome.json`.

### Organização de componentes
O padrão completo (Compound Component Pattern + Componentes Agnósticos com Wrappers de Especialização) está em [`docs/guidelines-2.md`](../../docs/guidelines-2.md). Resumo:
- Agrupar por domínio em `src/components/`: `ui`, `layout`, `search`, `profile`, `enade`, `home`.
- Subcomponentes na pasta do pai, expostos por namespace (ex.: `<Profile.Header>`), com Contexto e validação de uso.
- Especializações de domínio em `<agnóstico>/wrappers/<wrapper>/` (ex.: `profile/wrappers/profile-cursos`), nomeadas `<Agnóstico><Domínio>` (ex.: `ProfileCursos`, `SearchHeaderIes`).

### Compound Components para componentes robustos

Ao criar componentes robustos e expansíveis, utilize o **Compound Component Pattern**. Todos os subcomponentes pertencem estritamente ao diretório e ao *namespace* do seu componente pai (ex.: `<Select.Option>` reside na mesma pasta do `<Select>`). Exponha APIs flexíveis e expressivas onde os subcomponentes compartilham estado implícito via *React Context* (ex.: `<Select>`, `<Select.Trigger>`, `<Select.Option>`). Implemente de forma a dar controle total sobre a composição, o layout e a ordem de renderização.

### DRY (Don't Repeat Yourself)
Cada fragmento de conhecimento, regra de negócio ou lógica de código deve ter uma representação única, inequívoca e oficial dentro do sistema.
- Evite duplicação de lógica, estilos e funções.
- Se um comportamento se repete em múltiplos lugares, abstraia-o em uma função utilitária, *custom hook* ou componente reutilizável.


### Semantic Tokens & CSS Architecture
- **File Reference:** Always consult `/packages/front/src/app/globals.css` first to search for existing semantic tokens or to define new ones when needed.
- Reference semantic tokens only.
- **Naming:** `--{component}-{property}-module-{N}`, or `--{component}-{property}` if the component is generic and takes the module number as a passed-in variable at the call site.
- **Scoped-Variable Pattern:** Prefer the scoped-variable pattern over generating 5x every component token by hand. Set `--module-color` locally per card/section, then have shared component rules reference that single variable.

**Example:**
```css
  .module-card[data-module="3"] {
    --module-color: var(--color-module-3);
  }

  .module-card .icon-tile   { background: var(--module-color); }
  .module-card .badge       { background: var(--module-color); color: var(--color-navy-900); }
  .module-card .accent-bar  { background: var(--module-color); }
```
- When writing `className` prop use `/tailwind-cn-utility`.
- Always use `cn()` from `@/lib/utils` (or equivalent path) for dynamic, conditional, or forwarded `className` attributes. Never use manual concatenation, template literals, or raw `clsx`/`classnames`.
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