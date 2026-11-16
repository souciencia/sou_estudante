import axe from 'axe-core'

/**
 * Roda o axe (via `axe-core`, o mesmo motor do addon de a11y do Storybook) no
 * contêiner renderizado e devolve as violações encontradas.
 *
 * A regra `color-contrast` fica desativada: o jsdom não calcula layout/cores de
 * forma confiável, então o contraste é verificado manualmente/tokens.
 */
export async function findA11yViolations(
  container: HTMLElement,
): Promise<axe.Result[]> {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
    },
  })

  return results.violations
}
