import React from 'react'
import { View, Text, type ViewStyle, type TextStyle } from 'react-native'
import { useAppgramTheme } from '../../provider'

export interface BadgeProps {
  children: React.ReactNode
  action?: 'muted' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  style?: ViewStyle
}

/**
 * Badge Component
 *
 * A small status indicator with variant support.
 * Supports muted, success, warning, error, and info actions.
 *
 * @example
 * ```tsx
 * import { Badge } from '@appgram/react-native'
 *
 * function StatusBadge({ status }) {
 *   const action = status === 'active' ? 'success' : 'muted'
 *   return (
 *     <Badge action={action} size="sm">
 *       {status}
 *     </Badge>
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Different action types
 * <Badge action="success">Active</Badge>
 * <Badge action="warning">Pending</Badge>
 * <Badge action="error">Failed</Badge>
 * <Badge action="info">New</Badge>
 * ```
 */
export function Badge({
  children,
  action = 'muted',
  size = 'sm',
  style,
}: BadgeProps): React.ReactElement {
  const { colors, radius, typography } = useAppgramTheme()

  const actionStyles: Record<string, { bg: string; text: string }> = {
    muted: { bg: colors.muted, text: colors.mutedForeground },
    success: { bg: colors.successSubtle, text: colors.success },
    warning: { bg: colors.warningSubtle, text: colors.warning },
    error: { bg: colors.errorSubtle, text: colors.error },
    info: { bg: colors.infoSubtle, text: colors.info },
  }

  const sizeStyles = {
    sm: { paddingVertical: 2, paddingHorizontal: 8, fontSize: typography.xs },
    md: { paddingVertical: 4, paddingHorizontal: 10, fontSize: typography.sm },
    lg: { paddingVertical: 6, paddingHorizontal: 12, fontSize: typography.base },
  }

  const current = actionStyles[action]
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
