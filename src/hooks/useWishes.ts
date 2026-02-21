/**
 * useWishes Hook
 *
 * Fetches and manages a list of wishes with filtering and pagination.
 * Provides headless access to the wishes API for custom UI implementations.
 *
 * @example
 * ```tsx
 * import { useWishes } from '@appgram/react-native'
 *
 * function WishList() {
 *   const { wishes, isLoading, error, setFilters, refetch } = useWishes({
 *     filters: { sort_by: 'votes', status: 'pending' },
 *     refreshInterval: 30000,
 *   })
 *
 *   if (isLoading) return <ActivityIndicator />
 *   if (error) return <Text>{error}</Text>
 *
 *   return (
 *     <FlatList
 *       data={wishes}
 *       renderItem={({ item }) => <WishCard wish={item} />}
 *       keyExtractor={(item) => item.id}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With search and pagination
 * function SearchableWishes() {
 *   const { wishes, isLoading, setFilters, page, totalPages, setPage } = useWishes()
 *
 *   const handleSearch = (query: string) => {
 *     setFilters({ search: query })
 *   }
 *
 *   return (
 *     <View>
 *       <TextInput onChangeText={handleSearch} placeholder="Search..." />
 *       <WishList wishes={wishes} loading={isLoading} />
 *       <Pagination current={page} total={totalPages} onChange={setPage} />
 *     </View>
 *   )
 * }
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { Wish, WishFilters } from '../types'

export interface UseWishesOptions {
  /**
   * Initial filters for the wishes query
   */
  filters?: WishFilters

  /**
   * Auto-refresh interval in milliseconds (0 to disable)
   * @default 0
   */
  refreshInterval?: number

  /**
   * Skip initial fetch
   * @default false
   */
  skip?: boolean
}

export interface UseWishesResult {
  /**
   * List of wishes
   */
  wishes: Wish[]

  /**
   * Loading state
   */
  isLoading: boolean

  /**
   * Error message if any
   */
  error: string | null

  /**
   * Total number of wishes
   */
  total: number

  /**
   * Current page
   */
  page: number

  /**
   * Total pages
   */
  totalPages: number

  /**
   * Update filters (resets to page 1)
   */
  setFilters: (filters: WishFilters) => void

  /**
   * Go to a specific page
   */
  setPage: (page: number) => void

  /**
   * Manually refetch data
   */
  refetch: () => Promise<void>
}

export function useWishes(options: UseWishesOptions = {}): UseWishesResult {
  const { client, fingerprint } = useAppgramContext()
  const [wishes, setWishes] = useState<Wish[]>([])
  const [isLoading, setIsLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(options.filters?.page || 1)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState<WishFilters>(options.filters || {})

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchWishes = useCallback(async () => {
    if (options.skip) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getPublicWishes({
        ...filters,
        page,
        fingerprint: fingerprint ?? undefined,
      })

      if (response.success && response.data) {
        const wishData = response.data.data || []
        setWishes(wishData)
        setTotal(response.data.total)
        setTotalPages(response.data.total_pages)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch wishes'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, fingerprint, filters, page, options.skip])

  useEffect(() => {
    fetchWishes()
  }, [fetchWishes])

  useEffect(() => {
    if (options.refreshInterval && options.refreshInterval > 0) {
      intervalRef.current = setInterval(fetchWishes, options.refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [options.refreshInterval, fetchWishes])

  const handleSetFilters = useCallback((newFilters: WishFilters) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  return {
    wishes,
    isLoading,
    error,
    total,
    page,
    totalPages,
    setFilters: handleSetFilters,
    setPage,
    refetch: fetchWishes,
  }
}
