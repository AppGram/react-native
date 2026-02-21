/**
 * useContactForm Hook
 *
 * Fetches contact form config and manages form submission.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppgramContext } from '../provider'
import { getErrorMessage } from '../utils'
import type { ContactForm, ContactFormSubmission } from '../types'

export interface UseContactFormOptions {
  enabled?: boolean
}

export interface UseContactFormResult {
  form: ContactForm | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useContactForm(formId: string, options: UseContactFormOptions = {}): UseContactFormResult {
  const { enabled = true } = options
  const { client } = useAppgramContext()
  const [form, setForm] = useState<ContactForm | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchForm = useCallback(async () => {
    if (!formId) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await client.getContactForm(formId)

      if (response.success && response.data) {
        setForm(response.data)
      } else {
        setError(getErrorMessage(response.error, 'Failed to fetch form'))
      }
    } catch (err) {
      setError(getErrorMessage(err, 'An error occurred'))
    } finally {
      setIsLoading(false)
    }
  }, [client, formId])

  useEffect(() => {
    if (enabled) {
      fetchForm()
    }
  }, [enabled, fetchForm])

  return {
    form,
    isLoading,
    error,
    refetch: fetchForm,
  }
}

export interface UseContactFormSubmitOptions {
  rateLimitMs?: number
  onSuccess?: (submission: ContactFormSubmission) => void
  onError?: (error: string) => void
}

export interface UseContactFormSubmitResult {
  isSubmitting: boolean
  error: string | null
  successMessage: string | null
  isRateLimited: boolean
  submitForm: (
    projectId: string,
    formId: string,
    data: Record<string, string | boolean>
  ) => Promise<ContactFormSubmission | null>
  clearMessages: () => void
}

export function useContactFormSubmit(options: UseContactFormSubmitOptions = {}): UseContactFormSubmitResult {
  const { rateLimitMs = 5000 } = options
  const { client } = useAppgramContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const lastSubmitRef = useRef<number>(0)

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  const submitForm = useCallback(async (
    projectId: string,
    formId: string,
    data: Record<string, string | boolean>
  ): Promise<ContactFormSubmission | null> => {
    const now = Date.now()
    if (now - lastSubmitRef.current < rateLimitMs) {
      setIsRateLimited(true)
      setError('Please wait before submitting again.')
      setTimeout(() => setIsRateLimited(false), rateLimitMs - (now - lastSubmitRef.current))
      return null
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await client.submitContactForm(projectId, formId, { data })

      if (response.success && response.data) {
        lastSubmitRef.current = Date.now()
        setSuccessMessage('Form submitted successfully.')
        options.onSuccess?.(response.data)
        return response.data
      } else {
        const errorMsg = getErrorMessage(response.error, 'Failed to submit form')
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
  }, [client, options, rateLimitMs])

  return {
    isSubmitting,
    error,
    successMessage,
    isRateLimited,
    submitForm,
    clearMessages,
  }
}
