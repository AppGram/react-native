import React from 'react'
import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native'
import { useAppgramTheme } from '../../provider'
import type { HelpArticle } from '../../types'

export interface HelpArticleCardProps {
  article: HelpArticle
  onPress?: (article: HelpArticle) => void
  style?: ViewStyle
}

/**
 * HelpArticleCard Component
 *
 * A card displaying a help article preview.
 * Use to build custom help article lists.
 *
 * @example
 * ```tsx
 * import { HelpArticleCard } from '@appgram/react-native'
 *
 * function ArticleList({ articles }) {
 *   return (
 *     <View>
 *       {articles.map(article => (
 *         <HelpArticleCard
 *           key={article.id}
 *           article={article}
 *           onPress={(a) => navigation.navigate('HelpArticle', { article: a })}
 *         />
 *       ))}
 *     </View>
 *   )
 * }
 * ```
 */
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
      activeOpacity={0.7}
      style={[containerStyle, style]}
    >
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

      <Text style={{ color: colors.mutedForeground, marginLeft: spacing.sm }}>
        →
      </Text>
    </TouchableOpacity>
  )
}

export default HelpArticleCard
