/**
 * Badge Component
 *
 * A small status indicator with Hazel design system styling.
 */

import React from 'react'
import { View, Text, type ViewStyle, type TextStyle } from 'react-native'
import { useAppgramTheme } from '../../provider'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  style?: ViewStyle
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  style,
}: BadgeProps): React.ReactElement {
  const { colors, radius, typography } = useAppgramTheme()

  const variantStyles: Record<string, { bg: string; text: string }> = {
    default: { bg: colors.muted, text: colors.mutedForeground },
    success: { bg: colors.successSubtle, text: colors.success },
    warning: { bg: colors.warningSubtle, text: colors.warning },
    error: { bg: colors.errorSubtle, text: colors.error },
    info: { bg: colors.infoSubtle, text: colors.info },
  }

  const sizeStyles: Record<string, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
    sm: { paddingVertical: 2, paddingHorizontal: 8, fontSize: typography.xs },
    md: { paddingVertical: 4, paddingHorizontal: 10, fontSize: typography.sm },
  }

  const current = variantStyles[variant]
  const currentSize = sizeStyles[size]

  const containerStyle: ViewStyle = {
    backgroundColor: current.bg,
    borderRadius: radius.full,
    paddingVertical: currentSize.paddingVertical,
    paddingHorizontal: currentSize.paddingHorizontal,
    alignSelf: 'flex-start',
  }

  const textStyle: TextStyle = {
    fontSize: currentSize.fontSize,
    fontWeight: '500',
    color: current.text,
  }

  return (
    <View style={[containerStyle, style]}>
      <Text style={textStyle}>{children}</Text>
    </View>
  )
}

export default Badge
