/**
 * Card Component
 *
 * A styled container with Hazel design system styling.
 */

import React from 'react'
import { View, StyleSheet, type ViewStyle } from 'react-native'
import { useAppgramTheme } from '../../provider'

export interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ children, style, variant = 'default' }: CardProps): React.ReactElement {
  const { colors, radius } = useAppgramTheme()

  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    ...(variant === 'elevated' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    }),
    ...(variant === 'outlined' && {
      borderWidth: 1,
      borderColor: colors.border,
    }),
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  )
}

export default Card
