/**
 * useHelpCenter Hook
 *
 * Fetches help center collections, flows, and articles.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { HelpCollection, HelpFlow, HelpArticle } from '../types'

// ============================================================================
// useHelpCenter - Fetch help center data
// ============================================================================

export interface UseHelpCenterResult {
  collection: HelpCollection | null
  flows: HelpFlow[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useHelpCenter(): UseHelpCenterResult {
  const { client } = useAppgramContext()
  const [collection, setCollection] = useState<HelpCollection | null>(null)
  const [flows, setFlows] = useState<HelpFlow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getHelpCollection()

      if (response.success && response.data) {
        setCollection(response.data.collection)
        setFlows(response.data.flows || [])
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch help center'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    collection,
    flows,
    isLoading,
    error,
    refetch: fetchData,
  }
}

// ============================================================================
// useHelpFlow - Fetch a specific help flow
// ============================================================================

export interface UseHelpFlowResult {
  flow: HelpFlow | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useHelpFlow(slug: string): UseHelpFlowResult {
  const { client } = useAppgramContext()
  const [flow, setFlow] = useState<HelpFlow | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!slug) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getHelpFlow(slug)

      if (response.success && response.data) {
        setFlow(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch help flow'))
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

  return {
    flow,
    isLoading,
    error,
    refetch: fetchData,
  }
}

// ============================================================================
// useHelpArticle - Fetch a specific article
// ============================================================================

export interface UseHelpArticleResult {
  article: HelpArticle | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useHelpArticle(slug: string, flowId: string): UseHelpArticleResult {
  const { client } = useAppgramContext()
  const [article, setArticle] = useState<HelpArticle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!slug || !flowId) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getHelpArticle(slug, flowId)

      if (response.success && response.data) {
        setArticle(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch article'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, slug, flowId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    article,
    isLoading,
    error,
    refetch: fetchData,
  }
}
