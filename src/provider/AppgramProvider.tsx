/**
 * AppgramProvider for React Native
 *
 * Root provider that manages configuration, API client, and theming.
 */

import React, { useMemo, useEffect, useState, createContext, useContext } from 'react'
import { useColorScheme } from 'react-native'
import { AppgramClient } from '../client/AppgramClient'
import { getFingerprint } from '../utils/fingerprint'
import { lightColors, darkColors, type AppgramColors, spacing, radius, typography } from '../theme'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppgramTheme {
  mode: ThemeMode
  isDark: boolean
  colors: AppgramColors
  spacing: typeof spacing
  radius: typeof radius
  typography: typeof typography
}

export interface AppgramConfig {
  projectId: string
  orgSlug?: string
  projectSlug?: string
  apiUrl?: string
  theme?: {
    mode?: ThemeMode
    lightColors?: Partial<AppgramColors>
    darkColors?: Partial<AppgramColors>
  }
  enableFingerprinting?: boolean
}

interface AppgramContextValue {
  config: AppgramConfig & { apiUrl: string }
  client: AppgramClient
  fingerprint: string | null
  theme: AppgramTheme
}

const AppgramContext = createContext<AppgramContextValue | null>(null)

const DEFAULT_API_URL = 'https://api.appgram.dev'

export interface AppgramProviderProps {
  config: AppgramConfig
  children: React.ReactNode
}

export function AppgramProvider({ config, children }: AppgramProviderProps): React.ReactElement {
  const systemColorScheme = useColorScheme()
  const [fingerprint, setFingerprint] = useState<string | null>(null)

  const themeMode = config.theme?.mode ?? 'system'

  // Determine if dark mode
  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true
    if (themeMode === 'light') return false
    return systemColorScheme === 'dark'
  }, [themeMode, systemColorScheme])

  // Initialize fingerprint
  useEffect(() => {
    if (config.enableFingerprinting !== false) {
      setFingerprint(getFingerprint())
    }
  }, [config.enableFingerprinting])

  // Create API client
  const client = useMemo(() => {
    return new AppgramClient({
      baseUrl: config.apiUrl || DEFAULT_API_URL,
      projectId: config.projectId,
      orgSlug: config.orgSlug,
      projectSlug: config.projectSlug,
    })
  }, [config.apiUrl, config.projectId, config.orgSlug, config.projectSlug])

  // Resolve colors
  const colors = useMemo<AppgramColors>(() => {
    const baseColors = isDark ? darkColors : lightColors
    const customColors = isDark ? config.theme?.darkColors : config.theme?.lightColors
    return { ...baseColors, ...customColors }
  }, [isDark, config.theme?.lightColors, config.theme?.darkColors])

  // Build theme object
  const theme = useMemo<AppgramTheme>(() => ({
    mode: themeMode,
    isDark,
    colors,
    spacing,
    radius,
    typography,
  }), [themeMode, isDark, colors])

  // Context value
  const contextValue = useMemo<AppgramContextValue>(() => ({
    config: {
      ...config,
      apiUrl: config.apiUrl || DEFAULT_API_URL,
    },
    client,
    fingerprint,
    theme,
  }), [config, client, fingerprint, theme])

  return (
    <AppgramContext.Provider value={contextValue}>
      {children}
    </AppgramContext.Provider>
  )
}

/**
 * Hook to access Appgram context
 */
export function useAppgramContext(): AppgramContextValue {
  const context = useContext(AppgramContext)
  if (!context) {
    throw new Error('useAppgramContext must be used within an AppgramProvider')
  }
  return context
}

/**
 * Hook to access theme
 */
export function useAppgramTheme(): AppgramTheme {
  const { theme } = useAppgramContext()
  return theme
}
