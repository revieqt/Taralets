import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { router } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { initializeApp } from 'firebase/app';

const Profile = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(firestore, 'users', user.uid); // Assuming 'users' is the collection name
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data: ', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [auth.currentUser]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        router.replace('/login');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Image source={require('../../../assets/images/loading.gif')} style={styles.loadinggif}/>
        <ThemedText type='subtitle'>LOADING</ThemedText>
      </ThemedView>
    );
  }

  if (!userInfo) {
    return (
      <ThemedView>
        <ThemedText>No user data available.</ThemedText>
      </ThemedView>
    );
  }
  const accountType = userInfo.type === 'admin' ? 'Admin' : 
  (userInfo.type === 'user' ? 'User' : 'Tour Guide');
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.profile}>

        </ThemedView>

        <ThemedView style={styles.profileInfo}>
          <ThemedText type='subtitle'>{userInfo.username}</ThemedText>
          <ThemedText>{accountType}</ThemedText>
          <ThemedText>Email: {userInfo.email}</ThemedText>
          <ThemedText>Phone: {userInfo.contactNumber}</ThemedText>
          <Button title="Log Out" onPress={handleLogout} />
        </ThemedView>
      </ThemedView>
      
      
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container:{
    flex: 1,
    padding: 20,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
  },
  profile: {
    flex: 1,
    aspectRatio: 1,
  },
  profileInfo: {
    flex: 2,
    gap: 5,
    padding: 10,
    marginTop:5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadinggif:{
    width: 150,
    resizeMode: 'contain',
  }
});

export default Profile;
