import React, { useState, useRef } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as Speech from 'expo-speech';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedIcons } from '@/components/ThemedIcons';
import { useAIChat } from '@/hooks/useAIChat';
import TextField from '@/components/TextField';
import KebabMenu from '@/components/KebabMenu';

export default function AIChatScreen() {
  const { messages, loading, error, sendMessage, resetChat } = useAIChat();
  const [input, setInput] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  // Speak the latest assistant message if TTS is enabled
  React.useEffect(() => {
    if (
      ttsEnabled &&
      messages.length > 0 &&
      messages[messages.length - 1].role === 'assistant'
    ) {
      Speech.speak(messages[messages.length - 1].content, { language: 'en' });
    }
  }, [messages, ttsEnabled]);

  React.useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const showIntro = messages.length === 0;

  return (
    <ThemedView style={{ flex: 1, padding: 0 }}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Tara</ThemedText>
        <KebabMenu
          actions={[
            {
              label: ttsEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech',
              icon: <MaterialIcons name="record-voice-over" size={20} color="#222" />,
              onPress: () => setTtsEnabled((prev) => !prev),
            },
            {
              label: 'Reset Chat',
              icon: <MaterialIcons name="refresh" size={20} color="#222" />,
              onPress: resetChat,
            },
          ]}
        />
      </ThemedView>
      {showIntro ? (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <Image
            source={require('@/assets/images/tara-profile.png')}
            style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10}}
          />
          <ThemedText type="subtitle" style={{ marginBottom: 10 }}>Hello, I am Tara</ThemedText>
          <ThemedText style={{ textAlign: 'center', color: '#888' }}>
            Your personal travel companion. Ask me anything about travel—destinations, tips, weather, and more.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, idx) => idx.toString()}
          contentContainerStyle={styles.messagesContainer}
          renderItem={({ item }) => (
            <View style={[
              styles.messageRow,
              item.role === 'assistant' ? styles.aiRow : styles.userRow
            ]}>
              {item.role === 'assistant' && (
                <Image
                  source={require('@/assets/images/tara-profile.png')}
                  style={styles.taraProfile}
                />
              )}
              <View style={[
                styles.messageBubble,
                item.role === 'user' ? styles.userBubble : styles.aiBubble
              ]}>
                <ThemedText style={item.role === 'user' ? styles.userText : styles.aiText}>
                  {item.content}
                </ThemedText>
                {item.showGoToRoutes && (
                  <TouchableOpacity
                    style={{
                      marginTop: 8,
                      backgroundColor: '#4300FF',
                      borderRadius: 8,
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      alignSelf: 'flex-start'
                    }}
                    onPress={() => router.push('/routes/routes')}
                  >
                    <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Go to Routes</ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4300FF" />
        </View>
      )}
      {error && (
        <ThemedText style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</ThemedText>
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.inputRow}>
          <TextField
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            onSubmitEditing={handleSend}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading || !input.trim()}>
            <ThemedIcons library='MaterialIcons' name='send' size={30} color='#00FFDE'/>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  resetBtn: {
    padding: 6,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 6,
    maxWidth: '100%',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  taraProfile: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4300FF',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f6f6f6',
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#222',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  sendBtn: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
});