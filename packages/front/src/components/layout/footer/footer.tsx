'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SouCienciaLogo } from '@/components/ui/sou-ciencia-logo'
import { MODULE_META, MODULES } from '@/lib/module'
import { PAGE_CONTAINER_CLASS, pageContainer } from '@/lib/page-container'
import { cn } from '@/utils/cn'

interface FooterProps {
  className?: string
}

const HEADING = 'text-xs font-bold uppercase tracking-[0.9px] text-on-dark'

const LINK =
  'text-sm text-on-dark transition-colors duration-fast hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark'

export const Footer = ({ className }: FooterProps) => {
  const pathname = usePathname()
  const width = PAGE_CONTAINER_CLASS[pageContainer(pathname)]

  return (
    <footer className={cn('mx-auto w-full my-4', width, className)}>
      <div className="bg-surface-footer text-on-dark px-5 py-10 rounded-panel shadw">
        <div className="grid gap-8 text-center md:grid-cols-2 md:text-left">
          <div className="flex flex-col items-center gap-5 md:items-start">
            <SouCienciaLogo className="h-auto w-full max-w-xs" />
            <p className="text-xs leading-[1.6] text-on-dark">
              Um produto do <strong>SoU_Ciência · Unifesp</strong> · Dados
              públicos ·{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/deed.pt-br"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-dark"
              >
                Licença Creative Commons BY 4.0
              </a>{' '}
              · Censo da Educação Superior (INEP) · e-MEC · Sisu
            </p>
          </div>

          <nav aria-label="Rodapé" className="grid gap-8 md:grid-cols-2">
            <section>
              <h2 className={HEADING}>Rotas</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {MODULES.map((module) => (
                  <li key={module}>
                    <Link href={MODULE_META[module].href} className={LINK}>
                      {MODULE_META[module].title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={HEADING}>Institucional</h2>
              <ul className="mt-3 flex flex-col gap-2">
                <li>
                  <Link href="/sobre" className={LINK}>
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/metodologia" className={LINK}>
                    Metodologia
                  </Link>
                </li>
                <li>
                  <a
                    href="https://souciencia.unifesp.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK}
                  >
                    SoU_Ciência
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.unifesp.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={LINK}
                  >
                    Unifesp
                  </a>
                </li>
              </ul>
            </section>
          </nav>
        </div>
      </div>
    </footer>
  )
}
