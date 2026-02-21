/**
 * Button Component
 *
 * A styled button with Hazel design system styling.
 */

import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { useAppgramTheme } from '../../provider'

export interface ButtonProps {
  children: React.ReactNode
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps): React.ReactElement {
  const { colors, radius, typography } = useAppgramTheme()

  const sizeStyles: Record<string, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
    sm: { paddingVertical: 8, paddingHorizontal: 12, fontSize: typography.sm },
    md: { paddingVertical: 12, paddingHorizontal: 16, fontSize: typography.base },
    lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: typography.lg },
  }

  const variantStyles: Record<string, { container: ViewStyle; text: TextStyle }> = {
    primary: {
      container: {
        backgroundColor: colors.primary,
      },
      text: {
        color: '#FFFFFF',
      },
    },
    secondary: {
      container: {
        backgroundColor: colors.muted,
      },
      text: {
        color: colors.foreground,
      },
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      },
      text: {
        color: colors.foreground,
      },
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
      },
      text: {
        color: colors.primary,
      },
    },
  }

  const currentSize = sizeStyles[size]
  const currentVariant = variantStyles[variant]

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingVertical: currentSize.paddingVertical,
    paddingHorizontal: currentSize.paddingHorizontal,
    opacity: disabled || loading ? 0.5 : 1,
    ...currentVariant.container,
  }

  const labelStyle: TextStyle = {
    fontSize: currentSize.fontSize,
    fontWeight: '600',
    ...currentVariant.text,
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[containerStyle, style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={currentVariant.text.color}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text style={[labelStyle, textStyle]}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}

export default Button
