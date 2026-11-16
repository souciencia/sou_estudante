import { ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'
import { Tag } from '@/components/ui/tag/tag'

interface ProfilePermanenciaFinancingProps {
  tipo: 'prouni' | 'fies' | 'cotas'
  valor: number
  ingressantes: number
  integrais?: number
  parciais?: number
  descricao: string
}

export const ProfilePermanenciaFinancing = ({
  tipo,
  valor,
  ingressantes,
  integrais,
  parciais,
  descricao,
}: ProfilePermanenciaFinancingProps) => {
  const porcentagem = Math.round((valor / ingressantes) * 100)
  const larguraBarra = Math.min(100, (valor / ingressantes) * 100)
  const corProuni = '#2ECC8A'
  const corFies = '#FFA000'

  if (tipo === 'prouni') {
    return (
      <div className="mb-3 rounded-card border border-border-secondary bg-surface-lv2 p-[1.125rem]">
        <div className="mb-[0.625rem] flex items-start justify-between gap-3">
          <p className="text-sm font-bold text-fg">ProUni</p>
          <Tag
            label={'INTEGRAL OU PARCIAL'}
            module={'3'}
            className="border-none bg-ok-surface font-bold text-ok/85 py-[2px] text-2xs"
          />
        </div>

        {valor === 0 ? (
          <div className="mb-[0.375rem] text-sm font-semibold text-fg-muted">
            Nenhum beneficiário registrado em 2024
          </div>
        ) : (
          <>
            <div className="mb-2 font-mono text-xl font-bold leading-none text-fg">
              {valor}{' '}
              <small className="font-sans text-xs font-medium text-fg-muted">
                de {ingressantes} ingressantes · {porcentagem}%
              </small>
            </div>
            <div className="mb-2 text-2xs text-fg-muted">
              {integrais} integrais · {parciais} parciais
            </div>
            <div className="mb-2 h-[9px] overflow-hidden rounded-[5px] bg-surface-deep">
              <div
                className="h-full rounded-[5px]"
                style={{
                  width: `${larguraBarra}%`,
                  background: `${corProuni}`,
                }}
              />
            </div>
          </>
        )}

        <p className="mb-1 text-xs leading-[1.55] text-fg-muted">{descricao}</p>
        <div className="mt-2 flex items-center gap-[6px] text-2xs text-fg-muted">
          <Info className="size-3" />
          Censo · 2024
        </div>
      </div>
    )
  }

  if (tipo === 'fies') {
    return (
      <div className="mb-3 rounded-card border border-border-secondary bg-surface-lv2 p-[1.125rem]">
        <div className="mb-[0.625rem] flex items-start justify-between gap-3">
          <p className="text-sm font-bold text-fg">Fies</p>
          <Tag
            label={'REEMBOLSÁVEL · COM JUROS'}
            module={'3'}
            className="border-none bg-warn-surface font-bold text-warn/85 py-[2px] text-2xs"
          />
        </div>

        {valor === 0 ? (
          <div className="mb-[0.375rem] text-sm font-semibold text-fg-muted">
            Nenhum beneficiário registrado em 2024
          </div>
        ) : (
          <>
            <div className="mb-2 font-mono text-xl font-bold leading-none text-fg">
              {valor}{' '}
              <small className="font-sans text-xs font-medium text-fg-muted">
                de {ingressantes} ingressantes · {porcentagem}%
              </small>
            </div>
            <div className="mb-2 h-[9px] overflow-hidden rounded-[5px] bg-surface-deep">
              <div
                className="h-full rounded-[5px]"
                style={{
                  width: `${larguraBarra}%`,
                  background: `${corFies}`,
                }}
              />
            </div>
          </>
        )}

        <p className="mb-1 text-xs leading-[1.55] text-fg-muted">{descricao}</p>
        <div className="mt-2 flex items-center gap-[6px] text-2xs text-fg-muted">
          <Info className="size-3" />
          Censo · 2024
        </div>
      </div>
    )
  }

  return (
    <div className="mb-3 rounded-card border border-border-secondary bg-surface-lv2 p-[1.125rem]">
      <div className="mb-[0.625rem] flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-fg">Cotas · reserva de vagas</p>
        <Tag
          label={'RESERVA DE VAGAS'}
          module={'3'}
          className="border-none bg-accent/20 font-bold text-accent-deep/80 py-[2px] text-2xs"
        />
      </div>

      {valor === 0 ? (
        <div className="mb-[0.375rem] text-sm font-semibold text-fg-muted">
          Nenhum beneficiário registrado em 2024
        </div>
      ) : (
        <>
          <div className="mb-2 font-mono text-xl font-bold leading-none text-fg">
            {valor}{' '}
            <small className="font-sans text-xs font-medium text-fg-muted">
              de {ingressantes} ingressantes · {porcentagem}%
            </small>
          </div>
          <div className="mb-2 h-[9px] overflow-hidden rounded-[5px] bg-surface-deep">
            <div
              className="h-full rounded-[5px] bg-accent"
              style={{
                width: `${larguraBarra}%`,
              }}
            />
          </div>
        </>
      )}

      <p className="mb-1 text-xs leading-[1.55] text-fg-muted">{descricao}</p>
      <div className="mt-2 flex items-center gap-[6px] text-2xs text-fg-muted">
        <Info className="size-3" />
        Censo · 2024
      </div>

      <Link
        href={'https://souciencia.unifesp.br/painel-de-cotas'}
        className="mt-[0.625rem] flex items-center gap-1 text-2xs font-semibold text-accent-deep"
      >
        Ver tipos no Painel de Cotas
        <ArrowRight className="size-3" />
      </Link>

      <Link
        href={'https://souciencia.unifesp.br/cartilha-cotas'}
        className="mt-[0.625rem] flex items-center gap-1 text-2xs font-semibold text-accent-deep"
      >
        Entenda as cotas na Cartilha
        <ArrowRight className="size-3" />
      </Link>
    </div>
  )
}
