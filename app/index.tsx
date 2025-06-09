// app/index.tsx
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firestore/config'; // Adjust the import path as necessary
import { doc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export default function Index() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const status = userData.status;

            if (status === 'Active') {
              router.replace('/home');
            } else if (status === 'Warned') {
              router.replace('/home');
            } else {
              Alert.alert('Account Inactive', 'Your account is not active. Please contact support.');
              router.replace('/login');
            }
            
          } else {
            Alert.alert('Login Failed', 'User record not found.');
            router.replace('/login');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          Alert.alert('Login Error', 'Something went wrong. Please try again later.');
          router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    });

    return unsubscribe;
  }, []);

  return null;
}
