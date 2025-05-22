'use client'
import { ThemeProviderProps } from 'next-themes'
import {HeroUIProvider} from '@heroui/react'


interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;  
}

export function Providers({children,themeProps}:ProvidersProps) {
  return (
    <HeroUIProvider>
    
      {children}
    
    </HeroUIProvider>
  )
}