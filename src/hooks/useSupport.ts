/**
 * useSupport Hook
 *
 * Manages support ticket submission.
 */

import { useState, useCallback } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { SupportRequest } from '../types'

export interface SupportSubmitData {
  subject: string
  description: string
  user_email: string
  user_name?: string
  external_user_id?: string
  category?: string
}

export interface UseSupportOptions {
  onSuccess?: (ticket: SupportRequest) => void
  onError?: (error: string) => void
}

export interface UseSupportResult {
  submitTicket: (data: SupportSubmitData) => Promise<SupportRequest | null>
  isSubmitting: boolean
  error: string | null
  successMessage: string | null
  clearMessages: () => void
}

export function useSupport(options: UseSupportOptions = {}): UseSupportResult {
  const { client } = useAppgramContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  const submitTicket = useCallback(async (data: SupportSubmitData): Promise<SupportRequest | null> => {
    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await client.submitSupportRequest({
        subject: data.subject,
        description: data.description,
        user_email: data.user_email,
        user_name: data.user_name,
        external_user_id: data.external_user_id,
        category: data.category,
      })

      if (response.success && response.data) {
        setSuccessMessage('Support ticket submitted successfully')
        options.onSuccess?.(response.data)
        return response.data
      } else {
        const errorMsg = getErrorMessage(response.error, 'Failed to submit ticket')
        setError(errorMsg)
        options.onError?.(errorMsg)
        return null
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, 'An error occurred')
      setError(errorMsg)
      options.onError?.(errorMsg)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [client, options])

  return {
    submitTicket,
    isSubmitting,
    error,
    successMessage,
    clearMessages,
  }
}
