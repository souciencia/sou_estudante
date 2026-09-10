import { createContext, useContext } from 'react'
import type { Module } from '@/lib/module'

export const CardContext = createContext<Module>('1')

export const useCardModule = () => useContext(CardContext)
