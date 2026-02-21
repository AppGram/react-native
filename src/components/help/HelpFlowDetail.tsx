import React from 'react'
import {
  View,
  Text,
  FlatList,
  type ViewStyle,
} from 'react-native'
import { useAppgramTheme } from '../../provider'
import { HelpArticleCard } from './HelpArticleCard'
import type { HelpFlow, HelpArticle } from '../../types'

export interface HelpFlowDetailProps {
  flow: HelpFlow
  onArticlePress?: (article: HelpArticle) => void
  emptyText?: string
  style?: ViewStyle
  contentContainerStyle?: ViewStyle
}

/**
 * HelpFlowDetail Component
 *
 * Displays articles within a help flow/collection.
 * Use with your app's navigation.
 *
 * @example
 * ```tsx
 * import { HelpFlowDetail } from '@appgram/react-native'
 *
 * function HelpFlowScreen({ route }) {
 *   const { flow } = route.params
 *
 *   return (
 *     <HelpFlowDetail
 *       flow={flow}
 *       onArticlePress={(article) => {
 *         navigation.navigate('HelpArticle', { article })
 *       }}
 *       emptyText="No articles available"
 *     />
 *   )
 * }
 * ```
 */
export function HelpFlowDetail({
  flow,
  onArticlePress,
  emptyText = 'No articles in this section',
  style,
  contentContainerStyle,
}: HelpFlowDetailProps): React.ReactElement {
  const { colors, typography, spacing } = useAppgramTheme()
  const articles = flow.articles || []

  const renderItem = ({ item }: { item: HelpArticle }) => (
    <HelpArticleCard
      article={item}
      onPress={onArticlePress}
      style={{ marginBottom: spacing.md }}
    />
  )

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.lg }}>
      <Text
        style={{
          fontSize: typography['2xl'],
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: spacing.xs,
        }}
      >
        {flow.name}
      </Text>
      {flow.description && (
        <Text
          style={{
            fontSize: typography.base,
            color: colors.mutedForeground,
          }}
        >
          {flow.description}
        </Text>
      )}
    </View>
  )

  const renderEmpty = () => (
    <View style={{ padding: spacing.lg, alignItems: 'center' }}>
      <Text style={{ color: colors.mutedForeground }}>
        {emptyText}
      </Text>
    </View>
  )

  return (
    <FlatList
      data={articles}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={[
        { paddingVertical: spacing.lg },
        articles.length === 0 && { flex: 1 },
        contentContainerStyle,
      ]}
    />
  )
}

export default HelpFlowDetail
