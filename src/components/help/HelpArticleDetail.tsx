import React, { useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  Platform,
  type ViewStyle,
} from 'react-native'
import RenderHtml, { type MixedStyleDeclaration } from 'react-native-render-html'
import { useAppgramTheme } from '../../provider'
import type { HelpArticle } from '../../types'

export interface HelpArticleDetailProps {
  article: HelpArticle
  style?: ViewStyle
  contentContainerStyle?: ViewStyle
}

/**
 * HelpArticleDetail Component
 *
 * Displays help article content with HTML rendering.
 * Use with your app's navigation.
 *
 * @example
 * ```tsx
 * import { HelpArticleDetail } from '@appgram/react-native'
 *
 * function HelpArticleScreen({ route }) {
 *   const { article } = route.params
 *
 *   return (
 *     <HelpArticleDetail
 *       article={article}
 *       style={{ flex: 1 }}
 *       contentContainerStyle={{ paddingHorizontal: 16 }}
 *     />
 *   )
 * }
 * ```
 */
export function HelpArticleDetail({
  article,
  style,
  contentContainerStyle,
}: HelpArticleDetailProps): React.ReactElement {
  const { colors, typography, spacing, radius } = useAppgramTheme()
  const { width } = useWindowDimensions()

  const monoFontFamily = Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  })

  const tagsStyles = useMemo((): Record<string, MixedStyleDeclaration> => ({
    p: { marginBottom: spacing.md },
    h1: { fontSize: typography['2xl'], fontWeight: '700', marginBottom: spacing.md },
    h2: { fontSize: typography.xl, fontWeight: '600', marginBottom: spacing.sm },
    h3: { fontSize: typography.lg, fontWeight: '600', marginBottom: spacing.sm },
    h4: { fontSize: typography.base, fontWeight: '600', marginBottom: spacing.sm },
    ul: { marginBottom: spacing.md },
    ol: { marginBottom: spacing.md },
    li: { marginBottom: spacing.xs },
    a: { color: colors.primary, textDecorationLine: 'underline' },
    strong: { fontWeight: '700' },
    em: { fontStyle: 'italic' },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
      paddingLeft: spacing.md,
      marginVertical: spacing.md,
      fontStyle: 'italic',
      color: colors.mutedForeground,
    },
    code: {
      fontFamily: monoFontFamily,
      fontSize: typography.sm,
      backgroundColor: colors.muted,
      color: colors.foreground,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    pre: {
      fontFamily: monoFontFamily,
      fontSize: typography.sm,
      backgroundColor: colors.muted,
      color: colors.foreground,
      padding: spacing.md,
      borderRadius: radius.lg,
      marginVertical: spacing.md,
      overflow: 'hidden',
    },
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      marginVertical: spacing.md,
    },
    th: {
      backgroundColor: colors.muted,
      padding: spacing.sm,
      fontWeight: '600',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    td: {
      padding: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: spacing.lg,
    },
  }), [colors, typography, spacing, radius, monoFontFamily])

  return (
    <ScrollView
      style={style}
      contentContainerStyle={[{ paddingVertical: spacing.lg }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      <Text
        style={{
          fontSize: typography['2xl'],
          fontWeight: '700',
          color: colors.foreground,
          marginBottom: spacing.lg,
        }}
      >
        {article.title}
      </Text>

      <RenderHtml
        contentWidth={width - spacing.lg * 2}
        source={{ html: article.content }}
        baseStyle={{
          fontSize: typography.base,
          color: colors.foreground,
          lineHeight: 24,
        }}
        tagsStyles={tagsStyles}
        enableExperimentalMarginCollapsing
      />
    </ScrollView>
  )
}

export default HelpArticleDetail
