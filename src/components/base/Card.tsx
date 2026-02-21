import React from 'react'
import { View, type ViewStyle } from 'react-native'
import { useAppgramTheme } from '../../provider'

export interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  variant?: 'default' | 'elevated' | 'outlined'
}

/**
 * Card Component
 *
 * A styled container with variant support.
 * Supports default, elevated, and outlined variants.
 *
 * @example
 * ```tsx
 * import { Card } from '@appgram/react-native'
 *
 * function FeatureCard({ title, description }) {
 *   return (
 *     <Card variant="elevated">
 *       <Text style={{ fontWeight: '600' }}>{title}</Text>
 *       <Text>{description}</Text>
 *     </Card>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Outlined variant
 * <Card variant="outlined" style={{ marginBottom: 16 }}>
 *   <Text>Content here</Text>
 * </Card>
 * ```
 */
export function Card({
  children,
  style,
  variant = 'default',
}: CardProps): React.ReactElement {
  const { colors, radius } = useAppgramTheme()

  const baseStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
  }

  const variantStyles: Record<string, ViewStyle> = {
    default: {},
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    outlined: {
      borderWidth: 1,
      borderColor: colors.border,
    },
  }

  return (
    <View style={[baseStyle, variantStyles[variant], style]}>
      {children}
    </View>
  )
}

export default Card
