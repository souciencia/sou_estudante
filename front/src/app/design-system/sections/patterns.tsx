'use client'

import { useState } from 'react'
import { MunicipioFilter } from '@/components/search/municipio-filter/municipio-filter'
import { Button } from '@/components/ui/button/button'
import { SkeletonCard } from '@/components/ui/card/skeleton-card'
import { ErrorMessage } from '@/components/ui/error-message'
import { Route } from '@/components/ui/route/route'
import { MODULES } from '@/lib/module'
import { Section, SubSection } from '../kit'

const MUNICIPIOS_DEMO = [
  { codigo: '3509502', nome: 'Campinas' },
  { codigo: '3550308', nome: 'São Paulo' },
  { codigo: '3548708', nome: 'São Bernardo do Campo' },
  { codigo: '3520509', nome: 'Indaiatuba' },
]

function MunicipioFilterDemo() {
  const [selected, setSelected] = useState<string[]>(['3550308'])

  return (
    <div className="max-w-64">
      <MunicipioFilter
        label="Municípios de São Paulo"
        options={MUNICIPIOS_DEMO}
        selected={selected}
        onToggle={(codigo) =>
          setSelected((current) =>
            current.includes(codigo)
              ? current.filter((item) => item !== codigo)
              : [...current, codigo],
          )
        }
        module="1"
      />
    </div>
  )
}

export function Patterns() {
  return (
    <Section
      id="patterns"
      title="Composições e padrões"
      description="Como os primitivos se combinam. Também demonstra o padrão Scoped-Variable: o mesmo componente muda de acento só pelo data-module."
    >
      <SubSection title="Chips de filtro com seleção">
        <div className="flex flex-wrap gap-2">
          <Button active>Gratuito</Button>
          <Button>Presencial</Button>
          <Button>EAD</Button>
          <Button>Integral</Button>
          <Button v="outline">Noturno</Button>
        </div>
      </SubSection>

      <SubSection title="Menu de municípios (multi-select)">
        <MunicipioFilterDemo />
      </SubSection>

      <SubSection title="Acento escopado por módulo (mesmo componente)">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {MODULES.map((module) => (
            <Route key={module} module={module} />
          ))}
        </div>
      </SubSection>

      <SubSection title="Lista em carregamento">
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </SubSection>

      <SubSection title="Estado de erro">
        <div className="max-w-xl">
          <ErrorMessage message="Não foi possível buscar os cursos. Tente novamente." />
        </div>
      </SubSection>
    </Section>
  )
}
