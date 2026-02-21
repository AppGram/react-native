import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { useAppgramTheme } from '../../provider'

export interface ButtonProps {
  children: React.ReactNode
  onPress: () => void
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

/**
 * Button Component
 *
 * A styled button with variant support.
 * Supports solid, outline, and ghost variants with sm, md, lg sizes.
 *
 * @example
 * ```tsx
 * import { Button } from '@appgram/react-native'
 *
 * function SubmitButton() {
 *   return (
 *     <Button
 *       onPress={handleSubmit}
 *       variant="solid"
 *       size="lg"
 *       loading={isSubmitting}
 *     >
 *       Submit
 *     </Button>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Outline and ghost variants
 * <Button variant="outline" onPress={handleCancel}>Cancel</Button>
 * <Button variant="ghost" onPress={handleSkip}>Skip</Button>
 * ```
 */
export function Button({
  children,
  onPress,
  variant = 'solid',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps): React.ReactElement {
  const { colors, radius } = useAppgramTheme()

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 12, fontSize: 14 },
    md: { paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 24, fontSize: 18 },
  }

  const variantStyles = {
    solid: {
      container: { backgroundColor: colors.primary } as ViewStyle,
      text: { color: '#FFFFFF' } as TextStyle,
      spinnerColor: '#FFFFFF',
    },
    outline: {
      container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary } as ViewStyle,
      text: { color: colors.primary } as TextStyle,
      spinnerColor: colors.primary,
    },
    ghost: {
      container: { backgroundColor: 'transparent' } as ViewStyle,
      text: { color: colors.primary } as TextStyle,
      spinnerColor: colors.primary,
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
      {loading && (
        <ActivityIndicator
          size="small"
          color={currentVariant.spinnerColor}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[labelStyle, textStyle]}>{children}</Text>
    </TouchableOpacity>
  )
}

export default Button
