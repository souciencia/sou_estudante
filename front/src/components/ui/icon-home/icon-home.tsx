import type { Module } from '@/lib/module'
import { AnchorIcon } from '../route/icons/anchor-icon'
import { CompassIcon } from '../route/icons/compass-icon'
import { NauticalIcon } from '../route/icons/nautical-icon'
import { SextantIcon } from '../route/icons/sextant-icon'
import { TelescopeIcon } from '../route/icons/telescope-icon'

interface IconHomeProps {
  module: Module
}

const icons = {
  '1': <NauticalIcon className="w-7 h-7" />,
  '2': <CompassIcon className="w-7 h-7" />,
  '3': <AnchorIcon className="w-7 h-7" />,
  '4': <TelescopeIcon className="w-7 h-7" />,
  '5': <SextantIcon className="w-7 h-7" />,
}

export function IconHome({ module }: IconHomeProps) {
  return icons[module]
}
