'use client'
import { ThemeProviderProps } from 'next-themes'
import {HeroUIProvider} from '@heroui/react'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { useRouter } from 'next/navigation'
interface ProvidersProps {
    children: React.ReactNode;
    themeProps?: ThemeProviderProps;  
}

export function Providers({children,themeProps}:ProvidersProps) {
  const router = useRouter();
  return (
   
     <HeroUIProvider navigate={router.push} >
    
     <ThemeProvider {...themeProps}>
      <SessionProvider>
      {children}</SessionProvider>
      </ThemeProvider>
    
    </HeroUIProvider>
   
  )
}