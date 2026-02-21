import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  type ViewStyle,
  type ListRenderItem,
} from 'react-native'
import { Send, FileText, LifeBuoy } from 'lucide-react-native'
import Markdown from 'react-native-markdown-display'
import { useAppgramContext, useAppgramTheme } from '../../provider'

interface ChatSource {
  article_id: string
  title: string
  slug: string
  similarity: number
}

interface ChatMessage {
  id: string
  content: string
  sender: 'agent' | 'user'
  timestamp: string
  sources?: ChatSource[]
  showSupportBanner?: boolean
}

interface QuickOption {
  label: string
  value?: string
}

export interface ChatScreenProps {
  /** Name of the chat agent */
  agentName?: string
  /** Initial greeting message */
  greeting?: string
  /** Subtitle shown below greeting */
  subtitle?: string
  /** Quick reply options shown initially */
  options?: QuickOption[]
  /** Accent color override */
  accentColor?: string
  /** Callback when an article source is tapped */
  onArticlePress?: (slug: string, articleId: string) => void
  /** Callback when support button is tapped */
  onSupportPress?: () => void
  /** Custom style for container */
  style?: ViewStyle
  /** Input placeholder text */
  placeholder?: string
}

/**
 * ChatScreen Component
 *
 * Full-screen AI-powered chat for help center integration.
 * Queries the help center API and displays responses with sources.
 *
 * @example
 * ```tsx
 * import { ChatScreen } from '@appgram/react-native'
 *
 * function HelpChatScreen({ navigation }) {
 *   return (
 *     <ChatScreen
 *       agentName="Support Bot"
 *       greeting="Hi there!"
 *       subtitle="How can I help you today?"
 *       options={[
 *         { label: 'I need help getting started' },
 *         { label: 'I have a billing question' },
 *       ]}
 *       onArticlePress={(slug, articleId) => {
 *         navigation.navigate('HelpArticle', { slug })
 *       }}
 *       onSupportPress={() => navigation.navigate('Support')}
 *     />
 *   )
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom accent color
 * <ChatScreen
 *   accentColor="#6366F1"
 *   placeholder="Type your question..."
 *   onSupportPress={() => setShowSupport(true)}
 * />
 * ```
 */
export function ChatScreen({
  agentName = 'Help Assistant',
  greeting = 'Hello',
  subtitle = 'How can I help you today?',
  options = [
    { label: 'I need help getting started' },
    { label: 'I have a question' },
    { label: 'Just browsing' },
  ],
  accentColor,
  onArticlePress,
  onSupportPress,
  style,
  placeholder = 'Ask a question...',
}: ChatScreenProps): React.ReactElement {
  const { config, client } = useAppgramContext()
  const { colors, radius, typography, spacing } = useAppgramTheme()
  const accent = accentColor || colors.primary

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const flatListRef = useRef<FlatList>(null)

  // Initial greeting message
  useEffect(() => {
    setMessages([
      {
        id: 'greeting',
        content: `${greeting}\n${subtitle}`,
        sender: 'agent',
        timestamp: 'now',
      },
    ])
  }, [greeting, subtitle])

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToEnd()
  }, [messages, scrollToEnd])

  const askQuestion = async (query: string): Promise<{ answer: string; sources: ChatSource[]; showSupport: boolean }> => {
    const response = await fetch(`${config.apiUrl}/portal/help/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ project_id: config.projectId, query }),
    })
    const data = await response.json()
    if (data.success) {
      return {
        answer: data.data.answer,
        sources: data.data.sources || [],
        showSupport: data.data.show_user_support || false,
      }
    }
    throw new Error('Failed to get response')
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    setShowOptions(false)
    const query = text.trim()
    setInputValue('')

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: query,
      sender: 'user',
      timestamp: 'now',
    }
    setMessages(prev => [...prev, userMessage])

    setIsLoading(true)
    try {
      const { answer, sources, showSupport } = await askQuestion(query)
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: answer,
          sender: 'agent',
          timestamp: 'now',
          sources,
          showSupportBanner: showSupport,
        },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: "Sorry, I couldn't process that request. Please try again.",
          sender: 'agent',
          timestamp: 'now',
        },
      ])
    }
    setIsLoading(false)
  }

  const handleOptionPress = (option: QuickOption) => {
    sendMessage(option.value || option.label)
  }

  const handleSourcePress = (source: ChatSource) => {
    onArticlePress?.(source.slug, source.article_id)
  }

  const renderMessage: ListRenderItem<ChatMessage> = ({ item }) => {
    const isUser = item.sender === 'user'

    if (isUser) {
      return (
        <View
          style={{
            alignSelf: 'flex-end',
            maxWidth: '85%',
            marginBottom: spacing.md,
            backgroundColor: accent,
            borderRadius: radius.lg,
            borderTopRightRadius: radius.sm,
            padding: spacing.md,
          }}
        >
          <Text style={{ fontSize: typography.sm, color: '#FFF' }}>
            {item.content}
          </Text>
        </View>
      )
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: spacing.md,
          maxWidth: '90%',
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.md,
            backgroundColor: accent + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.sm,
          }}
        >
          <Text style={{ fontSize: typography.sm, fontWeight: '600', color: accent }}>
            {agentName.charAt(0)}
          </Text>
        </View>
        <View style={{ flexShrink: 1 }}>
          <Markdown
            style={{
              body: { fontSize: typography.sm, color: colors.foreground, lineHeight: 22 },
              paragraph: { marginTop: 0, marginBottom: 8 },
              strong: { fontWeight: '600' },
              link: { color: accent },
              code_inline: { backgroundColor: colors.muted, paddingHorizontal: 4, borderRadius: 4, fontSize: typography.xs },
              code_block: { backgroundColor: colors.muted, padding: spacing.sm, borderRadius: radius.md, fontSize: typography.xs },
              bullet_list: { marginVertical: 4 },
              ordered_list: { marginVertical: 4 },
              list_item: { marginVertical: 2 },
            }}
          >
            {item.content}
          </Markdown>

          {/* Sources */}
          {item.sources && item.sources.length > 0 && (
            <View style={{ marginTop: spacing.sm }}>
              <Text style={{ fontSize: typography.xs, color: colors.mutedForeground, marginBottom: spacing.xs }}>
                Related articles
              </Text>
              {item.sources.map(source => (
                <TouchableOpacity
                  key={source.article_id}
                  onPress={() => handleSourcePress(source)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 4,
                  }}
                >
                  <FileText size={14} color={accent} style={{ marginRight: spacing.xs }} />
                  <Text
                    style={{ fontSize: typography.xs, color: accent, flexShrink: 1 }}
                    numberOfLines={1}
                  >
                    {source.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Support Banner */}
          {item.showSupportBanner && onSupportPress && (
            <View
              style={{
                marginTop: spacing.md,
                padding: spacing.md,
                borderRadius: radius.lg,
                backgroundColor: '#F9731615',
                borderWidth: 1,
                borderColor: '#F9731630',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radius.md,
                    backgroundColor: '#F97316',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.sm,
                  }}
                >
                  <LifeBuoy size={16} color="#FFF" />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={{ fontSize: typography.sm, fontWeight: '600', color: colors.foreground }}>
                    Need more help?
                  </Text>
                  <Text style={{ fontSize: typography.xs, color: colors.mutedForeground, marginTop: 2 }}>
                    Our support team is here to assist you.
                  </Text>
                  <TouchableOpacity
                    onPress={onSupportPress}
                    style={{
                      marginTop: spacing.sm,
                      backgroundColor: '#EA580C',
                      paddingVertical: spacing.xs,
                      paddingHorizontal: spacing.md,
                      borderRadius: radius.md,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ fontSize: typography.xs, fontWeight: '600', color: '#FFF' }}>
                      Contact Support
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    )
  }

  const renderQuickOptions = () => {
    if (!showOptions || messages.length > 1) return null

    return (
      <View style={{ marginLeft: 32 + spacing.sm }}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleOptionPress(option)}
            style={{
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              padding: spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{ fontSize: typography.sm, color: colors.foreground }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  const renderLoading = () => {
    if (!isLoading) return null

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: radius.md,
            backgroundColor: accent + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.sm,
          }}
        >
          <Text style={{ fontSize: typography.sm, fontWeight: '600', color: accent }}>
            {agentName.charAt(0)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.mutedForeground} />
          <Text style={{ fontSize: typography.xs, color: colors.mutedForeground, marginLeft: 8 }}>
            Thinking...
          </Text>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.lg, paddingHorizontal: spacing.md }}
        ListFooterComponent={
          <>
            {renderQuickOptions()}
            {renderLoading()}
          </>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.md,
          paddingBottom: spacing.md + (Platform.OS === 'ios' ? 20 : 0),
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          editable={!isLoading}
          multiline
          style={{
            flex: 1,
            backgroundColor: colors.background,
            borderRadius: radius.lg,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            fontSize: typography.sm,
            color: colors.foreground,
            minHeight: 48,
            maxHeight: 100,
            borderWidth: 1,
            borderColor: colors.border,
            marginRight: spacing.sm,
          }}
          onSubmitEditing={() => sendMessage(inputValue)}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={() => sendMessage(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: inputValue.trim() && !isLoading ? accent : colors.muted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Send size={18} color={inputValue.trim() && !isLoading ? '#FFF' : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

export default ChatScreen
