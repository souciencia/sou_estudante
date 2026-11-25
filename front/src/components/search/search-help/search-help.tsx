'use client'

import { CircleHelp } from 'lucide-react'
import Image from 'next/image'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button/button'
import { Dialog } from '@/components/ui/dialog/dialog'
import { Typo } from '@/components/ui/typo'
import type { Module } from '@/lib/module'
import { cn } from '@/utils/cn'
import {
  type HelpBlock,
  type HelpItem,
  SEARCH_HELP_CONTENT,
} from './search-help-content'

interface SearchHelpProps {
  module?: Module
  className?: string
}

/**
 * Botão "Entenda como pesquisar" com diálogo explicativo, exibido abaixo dos
 * filtros. O conteúdo vem de `search-help-content.ts` e cobre como pesquisar,
 * como comparar e como interpretar os dados do painel.
 */
export function SearchHelp({ module, className }: SearchHelpProps) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const dialogId = useId()

  return (
    <div data-module={module} className={cn('flex justify-end', className)}>
      <Button
        module={module}
        v="solid"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
      >
        <CircleHelp className="size-4" aria-hidden="true" />
        Entenda como pesquisar no SoU_Estudante
      </Button>

      <Dialog
        id={dialogId}
        open={open}
        onClose={() => setOpen(false)}
        labelledBy={titleId}
        closeLabel="Fechar ajuda"
        className="max-w-2xl"
      >
        <div className="pb-5">
          <Typo
            t="h2"
            s="xl"
            id={titleId}
            className="font-display font-bold text-fg"
          >
            Entenda como pesquisar no SoU_Estudante
          </Typo>
          <div
            aria-hidden="true"
            className="mt-3 h-1 w-16 rounded-full bg-accent"
          />
        </div>

        <div className="flex flex-col gap-5">
          {SEARCH_HELP_CONTENT.map((section) => (
            <HelpSection key={section.title} section={section} />
          ))}
        </div>
      </Dialog>
    </div>
  )
}

function HelpSection({
  section,
}: {
  section: (typeof SEARCH_HELP_CONTENT)[number]
}) {
  return (
    <section className="rounded-panel border border-border-primary bg-surface-lv2 p-4 sm:p-5">
      <header className="flex items-center gap-2.5 border-b border-border-primary pb-3">
        <span
          aria-hidden="true"
          className="h-4 w-1 shrink-0 rounded-full bg-accent"
        />
        <Typo t="h3" s="md" className="font-display font-bold text-fg">
          {section.title}
        </Typo>
      </header>

      <div className="mt-4">
        {section.intro && (
          <Typo t="p" s="sm" className="text-fg-muted">
            {section.intro}
          </Typo>
        )}

        {section.bullets && (
          <ul className="mt-3 flex flex-col gap-2">
            {section.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-accent"
                />
                <Typo t="p" s="sm" className="text-fg">
                  {bullet}
                </Typo>
              </li>
            ))}
          </ul>
        )}

        {section.items && (
          <div className="mt-4 flex flex-col gap-6">
            {section.items.map((item) => (
              <HelpItemView key={item.question} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function HelpItemView({ item }: { item: HelpItem }) {
  return (
    <div>
      <Typo t="h4" s="sm" className="font-sans font-bold text-accent-deep">
        {item.question}
      </Typo>

      <div className="mt-2 flex flex-col gap-2">
        {item.blocks.map((block) => (
          <HelpBlockView
            key={block.kind === 'definition' ? block.term : block.text}
            block={block}
          />
        ))}
      </div>

      {item.source && (
        <span className="mt-3 inline-flex items-center rounded-control border border-info-border bg-info-surface px-2.5 py-1 text-xs font-semibold text-info-deep">
          {item.source}
        </span>
      )}

      {item.image && (
        <Image
          src={item.image.src}
          alt={item.image.alt}
          width={item.image.width}
          height={item.image.height}
          className="mt-3 h-auto w-full rounded-panel border border-border-primary"
        />
      )}
    </div>
  )
}

function HelpBlockView({ block }: { block: HelpBlock }) {
  if (block.kind === 'paragraph') {
    return (
      <Typo t="p" s="sm" className="text-fg">
        {block.text}
      </Typo>
    )
  }

  return (
    <Typo t="p" s="sm" className="border-l-2 border-accent/40 pl-3 text-fg">
      <strong className="font-semibold text-fg">{block.term}</strong>{' '}
      {block.text}
    </Typo>
  )
}
