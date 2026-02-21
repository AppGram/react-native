/**
 * Hazel Design System Colors for React Native
 *
 * Mobile-optimized color palette based on the Hazel design system.
 */

export interface AppgramColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  card: string
  cardForeground: string
  muted: string
  mutedForeground: string
  border: string
  success: string
  successSubtle: string
  warning: string
  warningSubtle: string
  info: string
  infoSubtle: string
  error: string
  errorSubtle: string
}

// Hazel Light Theme
export const lightColors: AppgramColors = {
  primary: '#0EA5E9',           // Arctic blue
  secondary: '#6B7280',         // Gray
  accent: '#0EA5E9',            // Arctic blue
  background: '#FFFFFF',        // White
  foreground: '#09090B',        // Zinc-950
  card: '#FAFAFA',              // Zinc-50
  cardForeground: '#09090B',    // Zinc-950
  muted: '#F4F4F5',             // Zinc-100
  mutedForeground: '#71717A',   // Zinc-500
  border: '#E4E4E7',            // Zinc-200
  success: '#10B981',           // Emerald-500
  successSubtle: '#ECFDF5',     // Emerald-50
  warning: '#F59E0B',           // Amber-500
  warningSubtle: '#FFFBEB',     // Amber-50
  info: '#3B82F6',              // Blue-500
  infoSubtle: '#EFF6FF',        // Blue-50
  error: '#EF4444',             // Red-500
  errorSubtle: '#FEF2F2',       // Red-50
}

// Hazel Dark Theme
export const darkColors: AppgramColors = {
  primary: '#38BDF8',           // Lighter arctic blue
  secondary: '#3A3A3A',         // Dark gray
  accent: '#38BDF8',            // Lighter arctic blue
  background: '#09090B',        // Zinc-950
  foreground: '#FAFAFA',        // Zinc-50
  card: '#18181B',              // Zinc-900
  cardForeground: '#FAFAFA',    // Zinc-50
  muted: '#27272A',             // Zinc-800
  mutedForeground: '#A1A1AA',   // Zinc-400
  border: '#3F3F46',            // Zinc-700
  success: '#10B981',           // Emerald-500
  successSubtle: '#064E3B',     // Emerald-900
  warning: '#F59E0B',           // Amber-500
  warningSubtle: '#78350F',     // Amber-900
  info: '#3B82F6',              // Blue-500
  infoSubtle: '#1E3A8A',        // Blue-900
  error: '#EF4444',             // Red-500
  errorSubtle: '#7F1D1D',       // Red-900
}

// Common spacing values (following 8pt grid)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const

// Common border radius values
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const

// Typography scale
export const typography = {
  xs: 11,
  sm: 13,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
} as const
