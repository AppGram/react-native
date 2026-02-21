import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { CheckCircle2, Circle, Star, ChevronDown, ChevronUp, Check } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useSurvey, useSurveySubmit } from '../../hooks'
import type { SurveyNode, SurveyAnswer } from '../../types'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export interface SurveyFormProps {
  slug: string
  fingerprint?: string
  autoAdvance?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

/**
 * SurveyForm Component
 *
 * Interactive survey form with various question types (multiple choice, rating, text, etc.).
 * Supports step-by-step navigation and auto-advance.
 *
 * @example
 * ```tsx
 * import { SurveyForm } from '@appgram/react-native'
 *
 * function SurveyScreen() {
 *   return (
 *     <SurveyForm
 *       slug="customer-satisfaction"
 *       onSuccess={() => {
 *         Alert.alert('Thank you!', 'Your feedback has been recorded.')
 *         navigation.goBack()
 *       }}
 *       onError={(error) => Alert.alert('Error', error)}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With auto-advance between questions
 * <SurveyForm
 *   slug="quick-poll"
 *   autoAdvance
 *   fingerprint={userId}
 * />
 * ```
 */
export function SurveyForm({ slug, fingerprint = 'anonymous', autoAdvance = false, onSuccess, onError }: SurveyFormProps) {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { survey, nodes, isLoading, error } = useSurvey(slug)
  const { isSubmitting, submitResponse } = useSurveySubmit({ onSuccess: () => onSuccess?.(), onError })
  const [answers, setAnswers] = useState<Record<string, Partial<SurveyAnswer>>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  // Auto-close after submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        onSuccess?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [submitted, onSuccess])

  const updateAnswer = (nodeId: string, value: Partial<SurveyAnswer>) => {
    setAnswers(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], ...value } }))
  }

  const isLastQuestion = currentIndex === nodes.length - 1
  const currentNode = nodes[currentIndex]
  const currentAnswer = currentNode ? answers[currentNode.id] : null
  const progress = nodes.length > 0 ? ((currentIndex + 1) / nodes.length) * 100 : 0

  const hasAnswer = () => {
    if (!currentNode || !currentAnswer) return false
    switch (currentNode.question_type) {
      case 'short_answer':
      case 'paragraph':
        return !!currentAnswer.answer_text?.trim()
      case 'yes_no':
        return currentAnswer.answer !== undefined
      case 'multiple_choice':
        return (currentAnswer.answer_options?.length || 0) > 0
      case 'checkboxes':
        return (currentAnswer.answer_options?.length || 0) > 0
      case 'rating':
        return (currentAnswer.answer_rating || 0) > 0
      default:
        return false
    }
  }

  const canProceed = !currentNode?.is_required || hasAnswer()

  const animateTransition = (direction: 'next' | 'prev', callback: () => void) => {
    const slideOut = direction === 'next' ? -50 : 50
    const slideIn = direction === 'next' ? 50 : -50

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: slideOut, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback()
      slideAnim.setValue(slideIn)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start()
    })
  }

  const goNext = () => {
    if (currentIndex < nodes.length - 1 && canProceed) {
      animateTransition('next', () => setCurrentIndex(i => i + 1))
    }
  }

  const goPrev = () => {
    if (currentIndex > 0) {
      animateTransition('prev', () => setCurrentIndex(i => i - 1))
    }
  }

  const handleSubmit = async () => {
    if (!survey) return
    const formattedAnswers = Object.entries(answers).map(([nodeId, answer]) => ({
      node_id: nodeId,
      ...answer,
    }))
    const result = await submitResponse(survey.id, { fingerprint, answers: formattedAnswers })
    if (result) setSubmitted(true)
  }

  const allRequiredAnswered = () => {
    return nodes.every(node => {
      if (!node.is_required) return true
      const answer = answers[node.id]
      if (!answer) return false
      switch (node.question_type) {
        case 'short_answer':
        case 'paragraph':
          return !!answer.answer_text?.trim()
        case 'yes_no':
          return answer.answer !== undefined
        case 'multiple_choice':
        case 'checkboxes':
          return (answer.answer_options?.length || 0) > 0
        case 'rating':
          return (answer.answer_rating || 0) > 0
        default:
          return false
      }
    })
  }

  const renderQuestion = (node: SurveyNode) => {
    const answer = answers[node.id] || {}

    switch (node.question_type) {
      case 'short_answer':
        return (
          <TextInput
            style={{
              fontSize: typography.xl,
              color: colors.foreground,
              borderBottomWidth: 2,
              borderBottomColor: colors.primary,
              paddingVertical: spacing.md,
              marginTop: spacing.lg,
            }}
            placeholder="Type your answer here..."
            placeholderTextColor={colors.mutedForeground}
            value={answer.answer_text || ''}
            onChangeText={v => updateAnswer(node.id, { answer_text: v })}
            autoFocus
          />
        )

      case 'paragraph':
        return (
          <TextInput
            style={{
              fontSize: typography.lg,
              color: colors.foreground,
              backgroundColor: colors.muted,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginTop: spacing.lg,
              minHeight: 150,
              textAlignVertical: 'top',
            }}
            placeholder="Type your answer here..."
            placeholderTextColor={colors.mutedForeground}
            value={answer.answer_text || ''}
            onChangeText={v => updateAnswer(node.id, { answer_text: v })}
            multiline
            autoFocus
          />
        )

      case 'yes_no':
        return (
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
            {['Yes', 'No'].map((opt, i) => {
              const isSelected = answer.answer === (opt === 'Yes')
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    updateAnswer(node.id, { answer: opt === 'Yes' })
                    if (autoAdvance) setTimeout(goNext, 300)
                  }}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                    paddingVertical: spacing.lg,
                    borderRadius: radius.lg,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '15' : 'transparent',
                  }}
                >
                  <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.mutedForeground }}>{String.fromCharCode(65 + i)}</Text>
                  <Text style={{ fontSize: typography.lg, fontWeight: '600', color: isSelected ? colors.primary : colors.foreground }}>{opt}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )

      case 'multiple_choice':
        const selectedOption = answer.answer_options?.[0]
        return (
          <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            {(node.options || []).map((opt, i) => {
              const isSelected = selectedOption === opt.value
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    updateAnswer(node.id, { answer_options: [opt.value] })
                    if (autoAdvance) setTimeout(goNext, 300)
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                    borderRadius: radius.lg,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '15' : 'transparent',
                  }}
                >
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: radius.sm,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {isSelected ? (
                      <Check size={16} color="#FFF" strokeWidth={3} />
                    ) : (
                      <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.mutedForeground }}>{String.fromCharCode(65 + i)}</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: typography.base, color: colors.foreground, flex: 1 }}>{opt.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        )

      case 'checkboxes':
        const selectedOptions = answer.answer_options || []
        return (
          <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            {(node.options || []).map((opt, i) => {
              const isSelected = selectedOptions.includes(opt.value)
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    const newVal = isSelected ? selectedOptions.filter(v => v !== opt.value) : [...selectedOptions, opt.value]
                    updateAnswer(node.id, { answer_options: newVal })
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.lg,
                    borderRadius: radius.lg,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '15' : 'transparent',
                  }}
                >
                  <View style={{
                    width: 28,
                    height: 28,
                    borderRadius: radius.sm,
                    borderWidth: 2,
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {isSelected ? (
                      <Check size={16} color="#FFF" strokeWidth={3} />
                    ) : (
                      <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.mutedForeground }}>{String.fromCharCode(65 + i)}</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: typography.base, color: colors.foreground, flex: 1 }}>{opt.label}</Text>
                </TouchableOpacity>
              )
            })}
            <Text style={{ fontSize: typography.xs, color: colors.mutedForeground, marginTop: spacing.sm }}>
              Select all that apply
            </Text>
          </View>
        )

      case 'rating':
        const rating = answer.answer_rating || 0
        const max = node.max_rating || 5
        return (
          <View style={{ marginTop: spacing.xl }}>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md }}>
              {Array.from({ length: max }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    updateAnswer(node.id, { answer_rating: i + 1 })
                    if (autoAdvance) setTimeout(goNext, 300)
                  }}
                  style={{ padding: spacing.xs }}
                >
                  <Star
                    size={40}
                    color={i < rating ? '#F59E0B' : colors.border}
                    fill={i < rating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
              <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>Poor</Text>
              <Text style={{ fontSize: typography.xs, color: colors.mutedForeground }}>Excellent</Text>
            </View>
          </View>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Text style={{ color: colors.error, textAlign: 'center' }}>{error}</Text>
      </View>
    )
  }

  if (!survey || nodes.length === 0) return null

  if (submitted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <CheckCircle2 size={40} color={colors.primary} />
        </View>
        <Text style={{ fontSize: typography['2xl'], fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm, textAlign: 'center' }}>
          Survey Submitted
        </Text>
        <Text style={{ fontSize: typography.base, color: colors.mutedForeground, textAlign: 'center' }}>
          Thank you for your feedback!
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      {/* Progress Bar */}
      <View style={{ height: 4, backgroundColor: colors.muted }}>
        <View style={{ height: 4, backgroundColor: colors.primary, width: `${progress}%` }} />
      </View>

      {/* Question Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Question Number */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.primary }}>
              {currentIndex + 1}
            </Text>
            <Text style={{ fontSize: typography.sm, color: colors.mutedForeground }}>
              {' '}→ {nodes.length}
            </Text>
          </View>

          {/* Question Text */}
          <Text style={{ fontSize: typography['2xl'], fontWeight: '600', color: colors.foreground, lineHeight: 32 }}>
            {currentNode?.question}
            {currentNode?.is_required && <Text style={{ color: colors.primary }}> *</Text>}
          </Text>

          {/* Question Input */}
          {currentNode && renderQuestion(currentNode)}
        </Animated.View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        {/* Nav Arrows */}
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <TouchableOpacity
            onPress={goPrev}
            disabled={currentIndex === 0}
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentIndex === 0 ? 0.4 : 1,
            }}
          >
            <ChevronUp size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goNext}
            disabled={!canProceed || isLastQuestion}
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !canProceed || isLastQuestion ? 0.4 : 1,
            }}
          >
            <ChevronDown size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* OK / Submit Button */}
        {isLastQuestion ? (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || !allRequiredAnswered()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.md,
              opacity: isSubmitting || !allRequiredAnswered() ? 0.5 : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={{ fontSize: typography.base, fontWeight: '600', color: '#FFF' }}>Submit</Text>
                <Check size={18} color="#FFF" strokeWidth={3} />
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={goNext}
            disabled={!canProceed}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.sm,
              backgroundColor: canProceed ? colors.primary : colors.muted,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.md,
            }}
          >
            <Text style={{ fontSize: typography.base, fontWeight: '600', color: canProceed ? '#FFF' : colors.mutedForeground }}>OK</Text>
            <Check size={18} color={canProceed ? '#FFF' : colors.mutedForeground} strokeWidth={3} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}

export default SurveyForm
