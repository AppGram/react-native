/**
 * Appgram React Native SDK Example App
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { DocumentPickerResponse } from '@react-native-documents/picker';
import {
  AppgramProvider,
  WishList,
  SupportForm,
  HelpCenter,
  HelpFlowDetail,
  HelpArticleDetail,
  StatusBoard,
  Releases,
  ReleaseDetail,
  RoadmapBoard,
  SurveyForm,
  ChatScreen,
  BlogList,
  BlogPostDetail,
  useAppgramContext,
  useSupport,
  type Release,
  type HelpFlow,
  type HelpArticle,
  type BlogPost,
  type StoredTicket,
  type SupportAttachment,
  type SupportRequest,
  type SupportUploadFile,
} from '@appgram/react-native';

type Screen =
  | { type: 'home' }
  | { type: 'wishes' }
  | { type: 'support' }
  | { type: 'support-thread'; ticket: StoredTicket }
  | { type: 'help' }
  | { type: 'help-flow'; flow: HelpFlow }
  | { type: 'help-article'; flow: HelpFlow; article: HelpArticle }
  | { type: 'status' }
  | { type: 'releases' }
  | { type: 'release-detail'; release: Release }
  | { type: 'roadmap' }
  | { type: 'survey' }
  | { type: 'chat' }
  | { type: 'blog' }
  | { type: 'blog-detail'; post: BlogPost };

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppgramProvider
        config={{
          projectId: '8be98cbb-308e-4aaa-8201-4fa17d5f2116',
          orgSlug: 'acme-corp',
          projectSlug: 'my-app',
          theme: { mode: isDarkMode ? 'dark' : 'light' },
        }}
      >
        <AppContent />
      </AppgramProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>({ type: 'home' });
  const insets = useSafeAreaInsets();
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  const goBack = () => {
    switch (screen.type) {
      case 'release-detail':
        setScreen({ type: 'releases' });
        break;
      case 'help-article':
        setScreen({ type: 'help-flow', flow: screen.flow });
        break;
      case 'help-flow':
        setScreen({ type: 'help' });
        break;
      case 'support-thread':
        setScreen({ type: 'support' });
        break;
      case 'blog-detail':
        setScreen({ type: 'blog' });
        break;
      default:
        setScreen({ type: 'home' });
    }
  };

  const renderScreen = () => {
    switch (screen.type) {
      case 'wishes':
        return <WishList onWishPress={(wish) => console.log('Selected wish:', wish)} />;
      case 'support':
        return (
          <SupportForm
            onSuccess={() => console.log('Ticket submitted')}
            onStoredTicketClick={(ticket) => setScreen({ type: 'support-thread', ticket })}
          />
        );
      case 'support-thread':
        return <SupportThreadScreen ticket={screen.ticket} />;
      case 'help':
        return <HelpCenter onFlowPress={(flow) => setScreen({ type: 'help-flow', flow })} />;
      case 'help-flow':
        return <HelpFlowDetail flow={screen.flow} onArticlePress={(article) => setScreen({ type: 'help-article', flow: screen.flow, article })} />;
      case 'help-article':
        return <HelpArticleDetail article={screen.article} />;
      case 'status':
        return <StatusBoard />;
      case 'releases':
        return <Releases title="Changelog" description="See what's new" onReleasePress={(r) => setScreen({ type: 'release-detail', release: r })} />;
      case 'release-detail':
        return <ReleaseDetail release={screen.release} />;
      case 'roadmap':
        return <RoadmapBoard title="Roadmap" description="What we're working on" onItemPress={(i) => console.log('Item:', i)} />;
      case 'survey':
        return <SurveyForm slug="survey-feature-feedback" onSuccess={() => { console.log('Survey submitted'); setScreen({ type: 'home' }); }} />;
      case 'chat':
        return (
          <ChatScreen
            agentName="Help Bot"
            greeting="Hi there!"
            subtitle="How can I help you today?"
            onArticlePress={(slug, _articleId) => {
              Alert.alert('View Article', `Would open article: ${slug}`, [
                { text: 'Go to Help Center', onPress: () => setScreen({ type: 'help' }) },
                { text: 'Cancel', style: 'cancel' },
              ]);
            }}
            onSupportPress={() => setScreen({ type: 'support' })}
          />
        );
      case 'blog':
        return (
          <BlogList
            title="Blog"
            showSearch
            showCategories
            onPostPress={(post) => setScreen({ type: 'blog-detail', post })}
          />
        );
      case 'blog-detail':
        return <BlogPostDetail post={screen.post} />;
      default:
        return (
          <View style={styles.homeContainer}>
            <Text style={[styles.title, { color: textColor }]}>AppGram SDK Demo</Text>
            <Text style={[styles.subtitle, { color: textColor }]}>
              React Native SDK for feature voting, roadmaps, help center, and more
            </Text>
            <View style={styles.buttonContainer}>
              <MenuButton title="Feature Wishes" description="Vote on features and submit requests" onPress={() => setScreen({ type: 'wishes' })} />
              <MenuButton title="Roadmap" description="See what we're building" onPress={() => setScreen({ type: 'roadmap' })} />
              <MenuButton title="Changelog" description="See what's new" onPress={() => setScreen({ type: 'releases' })} />
              <MenuButton title="Blog" description="Read articles and updates" onPress={() => setScreen({ type: 'blog' })} />
              <MenuButton title="Help Center" description="Browse help articles" onPress={() => setScreen({ type: 'help' })} />
              <MenuButton title="AI Chat" description="Ask questions with AI" onPress={() => setScreen({ type: 'chat' })} />
              <MenuButton title="Support" description="Submit a support ticket" onPress={() => setScreen({ type: 'support' })} />
              <MenuButton title="Status" description="Check system status" onPress={() => setScreen({ type: 'status' })} />
              <MenuButton title="Survey" description="Give us feedback" onPress={() => setScreen({ type: 'survey' })} />
            </View>
          </View>
        );
    }
  };

  const needsScrollView = screen.type === 'home' || screen.type === 'support' || screen.type === 'support-thread' || screen.type === 'survey';
  const isFullScreen = screen.type === 'chat' || screen.type === 'blog' || screen.type === 'blog-detail';

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      {screen.type !== 'home' && (
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={[styles.backButtonText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
      )}
      {isFullScreen ? (
        <View style={styles.content}>{renderScreen()}</View>
      ) : needsScrollView ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderScreen()}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.contentContainer]}>{renderScreen()}</View>
      )}
    </View>
  );
}

function SupportThreadScreen({ ticket }: { ticket: StoredTicket }) {
  const { client } = useAppgramContext();
  const { submitMessage, isSubmittingMessage, error: submitError } = useSupport();
  const isDarkMode = useColorScheme() === 'dark';

  const [ticketData, setTicketData] = useState<SupportRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [selectedAttachments, setSelectedAttachments] = useState<SupportUploadFile[]>([]);
  const [pickerError, setPickerError] = useState<string | null>(null);

  const cardBg = isDarkMode ? '#2a2a2a' : '#f5f5f5';
  const inputBg = isDarkMode ? '#1f1f1f' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const subtextColor = isDarkMode ? '#aaaaaa' : '#666666';
  const borderColor = isDarkMode ? '#3a3a3a' : '#dddddd';

  const loadTicket = useCallback(async () => {
    if (!ticket.access_token) {
      setLoadError('This recent request does not have a local access token. Request a magic link to open it.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    const response = await client.getSupportTicket(ticket.id, ticket.access_token);
    if (response.success && response.data) {
      setTicketData(response.data);
    } else {
      setLoadError(response.error?.message || 'Failed to load support thread.');
    }

    setIsLoading(false);
  }, [client, ticket.access_token, ticket.id]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const toSupportUploadFile = (file: DocumentPickerResponse, index: number): SupportUploadFile => ({
    uri: file.uri,
    name: file.name || `thread-attachment-${index + 1}`,
    type: file.type || file.nativeType || 'application/octet-stream',
    size: file.size ?? undefined,
  });

  const pickAttachments = async () => {
    setPickerError(null);

    let documentPicker: typeof import('@react-native-documents/picker');

    try {
      documentPicker = await import('@react-native-documents/picker');
    } catch {
      setPickerError(
        'Document picker native module is not available in the current iOS binary. Run pod install and rebuild the iOS app after installing @react-native-documents/picker.'
      );
      return;
    }

    try {
      const files = await documentPicker.pick({
        mode: 'import',
        allowMultiSelection: true,
      });

      setSelectedAttachments(files.map(toSupportUploadFile));
    } catch (err) {
      if (documentPicker.isErrorWithCode(err) && err.code === documentPicker.errorCodes.OPERATION_CANCELED) {
        return;
      }

      const message = documentPicker.isErrorWithCode(err)
        ? `File picker failed: ${err.code}`
        : 'File picker failed.';
      setPickerError(message);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !ticket.access_token) return;

    const result = await submitMessage(ticket.id, ticket.access_token, {
      content: reply.trim(),
      attachments: selectedAttachments,
    });

    if (result) {
      setReply('');
      setSelectedAttachments([]);
      await loadTicket();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.threadLoading}>
        <ActivityIndicator />
        <Text style={[styles.threadMutedText, { color: subtextColor }]}>Loading support thread...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.threadCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.threadTitle, { color: textColor }]}>Could not open thread</Text>
        <Text style={[styles.threadMutedText, { color: subtextColor }]}>{loadError}</Text>
        <Text style={[styles.threadMutedText, { color: subtextColor }]}>Ticket: {ticket.subject}</Text>
      </View>
    );
  }

  const messages = ticketData?.messages || [];
  const requestAttachments = ticketData?.attachments || [];

  return (
    <View style={styles.threadContainer}>
      <View style={[styles.threadCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.threadTitle, { color: textColor }]}>{ticketData?.subject || ticket.subject}</Text>
        <Text style={[styles.threadMutedText, { color: subtextColor }]}>
          Status: {ticketData?.status || ticket.status} · {ticket.user_email}
        </Text>
        {!!ticketData?.description && (
          <Text style={[styles.threadBody, { color: textColor }]}>{ticketData.description}</Text>
        )}
        <AttachmentList attachments={requestAttachments} textColor={textColor} subtextColor={subtextColor} />
      </View>

      {messages.map((message) => (
        <View
          key={message.id}
          style={[
            styles.threadMessage,
            {
              alignSelf: message.author_type === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: message.author_type === 'user' ? '#2563eb' : cardBg,
            },
          ]}
        >
          <Text style={[styles.threadMessageAuthor, { color: message.author_type === 'user' ? '#ffffff' : subtextColor }]}>
            {message.author_type === 'user' ? 'You' : message.author_name || 'Support'}
          </Text>
          <Text style={[styles.threadMessageText, { color: message.author_type === 'user' ? '#ffffff' : textColor }]}>
            {message.content}
          </Text>
          <AttachmentList
            attachments={message.attachments || []}
            textColor={message.author_type === 'user' ? '#ffffff' : textColor}
            subtextColor={message.author_type === 'user' ? '#dbeafe' : subtextColor}
          />
        </View>
      ))}

      <View style={[styles.threadComposer, { backgroundColor: cardBg }]}>
        <Text style={[styles.threadComposerTitle, { color: textColor }]}>Reply in thread</Text>
        {(submitError || !ticket.access_token) && (
          <Text style={styles.threadError}>{submitError || 'Missing local access token for this ticket.'}</Text>
        )}
        {pickerError && (
          <Text style={styles.threadError}>{pickerError}</Text>
        )}
        <TextInput
          style={[styles.threadInput, styles.threadTextArea, { backgroundColor: inputBg, borderColor, color: textColor }]}
          value={reply}
          onChangeText={setReply}
          placeholder="Type a reply..."
          placeholderTextColor={subtextColor}
          multiline
        />
        <TouchableOpacity
          style={[styles.threadPickerButton, { borderColor }]}
          onPress={pickAttachments}
          disabled={isSubmittingMessage}
        >
          <Text style={[styles.threadPickerButtonText, { color: textColor }]}>
            {selectedAttachments.length > 0 ? 'Replace selected files' : 'Pick files'}
          </Text>
        </TouchableOpacity>
        {selectedAttachments.length > 0 && (
          <View style={styles.selectedAttachmentList}>
            {selectedAttachments.map((attachment) => (
              <View key={`${attachment.uri}-${attachment.name}`} style={[styles.selectedAttachmentRow, { borderColor }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.attachmentName, { color: textColor }]} numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Text style={[styles.attachmentMeta, { color: subtextColor }]}>
                    {attachment.type || 'application/octet-stream'}
                    {typeof attachment.size === 'number' ? ` · ${Math.round(attachment.size / 1024)} KB` : ''}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedAttachments((current) => current.filter((item) => item.uri !== attachment.uri))}
                >
                  <Text style={styles.removeAttachmentText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={[styles.threadSendButton, { opacity: reply.trim() && ticket.access_token && !isSubmittingMessage ? 1 : 0.5 }]}
          onPress={sendReply}
          disabled={!reply.trim() || !ticket.access_token || isSubmittingMessage}
        >
          {isSubmittingMessage ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.threadSendButtonText}>Send Reply</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AttachmentList({
  attachments,
  textColor,
  subtextColor,
}: {
  attachments: SupportAttachment[];
  textColor: string;
  subtextColor: string;
}) {
  if (attachments.length === 0) return null;

  return (
    <View style={styles.attachmentList}>
      {attachments.map((attachment) => (
        <View key={`${attachment.url}-${attachment.name}`} style={styles.attachmentRow}>
          <Text style={[styles.attachmentName, { color: textColor }]} numberOfLines={1}>
            {attachment.name}
          </Text>
          <Text style={[styles.attachmentMeta, { color: subtextColor }]}>
            {Math.round(attachment.size / 1024)} KB
          </Text>
        </View>
      ))}
    </View>
  );
}

function MenuButton({ title, description, onPress }: { title: string; description: string; onPress: () => void }) {
  const isDarkMode = useColorScheme() === 'dark';
  const cardBg = isDarkMode ? '#2a2a2a' : '#f5f5f5';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const subtextColor = isDarkMode ? '#aaaaaa' : '#666666';

  return (
    <TouchableOpacity style={[styles.menuButton, { backgroundColor: cardBg }]} onPress={onPress}>
      <Text style={[styles.menuButtonTitle, { color: textColor }]}>{title}</Text>
      <Text style={[styles.menuButtonDescription, { color: subtextColor }]}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  contentContainer: { flexGrow: 1, padding: 16 },
  backButton: { padding: 16, paddingBottom: 0 },
  backButtonText: { fontSize: 16, fontWeight: '600' },
  homeContainer: { flex: 1, alignItems: 'center', paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20, opacity: 0.7 },
  buttonContainer: { width: '100%', gap: 12 },
  menuButton: { padding: 20, borderRadius: 12 },
  menuButtonTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  menuButtonDescription: { fontSize: 14 },
  threadContainer: { gap: 12 },
  threadLoading: { alignItems: 'center', gap: 12, paddingTop: 40 },
  threadCard: { padding: 16, borderRadius: 12, gap: 8 },
  threadTitle: { fontSize: 22, fontWeight: '700' },
  threadBody: { fontSize: 15, lineHeight: 22, marginTop: 8 },
  threadMutedText: { fontSize: 13, lineHeight: 18 },
  threadMessage: { maxWidth: '88%', padding: 14, borderRadius: 14, gap: 6 },
  threadMessageAuthor: { fontSize: 12, fontWeight: '700' },
  threadMessageText: { fontSize: 15, lineHeight: 21 },
  threadComposer: { padding: 16, borderRadius: 12, gap: 10 },
  threadComposerTitle: { fontSize: 18, fontWeight: '700' },
  threadInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  threadTextArea: { minHeight: 96, textAlignVertical: 'top' },
  threadPickerButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  threadPickerButtonText: { fontSize: 14, fontWeight: '700' },
  threadSendButton: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 13, alignItems: 'center' },
  threadSendButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  threadError: { color: '#ef4444', fontSize: 13 },
  selectedAttachmentList: { gap: 8 },
  selectedAttachmentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 10, padding: 10 },
  removeAttachmentText: { color: '#ef4444', fontSize: 12, fontWeight: '700' },
  attachmentList: { gap: 6, marginTop: 6 },
  attachmentRow: { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: '#9ca3af', padding: 8 },
  attachmentName: { fontSize: 13, fontWeight: '600' },
  attachmentMeta: { fontSize: 11, marginTop: 2 },
});

export default App;
