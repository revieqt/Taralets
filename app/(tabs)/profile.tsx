import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Modal, TextInput, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { getAuth, signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { router } from 'expo-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';
import { LinearGradient } from 'expo-linear-gradient';

const Profile = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserInfo(data);
            if (data.profileImage) {
              setProfileImageUrl(data.profileImage);
            }
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
        router.replace('/login');
      })
      .catch((error) => {
        console.error('Error signing out: ', error);
      });
  };

  // Password strength check (simple example)
  const isWeakPassword = (password: string) => password.length < 6;

  const handleChangePassword = async () => {
    setFormError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError('All fields are required.');
      return;
    }
    if (isWeakPassword(newPassword)) {
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
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      // Update password
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
        <Image source={require('../../assets/images/loading.gif')} style={styles.loadinggif}/>
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
      {/* Gradient Header */}
      <LinearGradient
        colors={['#205781', '#7AB2D3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      />
      {/* Profile Image in front */}
      <View style={styles.profileImageWrapper}>
        <Image
          source={
            // profileImageUrl && profileImageUrl !== ''
            //   ? { uri: profileImageUrl }: 
              require('../../assets/images/defaultUser.jpg')
          }
          style={styles.profileImage}
          onError={() => setProfileImageUrl('')}
        />
      </View>
      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name and Username */}
        <View style={styles.nameSection}>
          <ThemedText type="title" style={styles.nameText}>
            {userInfo.fname} {userInfo.mname} {userInfo.lname}
          </ThemedText>
          <ThemedText style={styles.usernameText}>@{userInfo.username}</ThemedText>
          <ThemedText style={styles.accountTypeText}>{accountType}</ThemedText>

          <TouchableOpacity
            style={styles.applyTourGuideBtn}
            onPress={() => router.push('/tourGuideApplication')}
            activeOpacity={0.85}
          >
            <ThemedText style={styles.applyTourGuideBtnText}>Apply as Tour Guide</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Options Section */}
        <ThemedView style={styles.options}>
          <Collapsible title="General Information" >
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
              Created: {userInfo.createdOn?.toDate().toLocaleString()}
            </ThemedText>
          </Collapsible>
          <Collapsible title="Privacy and Security">
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <ThemedText style={styles.collapsibleChild}>Change Password</ThemedText>
            </TouchableOpacity>
          </Collapsible>
        </ThemedView>
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

            <TextInput
              placeholder="Current Password"
              secureTextEntry
              style={[
                styles.loginInput,
                focusedInput === 'current' && styles.inputFocused
              ]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholderTextColor="#aaa"
              onFocus={() => setFocusedInput('current')}
              onBlur={() => setFocusedInput(null)}
            />

            <TextInput
              placeholder="New Password"
              secureTextEntry
              style={[
                styles.loginInput,
                focusedInput === 'new' && styles.inputFocused
              ]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#aaa"
              onFocus={() => setFocusedInput('new')}
              onBlur={() => setFocusedInput(null)}
            />

            <TextInput
              placeholder="Confirm Password"
              secureTextEntry
              style={[
                styles.loginInput,
                focusedInput === 'confirm' && styles.inputFocused
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#aaa"
              onFocus={() => setFocusedInput('confirm')}
              onBlur={() => setFocusedInput(null)}
            />

            {formError ? (
              <ThemedText style={{ color: '#d32f2f', backgroundColor: '#fdecea', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 14, textAlign: 'center', fontSize: 15 }}>
                {formError}
              </ThemedText>
            ) : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {/* Cancel Button (Outline) */}
              <TouchableOpacity
                style={[styles.gradientButton, styles.outlineButton]}
                onPress={() => {
                  setModalVisible(false);
                  setFormError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                activeOpacity={0.85}
              >
                <ThemedText style={styles.outlineButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.gradientButton} onPress={handleChangePassword} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#205781', '#7AB2D3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButtonBg}
                >
                  <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Submit</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Logout Button at the Bottom */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.gradientButton} onPress={handleLogout} activeOpacity={0.85}>
          <LinearGradient
            colors={['#205781', '#7AB2D3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButtonBg}
          >
            <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    color: '#222',
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
    backgroundColor: '#fff',
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
    color: '#222',
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 10,
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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    padding:20,
  },
  modalCardWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    height: '100%',
  },
  loginInput: {
    borderWidth: 0,
    backgroundColor: '#f1f3f6',
    padding: 14,
    borderRadius: 25,
    marginBottom: 16,
    fontSize: 16,
    color: '#222',
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#f1f3f6',
  },
  gradientButton: {
    flex: 1,
    marginHorizontal: 4,
    marginTop: 8,
    paddingLeft: 0,
    borderRadius: 25,
    overflow: 'hidden',
    minWidth: 180, // increased width for logout button
    maxWidth: 320,
  },
  gradientButtonBg: {
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#205781',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#205781',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  applyTourGuideBtn: {
    borderWidth: 2,
    borderColor: '#205781',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 28,
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  applyTourGuideBtnText: {
    color: '#205781',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default Profile;