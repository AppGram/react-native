/**
 * AppgramProvider for React Native
 *
 * Root provider component that manages configuration, API client, theming, and fingerprinting.
 * Wrap your app with this provider to enable Appgram SDK functionality.
 *
 * @example
 * ```tsx
 * import { AppgramProvider } from '@appgram/react-native'
 *
 * function App() {
 *   return (
 *     <AppgramProvider
 *       config={{
 *         projectId: 'your-project-id',
 *         orgSlug: 'your-org',
 *         projectSlug: 'your-project',
 *       }}
 *     >
 *       <NavigationContainer>
 *         {/* Your app content *\/}
 *       </NavigationContainer>
 *     </AppgramProvider>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom theming
 * <AppgramProvider
 *   config={{
 *     projectId: 'your-project-id',
 *     theme: {
 *       mode: 'dark', // 'light' | 'dark' | 'system'
 *       darkColors: {
 *         primary: '#38BDF8',
 *         background: '#0F172A',
 *       },
 *     },
 *   }}
 * >
 *   {children}
 * </AppgramProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Using the context hooks
 * import { useAppgramContext, useAppgramTheme } from '@appgram/react-native'
 *
 * function MyComponent() {
 *   const { client, config, fingerprint } = useAppgramContext()
 *   const { colors, spacing, isDark } = useAppgramTheme()
 *
 *   return (
 *     <View style={{ backgroundColor: colors.background }}>
 *       <Text style={{ color: colors.foreground }}>
 *         Theme: {isDark ? 'Dark' : 'Light'}
 *       </Text>
 *     </View>
 *   )
 * }
 * ```
 */

import React, { useMemo, useEffect, useState, createContext, useContext } from 'react'
import { useColorScheme } from 'react-native'
import { AppgramClient } from '../client/AppgramClient'
import { getFingerprint } from '../utils/fingerprint'
import { lightColors, darkColors, type AppgramColors, spacing, radius, typography } from '../theme'

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Complete theme object with colors, spacing, radius, and typography
 */
export interface AppgramTheme {
  /**
   * Current theme mode
   */
  mode: ThemeMode

  /**
   * Whether dark mode is active
   */
  isDark: boolean

  /**
   * Color palette
   */
  colors: AppgramColors

  /**
   * Spacing scale (xs, sm, md, lg, xl, 2xl)
   */
  spacing: typeof spacing

  /**
   * Border radius scale (sm, md, lg, xl, full)
   */
  radius: typeof radius

  /**
   * Typography scale (xs, sm, base, lg, xl, 2xl, 3xl)
   */
  typography: typeof typography
}

/**
 * Appgram SDK configuration
 */
export interface AppgramConfig {
  /**
   * Your Appgram project ID (required)
   */
  projectId: string

  /**
   * Organization slug for API routing
   */
  orgSlug?: string

  /**
   * Project slug for API routing
   */
  projectSlug?: string

  /**
   * Custom API URL (defaults to https://api.appgram.dev)
   */
  apiUrl?: string

  /**
   * Theme configuration
   */
  theme?: {
    /**
     * Theme mode: 'light', 'dark', or 'system'
     * @default 'system'
     */
    mode?: ThemeMode

    /**
     * Custom light theme colors
     */
    lightColors?: Partial<AppgramColors>

    /**
     * Custom dark theme colors
     */
    darkColors?: Partial<AppgramColors>
  }

  /**
   * Enable device fingerprinting for anonymous voting
   * @default true
   */
  enableFingerprinting?: boolean
}

interface AppgramContextValue {
  /**
   * SDK configuration with resolved defaults
   */
  config: AppgramConfig & { apiUrl: string }

  /**
   * API client instance
   */
  client: AppgramClient

  /**
   * Device fingerprint for anonymous identification
   */
  fingerprint: string | null

  /**
   * Current theme
   */
  theme: AppgramTheme
}

const AppgramContext = createContext<AppgramContextValue | null>(null)

const DEFAULT_API_URL = 'https://api.appgram.dev'

/**
 * Props for AppgramProvider
 */
export interface AppgramProviderProps {
  /**
   * SDK configuration
   */
  config: AppgramConfig

  /**
   * Child components
   */
  children: React.ReactNode
}

/**
 * Root provider component for the Appgram SDK.
 * Provides configuration, API client, theming, and fingerprinting to all child components.
 */
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
 * Hook to access the full Appgram context.
 * Must be used within an AppgramProvider.
 *
 * @throws Error if used outside of AppgramProvider
 */
export function useAppgramContext(): AppgramContextValue {
  const context = useContext(AppgramContext)
  if (!context) {
    throw new Error('useAppgramContext must be used within an AppgramProvider')
  }
  return context
}

/**
 * Hook to access the current theme.
 * Must be used within an AppgramProvider.
 *
 * @throws Error if used outside of AppgramProvider
 */
export function useAppgramTheme(): AppgramTheme {
  const { theme } = useAppgramContext()
  return theme
}
