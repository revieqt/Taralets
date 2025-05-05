// app/index.tsx
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../auth/firebaseConfig';
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
            const userType = userData.type;
            const status = userData.status;

            if (status === 'Active') {
              if (userType === 'admin') {
                router.replace('/admin/home');
              } else if (userType === 'user' || userType === 'guide') {
                router.replace('/user/home');
              } else {
                Alert.alert('Login Failed', 'Unknown user type.');
                router.replace('/login');
              }
            } else if (status === 'Warned') {
              // Placeholder: You can add special behavior here later
              if (userType === 'admin') {
                router.replace('/admin/home');
              } else {
                router.replace('/user/home');
              }
              // Later, you might show a warning modal or message here
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
