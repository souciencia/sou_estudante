import { Typo } from '@/components/ui/typo'

/**
 * Aviso exibido nos módulos cujo conteúdo ainda não foi implementado
 * (`/ingresso`, `/permanencia`, `/comparar`).
 */
export function EmBreve() {
  return (
    <div className="rounded-card border border-border-primary bg-surface-lv2 p-4">
      <Typo v="mute" s="sm" t="p">
        Este módulo ainda está em construção. Em breve você verá aqui os dados e
        a navegação completos.
      </Typo>
    </div>
  )
}
