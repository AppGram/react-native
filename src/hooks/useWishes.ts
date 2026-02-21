/**
 * useWishes Hook
 *
 * Fetches and manages a list of wishes with filtering and pagination.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { Wish, WishFilters } from '../types'

export interface UseWishesOptions {
  filters?: WishFilters
  refreshInterval?: number
  skip?: boolean
}

export interface UseWishesResult {
  wishes: Wish[]
  isLoading: boolean
  error: string | null
  total: number
  page: number
  totalPages: number
  setFilters: (filters: WishFilters) => void
  setPage: (page: number) => void
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
