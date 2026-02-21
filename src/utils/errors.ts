/**
 * Error Handling Utilities
 */

export interface ApiError {
  code: string
  message: string
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'An error occurred'
): string {
  if (!error) return fallback

  if (typeof error === 'string') return error

  if (error && typeof error === 'object') {
    if ('message' in error && typeof (error as ApiError).message === 'string') {
      return (error as ApiError).message
    }
    if ('code' in error && typeof (error as ApiError).code === 'string') {
      return (error as ApiError).code
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
