import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from './config';
import { useSession } from '@/context/SessionContext';

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

export const getGroupMembers = async (groupId: string) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) return [];

  const groupData = groupSnap.data();
  const memberIds = Array.isArray(groupData.members) ? groupData.members : [];

  if (memberIds.length === 0) return [];

  // Fetch all user docs in parallel
  const userDocs = await Promise.all(
    memberIds.map(async (uid) => {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { id: uid, ...userSnap.data() };
      }
      return null;
    })
  );

  // Filter out any nulls (non-existent users)
  return userDocs.filter(Boolean);
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


export const joinGroupByInviteCodeWithUser = async (
  inviteCode: string,
  userId: string,
  updateSession: (newData: Partial<any>) => Promise<void>
): Promise<{ success: boolean; message: string }> => {
  try {
    // Find group by invite code
    const groupsRef = collection(db, GROUPS_COLLECTION);
    const q = query(groupsRef, where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, message: 'No group found with that invite code.' };
    }

    const groupDoc = querySnapshot.docs[0];
    const groupId = groupDoc.id;
    const groupData = groupDoc.data() as GroupData;

    // Add user to group's members array if not already present
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    const updatedMembers = groupData.members?.includes(userId)
      ? groupData.members
      : [...(groupData.members || []), userId];
    await updateDoc(groupRef, { members: updatedMembers });

    // Add groupId to user's groups array in Firestore
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      // If groups field doesn't exist, create it as an array with groupId
      if (!Array.isArray(userData.groups)) {
        await updateDoc(userRef, { groups: [groupId] });
      } else {
        await updateDoc(userRef, { groups: arrayUnion(groupId) });
      }
    } else {
      // If user doc doesn't exist, do nothing or handle as needed
      return { success: false, message: 'User not found.' };
    }

    // Update SessionContext (add groupId to user's groups array)
    if (typeof updateSession === 'function') {
      await updateSession((prev: any) => {
        const prevGroups = prev?.user?.groups || [];
        return {
          user: {
            ...prev.user,
            groups: prevGroups.includes(groupId)
              ? prevGroups
              : [...prevGroups, groupId],
          },
        };
      });
    }

    return { success: true, message: 'Successfully joined the group!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to join group.' };
  }
};