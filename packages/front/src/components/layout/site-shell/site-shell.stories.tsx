import type { Meta, StoryObj } from '@storybook/react'
import { SiteShell } from './site-shell'

const meta = {
  title: 'Components/Layout/SiteShell',
  component: SiteShell,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SiteShell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <h1 className="font-display text-protagonist-xl font-semibold text-text">
          Conteúdo da página
        </h1>
        <p className="mt-2 text-protagonist text-text-muted">
          O shell global renderiza o header e o footer ao redor deste conteúdo.
        </p>
      </div>
    ),
  },
}
