import type { Oferta } from '@/services/api'

const DESC_BAIXA_RENDA =
  'Escola pública · renda até 1 salário mínimo por pessoa'
const DESC_SEM_RENDA = 'Escola pública · sem exigência de renda'
const DESC_OUTRAS =
  'Reserva de vagas próprias da instituição — consulte a instituição para mais informações'

const MAPA: Record<string, { nome: string; descricao: string | null }> = {
  AC: { nome: 'Ampla concorrência', descricao: null },
  LB_PPI: {
    nome: 'Baixa renda · pretos, pardos e indígenas',
    descricao: DESC_BAIXA_RENDA,
  },
  LB_PP: { nome: 'Baixa renda · pretos e pardos', descricao: DESC_BAIXA_RENDA },
  LB_I: { nome: 'Baixa renda · indígenas', descricao: DESC_BAIXA_RENDA },
  LB_Q: { nome: 'Baixa renda · quilombolas', descricao: DESC_BAIXA_RENDA },
  LB_PCD: {
    nome: 'Baixa renda · pessoas com deficiência',
    descricao: DESC_BAIXA_RENDA,
  },
  LB_EP: {
    nome: 'Baixa renda · demais candidatos',
    descricao: DESC_BAIXA_RENDA,
  },
  LI_PPI: {
    nome: 'Independente de renda · pretos, pardos e indígenas',
    descricao: DESC_SEM_RENDA,
  },
  LI_PP: {
    nome: 'Independente de renda · pretos e pardos',
    descricao: DESC_SEM_RENDA,
  },
  LI_I: {
    nome: 'Independente de renda · indígenas',
    descricao: DESC_SEM_RENDA,
  },
  LI_Q: {
    nome: 'Independente de renda · quilombolas',
    descricao: DESC_SEM_RENDA,
  },
  LI_PCD: {
    nome: 'Independente de renda · pessoas com deficiência',
    descricao: DESC_SEM_RENDA,
  },
  LI_EP: {
    nome: 'Independente de renda · demais candidatos',
    descricao: DESC_SEM_RENDA,
  },
}

export function modalidadePorExtensao(oferta: Oferta): {
  nome: string
  descricao: string | null
} {
  const codigo = oferta.modalidade ?? ''
  const infos = MAPA[codigo]
  if (infos) return infos

  if (codigo === 'B1') {
    return {
      nome: 'Bônus da instituição',
      descricao: oferta.descricao ?? null,
    }
  }

  return {
    nome: 'Outras modalidades da instituição',
    descricao: DESC_OUTRAS,
  }
}
