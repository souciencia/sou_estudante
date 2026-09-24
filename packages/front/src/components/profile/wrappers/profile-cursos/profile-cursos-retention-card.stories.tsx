import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ProfileCursosRetentionCard } from './profile-cursos-retention-card'

const meta = {
  title: 'Components/Profile/Wrappers/ProfileCursos/RetentionCard',
  component: ProfileCursosRetentionCard,
  tags: ['autodocs'],
} satisfies Meta<typeof ProfileCursosRetentionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    taxa: 25.6,
    mediaBrasil: 54.8,
    anoInicio: 2020,
    anoFim: 2024,
  },
}
