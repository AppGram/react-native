/**
 * HelpFlowCard Component
 *
 * A card displaying a help flow/collection with Hazel design system styling.
 */

import React from 'react'
import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native'
import { useAppgramTheme } from '../../provider'
import type { HelpFlow } from '../../types'

export interface HelpFlowCardProps {
  flow: HelpFlow
  onPress?: (flow: HelpFlow) => void
  style?: ViewStyle
}

export function HelpFlowCard({
  flow,
  onPress,
  style,
}: HelpFlowCardProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()

  const containerStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  }

  const handlePress = () => {
    onPress?.(flow)
  }

  const articleCount = flow.articles?.length || 0

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[containerStyle, style]}
    >
      {/* Icon */}
      {flow.icon && (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.md,
            backgroundColor: colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          }}
        >
          <Text style={{ fontSize: 20 }}>{flow.icon}</Text>
        </View>
      )}

      {/* Title */}
      <Text
        style={{
          fontSize: typography.lg,
          fontWeight: '600',
          color: colors.foreground,
          marginBottom: spacing.xs,
        }}
        numberOfLines={2}
      >
        {flow.name}
      </Text>

      {/* Description */}
      {flow.description && (
        <Text
          style={{
            fontSize: typography.sm,
            color: colors.mutedForeground,
            marginBottom: spacing.sm,
          }}
          numberOfLines={2}
        >
          {flow.description}
        </Text>
      )}

      {/* Article count */}
      <Text
        style={{
          fontSize: typography.xs,
          color: colors.mutedForeground,
        }}
      >
        {articleCount} {articleCount === 1 ? 'article' : 'articles'}
      </Text>
    </TouchableOpacity>
  )
}

export default HelpFlowCard
