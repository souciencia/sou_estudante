import { Callout } from '@/components/ui/callout'
import type { IesDocentes } from '@/services/api/types'
import { ProfileIESFacultyBar } from './profile-ies-faculty-bar'

interface ProfileIESFacultyProps {
  ies: IesDocentes | undefined
}

const num = new Intl.NumberFormat('pt-BR')
const decimal = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

const FAIXAS = [
  { rotulo: 'Doutorado', perc: 'perc_doutores', media: 'media_dout_por_curso' },
  { rotulo: 'Mestrado', perc: 'perc_mestres', media: 'media_mest_por_curso' },
  { rotulo: 'Especialização', perc: 'perc_esp', media: 'media_esp_por_curso' },
  { rotulo: 'Graduação', perc: 'perc_grad', media: 'media_grad_por_curso' },
  {
    rotulo: 'Sem graduação',
    perc: 'perc_sem_grad',
    media: 'media_sem_grad_por_curso',
  },
] as const

export const ProfileIESFaculty = ({ ies }: ProfileIESFacultyProps) => {
  return (
    <div className="rounded-card border border-border-secondary bg-white p-[1.125rem] mx-4">
      {ies === undefined || ies.qt_doc_exe === undefined ? (
        <div className="mb-4 text-xs leading-[1.55] text-fg-muted">
          O Censo de 2024 registra zero docentes em exercício nesta instituição.
          Com o total zerado, os percentuais por titulação ficam indeterminados
          e aparecem como travessão (—); as médias por curso, derivadas desse
          mesmo registro, aparecem como 0. Os demais números da instituição
          seguem exibidos normalmente.
        </div>
      ) : (
        <div className="mb-4 text-xs leading-[1.55] text-fg-muted">
          Nesta instituição trabalham{' '}
          <strong className="text-fg">
            {num.format(ies.qt_doc_exe)} docentes em exercício
          </strong>
          . Veja como se distribuem por titulação.
        </div>
      )}

      {FAIXAS.map((f) => (
        <ProfileIESFacultyBar
          key={f.rotulo}
          rotulo={f.rotulo}
          percentual={ies === undefined ? undefined : ies[f.perc]}
          mediaPorCurso={ies === undefined ? undefined : ies[f.media]}
        />
      ))}

      <div className="mt-4 flex flex-wrap gap-6 border-t border-dashed border-border-secondary pt-[0.875rem]">
        <div>
          <div className="font-mono text-xl font-bold leading-none text-fg">
            {ies === undefined || ies.doc_por_curso === undefined
              ? '—'
              : decimal.format(ies.doc_por_curso)}
          </div>
          <div className="mt-[2px] text-2xs leading-[1.45] text-fg-muted">
            docentes em exercício por curso
            <br />
            (média da IES)
          </div>
        </div>

        <div>
          <div className="font-mono text-xl font-bold leading-none text-fg">
            {ies === undefined || ies.qt_cursos === undefined
              ? '—'
              : num.format(ies.qt_cursos)}
          </div>
          <div className="mt-[2px] text-2xs leading-[1.45] text-fg-muted">
            cursos de graduação
            <br />
            ofertados pela IES
          </div>
        </div>
      </div>

      <Callout className="mt-3 rounded-control bg-accent/20 text-accent-deep text-2xs p-[0.75rem] border-accent/30">
        <span>
          Estes indicadores descrevem a instituição inteira — não a distribuição
          dos docentes entre os cursos, nem quantos professores atuam na sua
          sala. A média por curso divide o total de docentes pelo número de
          cursos da IES. Fonte: Censo 2024.
        </span>
      </Callout>
    </div>
  )
}
