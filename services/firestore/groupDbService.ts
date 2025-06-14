import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './config'; // Adjust path based on your project structure

const GROUPS_COLLECTION = 'groups';
const USERS_COLLECTION = 'users';
const CHATS_COLLECTION = 'chats';

interface CreateGroupParams {
  name?: string;
  admin: string;
  itinerary?: string;
  members?: string[];
}

interface GroupData {
  name?: string;
  admin: string;
  inviteCode: string;
  status: 'active';
  type: 'group';
  createdOn: any;
  itinerary?: string;
  members?: string[];
}

const generateInviteCode = (length = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const getGroupById = async (groupId: string): Promise<GroupData | null> => {
  const ref = doc(db, GROUPS_COLLECTION, groupId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? (snapshot.data() as GroupData) : null;
};

export const addGroupToUserInfo = async (userId: string, groupId: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    groups: arrayUnion(groupId),
  });
};

export const getGroupMembers = async (groupId: string): Promise<any[]> => {
  const groupRef = doc(db, GROUPS_COLLECTION, groupId);
  const groupSnap = await getDoc(groupRef);

  if (!groupSnap.exists()) return [];

  const groupData = groupSnap.data() as GroupData;
  const memberIds = groupData.members || [];

  const memberPromises = memberIds.map(async (userId) => {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? { id: userId, ...userSnap.data() } : null;
  });

  console.log('memberIds:', memberIds);
  const members = await Promise.all(memberPromises);
  return members.filter(Boolean);
};

// ✅ UPDATED createGroup
export const createGroup = async ({
  name,
  admin,
  itinerary,
  members,
}: CreateGroupParams): Promise<void> => {
  const groupData: GroupData = {
    name,
    admin,
    inviteCode: generateInviteCode(),
    status: 'active',
    type: 'group',
    createdOn: serverTimestamp(),
    ...(itinerary && { itinerary }),
    ...(members && { members }),
  };

  // Create the group document
  const groupDocRef = await addDoc(collection(db, GROUPS_COLLECTION), groupData);
  const groupId = groupDocRef.id;

  // Add group ID to user's info
  await addGroupToUserInfo(admin, groupId);

  // ✅ Create corresponding chat document for group
  const chatRef = doc(db, CHATS_COLLECTION, groupId);
  await setDoc(chatRef, {
    isGroup: true,
    name: name || 'Group Chat',
    members: [admin, ...(members || [])],
    createdAt: serverTimestamp(),
    lastMessage: null,
  });

  // (Optional) You can initialize with a welcome message:
  const welcomeMessage = {
    text: `Welcome to the group chat ${name || ''}!`,
    createdAt: serverTimestamp(),
    senderId: admin,
    type: 'text',
    readBy: [admin],
  };

  const messagesCollection = collection(db, CHATS_COLLECTION, groupId, 'messages');
  await addDoc(messagesCollection, welcomeMessage);
};
