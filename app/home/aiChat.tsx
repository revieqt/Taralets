import React, { useState, useRef } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAIChat } from '@/hooks/useAIChat';

export default function AIChatScreen() {
  const { messages, loading, error, sendMessage, resetChat } = useAIChat();
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  // Scroll to bottom when new message arrives
  React.useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <ThemedView style={{ flex: 1, padding: 0 }}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Tara AI Chat</ThemedText>
        <TouchableOpacity onPress={resetChat} style={styles.resetBtn}>
          <ThemedText type="link">Reset</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user' ? styles.userBubble : styles.aiBubble
          ]}>
            <ThemedText style={item.role === 'user' ? styles.userText : styles.aiText}>
              {item.content}
            </ThemedText>
          </View>
        )}
        ListEmptyComponent={
          <ThemedText style={{ textAlign: 'center', marginTop: 40, color: '#888' }}>
            Start chatting with Tara AI!
          </ThemedText>
        }
      />
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
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#aaa"
            onSubmitEditing={handleSend}
            editable={!loading}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={loading || !input.trim()}>
            <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Send</ThemedText>
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
  messageBubble: {
    marginVertical: 6,
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
    backgroundColor: '#E6E6FA',
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
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: '#4300FF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
});