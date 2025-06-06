import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Modal, Alert, Platform, KeyboardAvoidingView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getAuth, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { router } from 'expo-router';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';
import GradientButton from '@/components/GradientButton';
import PasswordField from '@/components/PasswordField';
import OutlineButton from '@/components/OutlineButton';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from '@/context/SessionContext';

const Profile = () => {
  const { session, updateSession, clearSession } = useSession();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Change Password Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const auth = getAuth();
  const firestore = getFirestore();
  const storage = getStorage();

  // Use session user data instead of fetching from Firestore
  useEffect(() => {
    if (session?.user) {
      setUserInfo(session.user);
      if (session.user.profileImage) {
        setProfileImageUrl(session.user.profileImage);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [session?.user]);

  // Handle profile image change
  const handleProfileImagePress = async () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              uploadProfileImage(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Take Photo',
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              uploadProfileImage(result.assets[0].uri);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Upload image and update Firestore and session
  const uploadProfileImage = async (uri: string) => {
    try {
      setUploading(true);
      const user = auth.currentUser;
      if (!user) return;

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Firebase Storage
      const imageRef = ref(storage, `profileImages/${user.uid}.jpg`);
      await uploadBytes(imageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);

      // Update Firestore user document
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, { profileImage: downloadURL });

      setProfileImageUrl(downloadURL);

      // Update session user profileImage
      if (session?.user) {
        await updateSession({
          user: {
            ...session.user,
            profileImage: downloadURL,
          }
        });
        setUserInfo({
          ...session.user,
          profileImage: downloadURL,
        });
      }

      Alert.alert('Success', 'Profile photo updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile photo.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        clearSession();
        router.replace('/login');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  const handleChangePassword = async () => {
    setFormError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      setFormError('New password is too weak (min 6 characters).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('New password and confirm password do not match.');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        setFormError('User not found.');
        return;
      }
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully.');
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setFormError('Current password is incorrect.');
      } else if (error.code === 'auth/weak-password') {
        setFormError('New password is too weak.');
      } else {
        setFormError('Failed to change password.');
      }
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Image source={require('../../assets/images/loading.gif')} style={styles.loadinggif} />
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

  const accountType = userInfo.type === 'admin' ? 'Administrator' : 
                      userInfo.type === 'user' ? 'User' : 'Tour Guide';

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#205781', '#7AB2D3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        />
        {/* Profile Image in front */}
        <TouchableOpacity style={styles.profileImageWrapper} onPress={handleProfileImagePress} disabled={uploading}>
          <Image
            source={
              profileImageUrl
                ? { uri: profileImageUrl }
                : require('../../assets/images/defaultUser.jpg')
            }
            style={styles.profileImage}
            onError={() => setProfileImageUrl('')}
          />
          {uploading && (
            <View style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(255,255,255,0.7)',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 55,
            }}>
              <ActivityIndicator size="small" color="#205781" />
              <ThemedText>Uploading...</ThemedText>
            </View>
          )}
        </TouchableOpacity>
        {/* Name and Username */}
        <View style={styles.nameSection}>
          <ThemedText type="title" style={styles.nameText}>
            {userInfo.fname} {userInfo.mname} {userInfo.lname}
          </ThemedText>
          <ThemedText style={styles.usernameText}>@{userInfo.username}</ThemedText>
          <ThemedText style={styles.accountTypeText}>{accountType}</ThemedText>
        </View>

        {/* Options Section */}
        <ThemedView style={styles.options}>
          <Collapsible title="General Information">
            <ThemedText style={styles.collapsibleChild}>
              Name: {userInfo.fname} {userInfo.mname} {userInfo.lname}
            </ThemedText>
            <ThemedText style={styles.collapsibleChild}>
              Username: {userInfo.username}
            </ThemedText>
            <ThemedText style={styles.collapsibleChild}>
              Gender: {userInfo.gender}
            </ThemedText>
            <ThemedText style={styles.collapsibleChild}>
              Email: {userInfo.email}
            </ThemedText>
            <ThemedText style={styles.collapsibleChild}>
              Phone: {userInfo.contactNumber}
            </ThemedText>
            <ThemedText style={styles.collapsibleChild}>
              Type: {accountType}
            </ThemedText>
            <ThemedText style={styles.collapsibleChild}>
              Status: {userInfo.status}
            </ThemedText>
            <ThemedText style={styles.collapsibleChild}>
              Created: {userInfo.createdOn instanceof Date ? userInfo.createdOn.toLocaleString() : ''}
            </ThemedText>
          </Collapsible>

          

          <Collapsible title="Privacy and Security">
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <ThemedText style={styles.collapsibleChild}>Change Password</ThemedText>
            </TouchableOpacity>
          </Collapsible>

          <Collapsible title="Tour Guide Settings">
          {userInfo.type === 'tourGuide' ? 
            <View>
              <TouchableOpacity onPress={() => router.push('/tourGuideApplication')}>
                <ThemedText style={styles.collapsibleChild}>View Tour Guide Information</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/tourGuideApplication')}>
                <ThemedText style={styles.collapsibleChild}>Manage Tours</ThemedText>
              </TouchableOpacity>
            </View>
            :
            <TouchableOpacity onPress={() => router.push('/tourGuideApplication')}>
              <ThemedText style={styles.collapsibleChild}>Apply as Tour Guide</ThemedText>
            </TouchableOpacity>
          }
          </Collapsible>

          {/* UNFINISHED AREA */}
          <Collapsible title="Help and Support">
            <TouchableOpacity>
              <ThemedText style={styles.collapsibleChild}>App Manual</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity>
              <ThemedText style={styles.collapsibleChild}>Terms and Conditions</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity>
              <ThemedText style={styles.collapsibleChild}>Contact Support</ThemedText>
            </TouchableOpacity>
          </Collapsible>
        </ThemedView>

        <View style={styles.logoutContainer}>
          <GradientButton
            title="Log Out"
            onPress={handleLogout}
            gradientColors={['#205781', '#7AB2D3']}
            textStyle={styles.logoutButtonText}
          />
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ThemedView style={styles.modalCardWrapper}>
            <ThemedText type="title" style={{ marginBottom: 10, color: '#205781', fontWeight: 'bold' }}>
              Change Password
            </ThemedText>
            <ThemedText>Make your account secure by changing your password regularly.</ThemedText>

            <PasswordField
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              onFocus={() => setFocusedInput('current')}
              onBlur={() => setFocusedInput(null)}
              isFocused={focusedInput === 'current'}
            />

            <PasswordField
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              onFocus={() => setFocusedInput('new')}
              onBlur={() => setFocusedInput(null)}
              isFocused={focusedInput === 'new'}
            />

            <PasswordField
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setFocusedInput('confirm')}
              onBlur={() => setFocusedInput(null)}
              isFocused={focusedInput === 'confirm'}
            />

            {formError ? (
              <ThemedText style={{ color: '#d32f2f', backgroundColor: '#fdecea', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 14, textAlign: 'center', fontSize: 15 }}>
                {formError}
              </ThemedText>
            ) : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <OutlineButton
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  setFormError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              />
              <GradientButton
                title="Submit"
                onPress={handleChangePassword}
                gradientColors={['#205781', '#7AB2D3']}
              />
            </View>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  header: {
    width: '100%',
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
    zIndex: 0,
  },
  profileImageWrapper: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    zIndex: 2,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: "cover",
  },
  nameSection: {
    marginTop: 230,
    alignItems: 'center',
    marginBottom: 10,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  usernameText: {
    fontSize: 16,
    color: '#888',
    marginTop: 2,
  },
  accountTypeText: {
    fontSize: 15,
    color: '#205781',
    marginTop: 2,
    fontWeight: 'bold',
  },
  options: {
    marginTop: 10,
    padding: 15,
    borderRadius: 14,
    marginHorizontal: 16,
    elevation: 2,
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  collapsibleChild: {
    padding: 4,
    fontSize: 15,
  },
  logoutContainer: {
    margin:15,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadinggif: {
    width: 100,
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCardWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    height: '100%',
    padding: 20,
  },
});

export default Profile;