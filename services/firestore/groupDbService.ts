import { collection, doc, getDoc, setDoc, addDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './config'; // Adjust path based on your project structure

const GROUPS_COLLECTION = 'groups';
const USERS_COLLECTION = 'users';

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
  createdOn: any; // Firestore Timestamp
  itinerary?: string;
  members?: string[];
}

/**
 * Generate a random alphanumeric invite code
 */
const generateInviteCode = (length = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/**
 * Fetch a group by its Firestore ID
 */
export const getGroupById = async (groupId: string): Promise<GroupData | null> => {
  const ref = doc(db, GROUPS_COLLECTION, groupId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? (snapshot.data() as GroupData) : null;
};

/**
 * Add a group ID to the user's "groups" array field in the user document
 */
export const addGroupToUserInfo = async (userId: string, groupId: string): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    groups: arrayUnion(groupId),
  });
};

/**
 * Create a new group document in Firestore with auto-generated ID
 * and add the group ID to the user's "groups" array field
 */
export const createGroup = async (
  { name, admin, itinerary, members }: CreateGroupParams
): Promise<void> => {
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

  const docRef = await addDoc(collection(db, GROUPS_COLLECTION), groupData);

  // Add the group ID to the user's "groups" array field
  await addGroupToUserInfo(admin, docRef.id);
};