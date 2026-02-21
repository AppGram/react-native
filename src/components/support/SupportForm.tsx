/**
 * SupportForm Component
 *
 * A form for submitting support tickets with Hazel design system styling.
 */

import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  type ViewStyle,
} from 'react-native'
import { useAppgramTheme } from '../../provider'
import { useSupport } from '../../hooks'
import { Button, Card } from '../base'

export interface SupportFormProps {
  title?: string
  description?: string
  userEmail?: string
  userName?: string
  externalUserId?: string
  onSuccess?: () => void
  onError?: (error: string) => void
  style?: ViewStyle
}

export function SupportForm({
  title = 'Contact Support',
  description = 'Have a question or need help? Send us a message.',
  userEmail: initialEmail = '',
  userName: initialName = '',
  externalUserId,
  onSuccess,
  onError,
  style,
}: SupportFormProps): React.ReactElement {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { submitTicket, isSubmitting, error, successMessage, clearMessages } = useSupport({
    onSuccess,
    onError,
  })

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [name, setName] = useState(initialName)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!subject.trim()) {
      errors.subject = 'Subject is required'
    }
    if (!message.trim()) {
      errors.message = 'Message is required'
    }
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    clearMessages()
    if (!validateForm()) return

    const result = await submitTicket({
      subject: subject.trim(),
      description: message.trim(),
      user_email: email.trim(),
      user_name: name.trim() || undefined,
      external_user_id: externalUserId,
    })

    if (result) {
      setSubject('')
      setMessage('')
      if (!initialEmail) setEmail('')
      if (!initialName) setName('')
    }
  }

  const inputStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: typography.base,
    color: colors.foreground,
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[{ flex: 1 }, style]}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <Card variant="elevated">
          {/* Header */}
          <Text
            style={{
              fontSize: typography.xl,
              fontWeight: '700',
              color: colors.foreground,
              marginBottom: spacing.xs,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: typography.sm,
              color: colors.mutedForeground,
              marginBottom: spacing.lg,
            }}
          >
            {description}
          </Text>

          {/* Success Message */}
          {successMessage && (
            <View
              style={{
                backgroundColor: colors.successSubtle,
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.lg,
              }}
            >
              <Text style={{ color: colors.success, fontSize: typography.sm }}>
                {successMessage}
              </Text>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View
              style={{
                backgroundColor: colors.errorSubtle,
                padding: spacing.md,
                borderRadius: radius.md,
                marginBottom: spacing.lg,
              }}
            >
              <Text style={{ color: colors.error, fontSize: typography.sm }}>
                {error}
              </Text>
            </View>
          )}

          {/* Form Fields */}
          <View style={{ gap: spacing.md }}>
            {/* Name */}
            <View>
              <Text
                style={{
                  fontSize: typography.sm,
                  fontWeight: '500',
                  color: colors.foreground,
                  marginBottom: spacing.xs,
                }}
              >
                Name (optional)
              </Text>
              <TextInput
                style={inputStyle}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View>
              <Text
                style={{
                  fontSize: typography.sm,
                  fontWeight: '500',
                  color: colors.foreground,
                  marginBottom: spacing.xs,
                }}
              >
                Email *
              </Text>
              <TextInput
                style={[
                  inputStyle,
                  fieldErrors.email && { borderColor: colors.error },
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  setFieldErrors((prev) => ({ ...prev, email: '' }))
                }}
                placeholder="your@email.com"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {fieldErrors.email && (
                <Text style={{ color: colors.error, fontSize: typography.xs, marginTop: 4 }}>
                  {fieldErrors.email}
                </Text>
              )}
            </View>

            {/* Subject */}
            <View>
              <Text
                style={{
                  fontSize: typography.sm,
                  fontWeight: '500',
                  color: colors.foreground,
                  marginBottom: spacing.xs,
                }}
              >
                Subject *
              </Text>
              <TextInput
                style={[
                  inputStyle,
                  fieldErrors.subject && { borderColor: colors.error },
                ]}
                value={subject}
                onChangeText={(text) => {
                  setSubject(text)
                  setFieldErrors((prev) => ({ ...prev, subject: '' }))
                }}
                placeholder="What can we help you with?"
                placeholderTextColor={colors.mutedForeground}
              />
              {fieldErrors.subject && (
                <Text style={{ color: colors.error, fontSize: typography.xs, marginTop: 4 }}>
                  {fieldErrors.subject}
                </Text>
              )}
            </View>

            {/* Message */}
            <View>
              <Text
                style={{
                  fontSize: typography.sm,
                  fontWeight: '500',
                  color: colors.foreground,
                  marginBottom: spacing.xs,
                }}
              >
                Message *
              </Text>
              <TextInput
                style={[
                  inputStyle,
                  { minHeight: 120, textAlignVertical: 'top' },
                  fieldErrors.message && { borderColor: colors.error },
                ]}
                value={message}
                onChangeText={(text) => {
                  setMessage(text)
                  setFieldErrors((prev) => ({ ...prev, message: '' }))
                }}
                placeholder="Describe your issue or question..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={5}
              />
              {fieldErrors.message && (
                <Text style={{ color: colors.error, fontSize: typography.xs, marginTop: 4 }}>
                  {fieldErrors.message}
                </Text>
              )}
            </View>

            {/* Submit Button */}
            <Button
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={{ marginTop: spacing.sm }}
            >
              Send Message
            </Button>
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SupportForm
