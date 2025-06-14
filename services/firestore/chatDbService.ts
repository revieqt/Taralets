import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  orderBy,
  limit,
  query,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  CollectionReference,
  DocumentData,
  where,
} from 'firebase/firestore';
import { db } from './config';

const CHATS_COLLECTION = 'chats';

interface ChatData {
  isGroup: boolean;
  name?: string;
  members: string[];
  createdAt: any;
  lastMessage: {
    text: string;
    senderId: string;
    createdAt: any;
  } | null;
}

interface MessageData {
  text: string;
  senderId: string;
  createdAt: any;
  readBy: string[];
  type: 'text' | 'image' | 'audio' | 'location';
  mediaUrl?: string;
}

// 🔍 1. Get chat document by ID
export const getChatById = async (chatId: string): Promise<ChatData | null> => {
  const ref = doc(db, CHATS_COLLECTION, chatId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? (snapshot.data() as ChatData) : null;
};

// 🧾 2. Get latest messages from a chat (optional limit)
export const getChatMessages = async (
  chatId: string,
  limitCount: number = 30
): Promise<MessageData[]> => {
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as MessageData);
};

// ✉️ 3. Send message to chat
export const sendMessageToChat = async (
  chatId: string,
  message: Omit<MessageData, 'createdAt'>
): Promise<void> => {
  const messageRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
  const payload: MessageData = {
    ...message,
    createdAt: serverTimestamp(),
  };

  await addDoc(messageRef, payload);
  await updateLastMessage(chatId, payload);
};

// 🔄 4. Update chat's last message
export const updateLastMessage = async (
  chatId: string,
  message: MessageData
): Promise<void> => {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  await updateDoc(chatRef, {
    lastMessage: {
      text: message.text,
      senderId: message.senderId,
      createdAt: serverTimestamp(),
    },
  });
};

// 👂 5. Real-time message listener
export const listenToMessages = (
  chatId: string,
  onUpdate: (messages: MessageData[]) => void
) => {
  const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => doc.data() as MessageData);
    onUpdate(messages);
  });
};

// ➕ 6. Add user to chat
export const addUserToChat = async (chatId: string, userId: string): Promise<void> => {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  await updateDoc(chatRef, {
    members: arrayUnion(userId),
  });
};


export const getUserChats = async (userId: string) => {
  const q = query(collection(db, 'chats'), where('members', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};



