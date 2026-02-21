import React from 'react'
import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native'
import { useAppgramTheme } from '../../provider'
import type { HelpFlow } from '../../types'

export interface HelpFlowCardProps {
  flow: HelpFlow
  onPress?: (flow: HelpFlow) => void
  style?: ViewStyle
}

/**
 * HelpFlowCard Component
 *
 * A card displaying a help flow/collection.
 * Use to build custom help center navigation.
 *
 * @example
 * ```tsx
 * import { HelpFlowCard } from '@appgram/react-native'
 *
 * function HelpFlowList({ flows }) {
 *   return (
 *     <View>
 *       {flows.map(flow => (
 *         <HelpFlowCard
 *           key={flow.id}
 *           flow={flow}
 *           onPress={(f) => navigation.navigate('HelpFlow', { flow: f })}
 *         />
 *       ))}
 *     </View>
 *   )
 * }
 * ```
 */
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
      activeOpacity={0.7}
      style={[containerStyle, style]}
    >
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
