/**
 * Appgram React Native SDK Example App
 */

import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
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
  type Release,
  type HelpFlow,
  type HelpArticle,
  type BlogPost,
} from '@appgram/react-native';

type Screen =
  | { type: 'home' }
  | { type: 'wishes' }
  | { type: 'support' }
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
        return <SupportForm onSuccess={() => console.log('Ticket submitted')} />;
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
            onArticlePress={(slug, articleId) => {
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

  const needsScrollView = screen.type === 'home' || screen.type === 'support' || screen.type === 'survey';
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
});

export default App;
