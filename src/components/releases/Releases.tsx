import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { Sparkles, Bug, Zap, Wrench } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useReleases } from '../../hooks'
import type { Release } from '../../types'

export interface ReleasesProps {
  title?: string
  description?: string
  limit?: number
  onReleasePress?: (release: Release) => void
}

const ITEM_ICONS = { feature: Sparkles, improvement: Zap, bugfix: Bug, other: Wrench } as const
const ITEM_COLORS = { feature: '#10B981', improvement: '#3B82F6', bugfix: '#EF4444', other: '#6B7280' } as const

/**
 * Releases Component
 *
 * A timeline-style changelog displaying product releases with features, improvements, and bugfixes.
 *
 * @example
 * ```tsx
 * import { Releases } from '@appgram/react-native'
 *
 * function ChangelogScreen() {
 *   return (
 *     <Releases
 *       title="What's New"
 *       description="Latest updates and improvements"
 *       limit={20}
 *       onReleasePress={(release) => {
 *         navigation.navigate('ReleaseDetail', { slug: release.slug })
 *       }}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Minimal usage
 * <Releases onReleasePress={(r) => console.log(r.version)} />
 * ```
 */
export function Releases({ title = 'Changelog', description, limit = 20, onReleasePress }: ReleasesProps) {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { releases, isLoading, error, refetch } = useReleases({ limit })
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => { setRefreshing(true); await refetch(); setRefreshing(false) }
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const renderRelease = ({ item, index }: { item: Release; index: number }) => {
    const isFirst = index === 0
    const isLast = index === releases.length - 1

    return (
      <View style={{ flexDirection: 'row', minHeight: 120 }}>
        {/* Timeline */}
        <View style={{ width: 24, alignItems: 'center' }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: isFirst ? colors.primary : colors.muted, borderWidth: 2, borderColor: isFirst ? colors.primary : colors.border }} />
          {!isLast && <View style={{ width: 2, flex: 1, backgroundColor: colors.border }} />}
        </View>

        {/* Content */}
        <TouchableOpacity
          onPress={() => onReleasePress?.(item)}
          activeOpacity={0.7}
          style={{ flex: 1, paddingBottom: spacing.xl, paddingLeft: spacing.md }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
            {item.version && <Text style={{ fontSize: typography.sm, fontWeight: '700', color: colors.primary }}>{item.version}</Text>}
            <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>{formatDate(item.published_at || item.created_at)}</Text>
          </View>

          <Text style={{ fontSize: typography.lg, fontWeight: '600', color: colors.foreground, marginBottom: spacing.xs }}>{item.title}</Text>

          {item.excerpt && (
            <Text style={{ fontSize: typography.sm, color: colors.mutedForeground, lineHeight: 20, marginBottom: spacing.sm }} numberOfLines={2}>{item.excerpt}</Text>
          )}

          {item.items && item.items.length > 0 && (
            <View style={{ marginTop: spacing.xs }}>
              {item.items.slice(0, 3).map((ri) => {
                const Icon = ITEM_ICONS[ri.type] || Wrench
                const color = ITEM_COLORS[ri.type] || ITEM_COLORS.other
                return (
                  <View key={ri.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 }}>
                    <Icon size={14} color={color} />
                    <Text style={{ fontSize: typography.sm, color: colors.foreground, flex: 1 }} numberOfLines={1}>{ri.title}</Text>
                  </View>
                )
              })}
              {item.items.length > 3 && (
                <Text style={{ fontSize: typography.sm, color: colors.primary, marginTop: spacing.xs }}>+{item.items.length - 3} more</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.xl }}>
      {title && <Text style={{ fontSize: typography['2xl'], fontWeight: '600', color: colors.foreground, marginBottom: spacing.xs }}>{title}</Text>}
      {description && <Text style={{ fontSize: typography.sm, color: colors.mutedForeground }}>{description}</Text>}
    </View>
  )

  const renderEmpty = () => {
    if (isLoading) return <ActivityIndicator size="large" color={colors.primary} style={{ padding: spacing.xl }} />
    if (error) return <Text style={{ color: colors.error, textAlign: 'center', padding: spacing.xl }}>{error}</Text>
    return <Text style={{ color: colors.mutedForeground, textAlign: 'center', padding: spacing.xl }}>No releases yet</Text>
  }

  return (
    <FlatList
      data={releases}
      renderItem={renderRelease}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={renderEmpty}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ paddingVertical: spacing.lg, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    />
  )
}

export default Releases
