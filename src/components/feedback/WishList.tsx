import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  type ViewStyle,
} from 'react-native'
import { Plus, CheckCircle2, X } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useWishes } from '../../hooks'
import { WishCard } from './WishCard'
import { WishDetailModal } from './WishDetailModal'
import { SubmitWishSheet } from './SubmitWishSheet'
import type { Wish, WishFilters } from '../../types'

export interface WishListProps {
  title?: string
  description?: string
  filters?: WishFilters
  onWishPress?: (wish: Wish) => void
  onVote?: (wishId: string) => void
  onCommentPress?: (wish: Wish) => void
  /** @deprecated Use showSubmitButton instead. Custom handler for add wish button. */
  onAddWish?: () => void
  /** Show the submit idea button (defaults to true) */
  showSubmitButton?: boolean
  /** Submit button text */
  submitButtonText?: string
  /** Submit sheet title */
  submitSheetTitle?: string
  /** Submit sheet description */
  submitSheetDescription?: string
  /** Callback when a wish is successfully submitted */
  onWishSubmitted?: (wish: Wish) => void
  /** Custom form ID for the submit sheet */
  customFormId?: string
  emptyText?: string
  refreshInterval?: number
  style?: ViewStyle
  contentContainerStyle?: ViewStyle
}

/**
 * WishList Component
 *
 * A list of wishes with header, submit button, and empty states.
 * Includes built-in SubmitWishSheet for submitting new feature requests.
 *
 * @example
 * ```tsx
 * import { WishList } from '@appgram/react-native'
 *
 * function FeedbackScreen() {
 *   return (
 *     <WishList
 *       title="Feature Requests"
 *       description="Vote on features and submit your ideas"
 *       showSubmitButton
 *       submitButtonText="Submit Idea"
 *       onWishPress={(wish) => navigation.navigate('WishDetail', { id: wish.id })}
 *       onWishSubmitted={(wish) => console.log('New wish:', wish.title)}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With filters and auto-refresh
 * <WishList
 *   filters={{ status: 'pending', sort_by: 'votes' }}
 *   refreshInterval={30000}
 *   showSubmitButton={false}
 *   emptyText="No pending requests"
 * />
 * ```
 */
export function WishList({
  title = 'Feature Requests',
  description = 'Vote on features and submit your ideas',
  filters,
  onWishPress,
  onVote,
  onCommentPress,
  onAddWish,
  showSubmitButton = true,
  submitButtonText = 'Submit Idea',
  submitSheetTitle,
  submitSheetDescription,
  onWishSubmitted,
  customFormId,
  emptyText = 'No feature requests yet.',
  refreshInterval = 0,
  style,
  contentContainerStyle,
}: WishListProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { wishes, isLoading, error, refetch } = useWishes({ filters, refreshInterval })

  const [refreshing, setRefreshing] = useState(false)
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [submitSheetVisible, setSubmitSheetVisible] = useState(false)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const successAnim = useRef(new Animated.Value(0)).current
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleAddWish = () => {
    if (onAddWish) {
      // Use custom handler if provided (deprecated)
      onAddWish()
    } else {
      // Open the built-in submit sheet
      setSubmitSheetVisible(true)
    }
  }

  const showBanner = () => {
    setShowSuccessBanner(true)
    Animated.spring(successAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start()

    // Auto-dismiss after 5 seconds
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current)
    }
    bannerTimeoutRef.current = setTimeout(() => {
      dismissBanner()
    }, 5000)
  }

  const dismissBanner = () => {
    Animated.timing(successAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowSuccessBanner(false)
    })
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current) {
        clearTimeout(bannerTimeoutRef.current)
      }
    }
  }, [])

  const handleWishSubmitted = (wish: Wish) => {
    onWishSubmitted?.(wish)
    // Show success banner
    showBanner()
    // Refresh the list to show the new wish
    refetch()
  }

  const handleWishPress = (wish: Wish) => {
    setSelectedWish(wish)
    setModalVisible(true)
    onWishPress?.(wish)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setSelectedWish(null)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  const renderItem = ({ item }: { item: Wish }) => (
    <WishCard
      wish={item}
      onPress={handleWishPress}
      onVote={onVote}
      onCommentPress={onCommentPress}
      style={{ marginBottom: spacing.sm }}
    />
  )

  const renderHeader = () => (
    <View style={{ marginBottom: spacing.lg }}>
      {/* Success Banner */}
      {showSuccessBanner && (
        <Animated.View
          style={{
            backgroundColor: '#10b981',
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            opacity: successAnim,
            transform: [
              {
                translateY: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          }}
        >
          <CheckCircle2 size={22} color="#FFFFFF" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: typography.sm, fontWeight: '600' }}>
              Feature Request Submitted!
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: typography.xs, marginTop: 2 }}>
              The developer has received your feedback request.
            </Text>
          </View>
          <TouchableOpacity onPress={dismissBanner} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Title and Description */}
      {(title || description) && (
        <View style={{ marginBottom: spacing.md }}>
          {title && (
            <Text
              style={{
                fontSize: typography['2xl'],
                fontWeight: '600',
                color: colors.foreground,
                marginBottom: spacing.xs,
              }}
            >
              {title}
            </Text>
          )}
          {description && (
            <Text
              style={{
                fontSize: typography.base,
                color: colors.mutedForeground,
              }}
            >
              {description}
            </Text>
          )}
        </View>
      )}

      {/* Submit Button - always show when showSubmitButton is true */}
      {showSubmitButton && (
        <TouchableOpacity
          onPress={handleAddWish}
          activeOpacity={0.8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.xs,
            backgroundColor: colors.primary,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radius.md,
            alignSelf: 'flex-start',
          }}
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2} />
          <Text style={{ fontSize: typography.sm, fontWeight: '600', color: '#FFFFFF' }}>
            {submitButtonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )
    }

    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
          <Text style={{ fontSize: typography.base, color: colors.error, textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      )
    }

    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }}>
        <Text
          style={{
            fontSize: typography.sm,
            color: colors.mutedForeground,
            textAlign: 'center',
            marginBottom: spacing.md,
          }}
        >
          {emptyText}
        </Text>
        {showSubmitButton && (
          <TouchableOpacity
            onPress={handleAddWish}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              backgroundColor: 'transparent',
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.md,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Plus size={16} color={colors.foreground} strokeWidth={2} />
            <Text style={{ fontSize: typography.sm, fontWeight: '500', color: colors.foreground }}>
              {submitButtonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <>
      <FlatList
        data={wishes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        style={style}
        contentContainerStyle={[
          { paddingVertical: spacing.lg },
          wishes.length === 0 && { flex: 1 },
          contentContainerStyle,
        ]}
      />
      <WishDetailModal
        wish={selectedWish}
        visible={modalVisible}
        onClose={handleCloseModal}
        onVote={onVote}
      />
      <SubmitWishSheet
        visible={submitSheetVisible}
        onClose={() => setSubmitSheetVisible(false)}
        onSuccess={handleWishSubmitted}
        title={submitSheetTitle}
        description={submitSheetDescription}
        customFormId={customFormId}
      />
    </>
  )
}

export default WishList
