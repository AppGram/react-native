/**
 * @appgram/react-native
 *
 * React Native SDK for Appgram - feature voting, roadmaps, changelogs,
 * help center, support, and status pages.
 *
 * @example
 * ```tsx
 * import { AppgramProvider, WishList, SupportForm } from '@appgram/react-native'
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
 *       <WishList onWishPress={(wish) => console.log(wish)} />
 *     </AppgramProvider>
 *   )
 * }
 * ```
 */

// Provider
export {
  AppgramProvider,
  useAppgramContext,
  useAppgramTheme,
  type AppgramProviderProps,
  type AppgramConfig,
  type AppgramTheme,
  type ThemeMode,
} from './provider'

// Client
export { AppgramClient, type AppgramClientConfig } from './client'

// Hooks
export * from './hooks'

// Components
export * from './components'

// Theme
export {
  lightColors,
  darkColors,
  spacing,
  radius,
  typography,
  type AppgramColors,
} from './theme'

// Types
export * from './types'

// Utils
export { getFingerprint, getErrorMessage } from './utils'
