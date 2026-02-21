import React from 'react'
import { View, Text, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { Sparkles, Bug, Zap, Wrench } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useRelease } from '../../hooks'
import type { Release, ReleaseFeature, ReleaseItem } from '../../types'

const SCREEN_WIDTH = Dimensions.get('window').width

export interface ReleaseDetailProps {
  release?: Release
  releaseSlug?: string
}

const ITEM_ICONS = { feature: Sparkles, improvement: Zap, bugfix: Bug, other: Wrench } as const
const ITEM_COLORS = { feature: '#10B981', improvement: '#3B82F6', bugfix: '#EF4444', other: '#6B7280' } as const

/**
 * ReleaseDetail Component
 *
 * Displays a single release with its description, features, and changelog items.
 * Can receive release data directly or fetch by slug.
 *
 * @example
 * ```tsx
 * import { ReleaseDetail } from '@appgram/react-native'
 *
 * function ReleaseDetailScreen({ route }) {
 *   return (
 *     <ReleaseDetail releaseSlug={route.params.slug} />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With pre-fetched release data
 * <ReleaseDetail release={selectedRelease} />
 * ```
 */
export function ReleaseDetail({ release: passedRelease, releaseSlug }: ReleaseDetailProps) {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { release: fetchedRelease, features, isLoading, error } = useRelease({
    releaseSlug: releaseSlug || passedRelease?.slug || '',
    skip: !releaseSlug && !passedRelease?.slug
  })

  const release = passedRelease || fetchedRelease
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const imageWidth = SCREEN_WIDTH - spacing.lg * 2

  const markdownStyles = {
    body: { color: colors.foreground, fontSize: typography.base, lineHeight: 24 },
    heading1: { color: colors.foreground, fontSize: typography['2xl'], fontWeight: '700' as const, marginBottom: spacing.md, marginTop: spacing.lg },
    heading2: { color: colors.foreground, fontSize: typography.xl, fontWeight: '600' as const, marginBottom: spacing.sm, marginTop: spacing.md },
    heading3: { color: colors.foreground, fontSize: typography.lg, fontWeight: '600' as const, marginBottom: spacing.sm, marginTop: spacing.md },
    paragraph: { color: colors.foreground, fontSize: typography.base, lineHeight: 24, marginBottom: spacing.md },
    link: { color: colors.primary },
    blockquote: { backgroundColor: colors.muted, borderLeftColor: colors.primary, borderLeftWidth: 4, paddingLeft: spacing.md, paddingVertical: spacing.sm, marginVertical: spacing.md },
    code_inline: { backgroundColor: colors.muted, color: colors.foreground, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.sm, fontSize: typography.sm },
    code_block: { backgroundColor: colors.muted, color: colors.foreground, padding: spacing.md, borderRadius: radius.md, fontSize: typography.sm, marginVertical: spacing.md },
    fence: { backgroundColor: colors.muted, color: colors.foreground, padding: spacing.md, borderRadius: radius.md, fontSize: typography.sm, marginVertical: spacing.md },
    list_item: { color: colors.foreground, fontSize: typography.base, marginBottom: spacing.xs },
    bullet_list: { marginBottom: spacing.md },
    ordered_list: { marginBottom: spacing.md },
    hr: { backgroundColor: colors.border, height: 1, marginVertical: spacing.lg },
    strong: { fontWeight: '600' as const },
    em: { fontStyle: 'italic' as const },
    image: { width: imageWidth, height: imageWidth * 0.5, borderRadius: radius.md, marginVertical: spacing.md, resizeMode: 'cover' as const },
    table: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, marginVertical: spacing.md },
    thead: { backgroundColor: colors.muted },
    th: { padding: spacing.sm, borderBottomWidth: 1, borderRightWidth: 1, borderColor: colors.border, fontWeight: '600' as const, color: colors.foreground },
    tr: { borderBottomWidth: 1, borderColor: colors.border },
    td: { padding: spacing.sm, borderRightWidth: 1, borderColor: colors.border, color: colors.foreground },
  }

  if (isLoading && !release) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>
  if (error && !release) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: colors.error }}>{error}</Text></View>
  if (!release) return null

  const renderItem = (item: ReleaseItem) => {
    const Icon = ITEM_ICONS[item.type] || Wrench
    const color = ITEM_COLORS[item.type] || ITEM_COLORS.other
    return (
      <View key={item.id} style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color + '20', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: typography.base, fontWeight: '500', color: colors.foreground }}>{item.title}</Text>
            {item.description && <Text style={{ fontSize: typography.sm, color: colors.mutedForeground, marginTop: 4, lineHeight: 20 }}>{item.description}</Text>}
          </View>
        </View>
        {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={{ width: '100%', height: 180, borderRadius: radius.md, marginTop: spacing.md }}
            resizeMode="cover"
          />
        )}
      </View>
    )
  }

  const renderFeature = (feature: ReleaseFeature) => (
    <View key={feature.id} style={{ marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={16} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: typography.base, fontWeight: '500', color: colors.foreground }}>{feature.title}</Text>
          {feature.description && <Text style={{ fontSize: typography.sm, color: colors.mutedForeground, marginTop: 4, lineHeight: 20 }}>{feature.description}</Text>}
        </View>
      </View>
      {feature.image_url && (
        <Image
          source={{ uri: feature.image_url }}
          style={{ width: '100%', height: 180, borderRadius: radius.md, marginTop: spacing.md }}
          resizeMode="cover"
        />
      )}
    </View>
  )

  const allItems = release.items || []
  const allFeatures = features || release.features || []

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: spacing.lg }} showsVerticalScrollIndicator={false}>
      {/* Cover Image */}
      {release.cover_image_url && (
        <Image
          source={{ uri: release.cover_image_url }}
          style={{ width: '100%', height: 200, borderRadius: radius.lg, marginBottom: spacing.lg }}
          resizeMode="cover"
        />
      )}

      {/* Header */}
      <View style={{ marginBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          {release.version && <Text style={{ fontSize: typography.xl, fontWeight: '700', color: colors.primary }}>{release.version}</Text>}
          <Text style={{ fontSize: typography.sm, color: colors.mutedForeground }}>{formatDate(release.published_at || release.created_at)}</Text>
        </View>
        <Text style={{ fontSize: typography['2xl'], fontWeight: '700', color: colors.foreground }}>{release.title}</Text>
      </View>

      {/* Content (Markdown) */}
      {release.content && (
        <View style={{ marginBottom: spacing.xl }}>
          <Markdown style={markdownStyles}>{release.content}</Markdown>
        </View>
      )}

      {/* Changes/Items */}
      {allItems.length > 0 && (
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={{ fontSize: typography.lg, fontWeight: '600', color: colors.foreground, marginBottom: spacing.lg }}>Changes</Text>
          {allItems.map(renderItem)}
        </View>
      )}

      {/* Features */}
      {allFeatures.length > 0 && (
        <View>
          <Text style={{ fontSize: typography.lg, fontWeight: '600', color: colors.foreground, marginBottom: spacing.lg }}>Features</Text>
          {allFeatures.map(renderFeature)}
        </View>
      )}
    </ScrollView>
  )
}

export default ReleaseDetail
