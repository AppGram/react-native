/**
 * HelpArticleCard Component
 *
 * A card displaying a help article preview.
 */

import React from 'react'
import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native'
import { useAppgramTheme } from '../../provider'
import type { HelpArticle } from '../../types'

export interface HelpArticleCardProps {
  article: HelpArticle
  onPress?: (article: HelpArticle) => void
  style?: ViewStyle
}

export function HelpArticleCard({
  article,
  onPress,
  style,
}: HelpArticleCardProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()

  const containerStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  }

  const handlePress = () => {
    onPress?.(article)
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[containerStyle, style]}
    >
      {/* Document Icon */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.md,
          backgroundColor: colors.muted,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: spacing.md,
        }}
      >
        <Text style={{ fontSize: 16, color: colors.mutedForeground }}>📄</Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.base,
            fontWeight: '500',
            color: colors.foreground,
          }}
          numberOfLines={2}
        >
          {article.title}
        </Text>
        {article.excerpt && (
          <Text
            style={{
              fontSize: typography.sm,
              color: colors.mutedForeground,
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {article.excerpt}
          </Text>
        )}
      </View>

      {/* Arrow */}
      <Text style={{ color: colors.mutedForeground, marginLeft: spacing.sm }}>
        →
      </Text>
    </TouchableOpacity>
  )
}

export default HelpArticleCard
