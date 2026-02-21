/**
 * Device Fingerprint Utility for React Native
 *
 * Generates a unique device identifier for anonymous voting/tracking.
 * Uses a combination of device info available in React Native.
 */

import { Platform, Dimensions } from 'react-native'

let cachedFingerprint: string | null = null

/**
 * Generate a simple hash from string
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Get device fingerprint for React Native
 * Uses platform info, screen dimensions, and a random component
 */
export function getFingerprint(): string {
  if (cachedFingerprint) {
    return cachedFingerprint
  }

  const { width, height } = Dimensions.get('window')
  const components = [
    Platform.OS,
    Platform.Version,
    `${width}x${height}`,
    // Add some randomness for uniqueness
    Math.random().toString(36).substring(2, 15),
    Date.now().toString(36),
  ]

  cachedFingerprint = `rn_${simpleHash(components.join('|'))}`
  return cachedFingerprint
}

/**
 * Clear cached fingerprint (useful for testing)
 */
export function clearFingerprint(): void {
  cachedFingerprint = null
}
