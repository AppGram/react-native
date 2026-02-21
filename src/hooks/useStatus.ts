/**
 * useStatus Hook
 *
 * Fetches status page data.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { StatusPageOverview } from '../types'

export interface UseStatusOptions {
  slug?: string
  refreshInterval?: number
}

export interface UseStatusResult {
  data: StatusPageOverview | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useStatus(options: UseStatusOptions = {}): UseStatusResult {
  const { slug = 'status', refreshInterval = 0 } = options
  const { client } = useAppgramContext()
  const [data, setData] = useState<StatusPageOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getPublicStatusOverview(slug)

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch status'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, slug])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [refreshInterval, fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}
