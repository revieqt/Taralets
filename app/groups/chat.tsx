import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import {
  listenToMessages,
  sendMessageToChat,
} from '@/services/firestore/chatDbService';
import { useSession } from '@/context/SessionContext';

interface ChatModalProps {
  chatId: string | null;
  visible: boolean;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ chatId, visible, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const { session } = useSession();

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = listenToMessages(chatId, (msgs) => {
      setMessages(msgs.reverse()); // to show newest last
    });

    return () => unsubscribe?.();
  }, [chatId]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatId || !session?.user?.id) return;

    await sendMessageToChat(chatId, {
      text: inputText.trim(),
      senderId: session.user.id,
      type: 'text',
      readBy: [],
    });

    setInputText('');
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.header}>Chat</Text>

        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => {
            const isSelf = item.senderId === session?.user?.id;
            return (
              <View style={[styles.message, isSelf ? styles.self : styles.other]}>
                <Text>{item.text}</Text>
                <Text style={styles.timestamp}>
                  {item.createdAt?.toDate?.().toLocaleTimeString?.() || ''}
                </Text>
              </View>
            );
          }}
          style={styles.chatList}
          inverted
        />

        <View style={styles.inputRow}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            style={styles.input}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ChatModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chatList: {
    flex: 1,
  },
  message: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: '80%',
  },
  self: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  other: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sendBtn: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#00ffde',
    borderRadius: 8,
  },
  sendText: {
    color: '#000',
    fontWeight: 'bold',
  },
  closeBtn: {
    marginTop: 16,
    alignSelf: 'center',
  },
  closeText: {
    color: 'red',
  },
});
