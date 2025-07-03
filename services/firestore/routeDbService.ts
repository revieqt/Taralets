import { db } from './config';
import {
  doc,
  getDoc,
  addDoc,
  collection,
  Timestamp,
} from 'firebase/firestore';

type LocationPoint = {
  latitude: number;
  longitude: number;
  locationName: string;
};

export type RouteData = {
  createdOn?: any; // Firestore timestamp
  location: LocationPoint[];
  status: string;
  userID: string;
  polyline?: string; // <-- Added for snapped road polyline support
};

const ROUTES_COLLECTION = 'routes';

/**
 * Retrieves route information by route ID.
 * @param routeId - The Firestore document ID of the route.
 * @returns Route data or null if not found.
 */
export async function getRouteById(routeId: string): Promise<RouteData | null> {
  try {
    const docRef = doc(db, ROUTES_COLLECTION, routeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as RouteData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting route:', error);
    return null;
  }
}

/**
 * Saves route data to Firestore.
 * If routeId is provided, it will overwrite the existing document.
 * If not, a new document will be created with a generated ID.
 * @param routeId - (Optional) The Firestore document ID for the route.
 * @param data - The route data to save.
 * @returns The document reference of the saved route.
 */
export const addGroupRoute = async (data: RouteData) => {
  const routeRef = collection(db, 'routes');
  await addDoc(routeRef, {
    ...data,
    createdOn: Timestamp.fromDate(data.createdOn),
  });
};