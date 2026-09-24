import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SiteMenu } from './site-menu'
import { SITE_MENU_LINKS } from './site-menu-links'

const SiteMenuPreview = () => (
  <SiteMenu>
    <SiteMenu.Trigger />
    <SiteMenu.List>
      {SITE_MENU_LINKS.map(({ href, label }) => (
        <SiteMenu.Item key={href} href={href}>
          {label}
        </SiteMenu.Item>
      ))}
    </SiteMenu.List>
  </SiteMenu>
)

const meta = {
  title: 'Components/Layout/SiteMenu',
  component: SiteMenuPreview,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/cursos',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SiteMenuPreview>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const OnHome: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: '/',
      },
    },
  },
}
