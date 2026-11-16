# Front (Next.js)

Interface do SoU_Estudante: Next.js (App Router), Tailwind CSS v4, Biome e
Vitest. Container `se_front` (porta 3000).

- Padrões de componentes e estilo: [_docs/30.frontend.md](../_docs/30.frontend.md)
  e [_docs/31.component-composition.md](../_docs/31.component-composition.md)
- Regras para agentes: [AGENTS.md](AGENTS.md)
- Visão geral e variáveis `API_URL`/`NEXT_PUBLIC_API_URL`:
  [_docs/00.arquitetura.md](../_docs/00.arquitetura.md)

## Comandos

Execute em `front`:

| Tarefa | Comando |
| :--- | :--- |
| Servidor de desenvolvimento | `npm run dev` |
| Testes (modo watch) | `npm test` |
| Testes (uma vez) | `npm run test:run` |
| Cobertura | `npm run test:coverage` |
| Typecheck | `npm run typecheck` |
| Lint (somente verifica) | `npm run lint` |
| Lint como no CI | `npm run check:ci` |
| Corrigir lint/formatação | `npm run lint:fix` |
| Build de produção | `npm run build` |
| Design system (oculta, sem links) | `/design-system` |

No ambiente do projeto os comandos rodam dentro do container
(`podman exec -it se_front npm run ...`).

## Variáveis de ambiente

Modelo em `.env.example` (para `.env.local` fora do compose). Deixe
`NEXT_PUBLIC_API_URL` ausente para usar o proxy `/api`.
