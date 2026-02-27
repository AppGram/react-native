import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { CheckCircle2, Star, ChevronDown, ChevronUp, Check } from 'lucide-react-native'
import { useAppgramTheme } from '../../provider'
import { useSurvey, useSurveySubmit } from '../../hooks'
import type { SurveyNode, SurveyAnswer } from '../../types'

export interface SurveyFormProps {
  slug: string
  fingerprint?: string
  autoAdvance?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface AnswerState {
  answer_text?: string
  answer_options?: string[]
  answer_rating?: number
  answer?: boolean
}

/**
 * SurveyForm Component
 *
 * Interactive survey form with decision tree branching support.
 * Supports yes/no branching, conditional branches, and result messages.
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
 */
export function SurveyForm({ slug, fingerprint = 'anonymous', autoAdvance = false, onSuccess, onError }: SurveyFormProps) {
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const { survey, nodes, isLoading, error } = useSurvey(slug)
  // Don't pass onSuccess to hook - we'll call it after showing success screen
  const { isSubmitting, submitResponse } = useSurveySubmit({ onError })
  const [answers, setAnswers] = useState<Map<string, AnswerState>>(new Map())
  const [visitedNodes, setVisitedNodes] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(0)).current

  // Sort nodes and find root
  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => a.sort_order - b.sort_order)
  }, [nodes])

  const rootNode = useMemo(() => {
    return sortedNodes.find(n => n.parent_id === null) || sortedNodes[0]
  }, [sortedNodes])

  // Get current node from visitedNodes or root
  const currentNodeId = visitedNodes.length > 0 ? visitedNodes[visitedNodes.length - 1] : rootNode?.id
  const currentNode = nodes.find(n => n.id === currentNodeId) || null
  const currentAnswer = currentNode ? answers.get(currentNode.id) : undefined

  // Calculate progress - estimate based on typical survey depth (can't know exact total for branching)
  const estimatedMaxDepth = 8
  const progress = Math.min(((visitedNodes.length + 1) / estimatedMaxDepth) * 100, 95)

  // Auto-close after submission
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        onSuccess?.()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [submitted, onSuccess])

  const updateAnswer = useCallback((nodeId: string, value: AnswerState) => {
    setAnswers(prev => {
      const next = new Map(prev)
      next.set(nodeId, value)
      return next
    })
  }, [])

  // Get next node based on branching logic
  const getNextNode = useCallback((node: SurveyNode, answer: AnswerState | undefined): SurveyNode | null => {
    // Yes/No branching via answer_yes_node_id / answer_no_node_id
    if (node.question_type === 'yes_no' && answer) {
      const isYes = answer.answer_text === 'yes' || answer.answer === true
      const nextId = isYes ? node.answer_yes_node_id : node.answer_no_node_id
      if (nextId) {
        return nodes.find(n => n.id === nextId) || null
      }
    }

    // Branch-based routing (conditional branches array)
    if (node.branches && node.branches.length > 0 && answer) {
      for (const branch of node.branches) {
        const { condition } = branch
        let matches = false

        if (condition.type === 'equals') {
          if (answer.answer_text !== undefined) matches = answer.answer_text === String(condition.value)
          if (answer.answer_rating !== undefined) matches = answer.answer_rating === Number(condition.value)
          if (answer.answer_options?.length === 1) matches = answer.answer_options[0] === String(condition.value)
        } else if (condition.type === 'contains') {
          if (answer.answer_text) matches = answer.answer_text.includes(String(condition.value))
          if (answer.answer_options) matches = answer.answer_options.includes(String(condition.value))
        } else if (condition.type === 'gt' && answer.answer_rating !== undefined) {
          matches = answer.answer_rating > Number(condition.value)
        } else if (condition.type === 'lt' && answer.answer_rating !== undefined) {
          matches = answer.answer_rating < Number(condition.value)
        } else if (condition.type === 'gte' && answer.answer_rating !== undefined) {
          matches = answer.answer_rating >= Number(condition.value)
        } else if (condition.type === 'lte' && answer.answer_rating !== undefined) {
          matches = answer.answer_rating <= Number(condition.value)
        }

        if (matches) {
          return nodes.find(n => n.id === branch.next_node_id) || null
        }
      }
    }

    // Explicit next_node_id
    if (node.next_node_id) {
      return nodes.find(n => n.id === node.next_node_id) || null
    }

    // If node has result_message, this is an endpoint - survey ends here
    if (node.result_message) {
      return null
    }

    // Tree-based routing: find child nodes (nodes whose parent_id equals this node's id)
    const childNodes = nodes
      .filter(n => n.parent_id === node.id)
      .sort((a, b) => a.sort_order - b.sort_order)

    if (childNodes.length > 0) {
      // For yes/no questions with exactly 2 children, use sort_order convention:
      // sort_order 0 = YES path, sort_order 1 = NO path
      if (node.question_type === 'yes_no' && childNodes.length === 2 && answer) {
        const isYes = answer.answer_text === 'yes' || answer.answer === true
        return isYes ? childNodes[0] : childNodes[1]
      }
      return childNodes[0]
    }

    return null
  }, [nodes])

  const hasAnswer = useCallback((): boolean => {
    if (!currentNode || !currentAnswer) return false
    switch (currentNode.question_type) {
      case 'short_answer':
      case 'paragraph':
        return !!currentAnswer.answer_text?.trim()
      case 'yes_no':
        return currentAnswer.answer !== undefined || currentAnswer.answer_text !== undefined
      case 'multiple_choice':
        return (currentAnswer.answer_options?.length || 0) > 0
      case 'checkboxes':
        return (currentAnswer.answer_options?.length || 0) > 0
      case 'rating':
        return (currentAnswer.answer_rating || 0) > 0
      default:
        return false
    }
  }, [currentNode, currentAnswer])

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

  const submitSurvey = useCallback(async (finalAnswers: Map<string, AnswerState>) => {
    if (!survey) return
    const answerEntries = Array.from(finalAnswers.entries()).map(([nodeId, ans]) => ({
      node_id: nodeId,
      answer: ans.answer,
      answer_text: ans.answer_text,
      answer_options: ans.answer_options,
      answer_rating: ans.answer_rating,
    }))
    const result = await submitResponse(survey.id, { fingerprint, answers: answerEntries })
    if (result) setSubmitted(true)
  }, [survey, submitResponse, fingerprint])

  // Handle answer and navigate - passes answer directly to avoid state timing issues
  const handleAnswer = useCallback((answer: AnswerState) => {
    if (!currentNode) return

    // Store answer
    const newAnswers = new Map(answers)
    newAnswers.set(currentNode.id, answer)
    setAnswers(newAnswers)

    // Determine next node using the answer directly (not from state)
    const nextNode = getNextNode(currentNode, answer)

    if (nextNode) {
      animateTransition('next', () => {
        setVisitedNodes(prev => [...prev, nextNode.id])
      })
    } else {
      // No next node — submit the survey
      submitSurvey(newAnswers)
    }
  }, [currentNode, answers, getNextNode, submitSurvey])

  // For OK button - uses stored answer
  const goNext = useCallback(() => {
    if (!currentNode || !canProceed) return
    const answer = answers.get(currentNode.id)
    if (answer) {
      const nextNode = getNextNode(currentNode, answer)
      if (nextNode) {
        animateTransition('next', () => {
          setVisitedNodes(prev => [...prev, nextNode.id])
        })
      } else {
        submitSurvey(answers)
      }
    }
  }, [currentNode, canProceed, answers, getNextNode, submitSurvey])

  const goPrev = useCallback(() => {
    if (visitedNodes.length > 0) {
      animateTransition('prev', () => {
        setVisitedNodes(prev => prev.slice(0, -1))
      })
    }
  }, [visitedNodes.length])

  const renderQuestion = (node: SurveyNode) => {
    const answer = answers.get(node.id) || {}

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
              const optValue = opt.toLowerCase()
              const isSelected = answer.answer_text === optValue || answer.answer === (opt === 'Yes')
              return (
                <TouchableOpacity
                  key={opt}
                  onPress={() => {
                    // Use handleAnswer to avoid state timing issues
                    handleAnswer({ answer_text: optValue, answer: opt === 'Yes' })
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
                    // Use handleAnswer to avoid state timing issues
                    handleAnswer({ answer_options: [opt.value] })
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
                    // Use handleAnswer to avoid state timing issues
                    handleAnswer({ answer_rating: i + 1 })
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
    // Show custom result_message from the last answered node, or default message
    const lastNodeId = visitedNodes[visitedNodes.length - 1] || currentNodeId
    const lastNode = nodes.find(n => n.id === lastNodeId)
    const resultMessage = lastNode?.result_message || 'Thank you for your feedback!'
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
          <CheckCircle2 size={40} color={colors.primary} />
        </View>
        <Text style={{ fontSize: typography['2xl'], fontWeight: '700', color: colors.foreground, marginBottom: spacing.sm, textAlign: 'center' }}>
          {resultMessage}
        </Text>
      </View>
    )
  }

  if (!currentNode) return null

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      {/* Progress Bar */}
      <View style={{ height: 4, backgroundColor: colors.muted }}>
        <View style={{ height: 4, backgroundColor: colors.primary, width: `${Math.min(progress, 100)}%` }} />
      </View>

      {/* Question Content */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.lg }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Question Number */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.primary }}>
              Question {visitedNodes.length + 1}
            </Text>
          </View>

          {/* Question Text */}
          <Text style={{ fontSize: typography['2xl'], fontWeight: '600', color: colors.foreground, lineHeight: 32 }}>
            {currentNode.question}
            {currentNode.is_required && <Text style={{ color: colors.primary }}> *</Text>}
          </Text>

          {/* Question Input */}
          {renderQuestion(currentNode)}
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
            disabled={visitedNodes.length === 0}
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: visitedNodes.length === 0 ? 0.4 : 1,
            }}
          >
            <ChevronUp size={20} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goNext}
            disabled={!canProceed}
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.md,
              backgroundColor: colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: !canProceed ? 0.4 : 1,
            }}
          >
            <ChevronDown size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* OK / Submit Button */}
        <TouchableOpacity
          onPress={goNext}
          disabled={!canProceed || isSubmitting}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: canProceed ? colors.primary : colors.muted,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderRadius: radius.md,
            opacity: isSubmitting ? 0.5 : 1,
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={{ fontSize: typography.base, fontWeight: '600', color: canProceed ? '#FFF' : colors.mutedForeground }}>
                OK
              </Text>
              <Check size={18} color={canProceed ? '#FFF' : colors.mutedForeground} strokeWidth={3} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default SurveyForm
