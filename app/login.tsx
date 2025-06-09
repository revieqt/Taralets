import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig';
import { router } from 'expo-router';
import TextField from '@/components/TextField';
import PasswordField from '@/components/PasswordField';
import GradientButton from '@/components/GradientButton';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useSession } from '@/context/SessionContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { updateSession } = useSession();

  const handleLogin = async () => {
  setErrorMsg('');
  setLoading(true);
  if (!email || !password) {
    setErrorMsg('Please enter both email and password.');
    setLoading(false);
    return;
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) {
      setErrorMsg('User profile not found. Please contact support.');
      setLoading(false);
      return;
    }
    const userData = userDoc.data();

    const requiredFields = [
      'fname', 'lname', 'username', 'email', 'bdate', 'age', 'gender',
      'contactNumber', 'profileImage', 'status', 'type', 'createdOn'
    ];
    const missing = requiredFields.filter(field => userData[field] === undefined || userData[field] === null);
    if (missing.length > 0) {
      setErrorMsg('User profile is incomplete. Missing: ' + missing.join(', '));
      setLoading(false);
      return;
    }

    const userForSession = {
      id: userCredential.user.uid,
      fname: userData.fname,
      mname: userData.mname,
      lname: userData.lname,
      username: userData.username,
      email: email,
      bdate: userData.bdate?.toDate ? userData.bdate.toDate() : userData.bdate,
      age: userData.age,
      gender: userData.gender,
      contactNumber: userData.contactNumber,
      profileImage: userData.profileImage,
      status: userData.status,
      type: userData.type,
      createdOn: userData.createdOn?.toDate ? userData.createdOn.toDate() : userData.createdOn,
      groups: userData.groups || [], 
    };

    await updateSession({ user: userForSession });
    router.replace('/');
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      setErrorMsg('No account found with this email.');
    } else if (error.code === 'auth/wrong-password') {
      setErrorMsg('Incorrect password.');
    } else if (error.code === 'auth/invalid-email') {
      setErrorMsg('Invalid email address.');
    } else {
      setErrorMsg('Login failed. Please check your credentials.');
    }
  }
  setLoading(false);
};

  return (
    <ThemedView style={styles.background}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ThemedView style={styles.formContainer}>
          <ThemedText type='title'>Smart Plans,</ThemedText>
          <ThemedText style={{marginBottom: 30}}>Safer Journeys. Join TaraG!</ThemedText>

          {errorMsg ? (
          <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText>
          ) : null}

          <TextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
            isFocused={focusedInput === 'email'}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PasswordField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
            isFocused={focusedInput === 'password'}
          />

          <GradientButton
            title={loading ? 'Logging in...' : 'Login'}
            onPress={handleLogin}
            gradientColors={['#00FFDE', '#0065F8']}
          />

          <View style={styles.options}>
            <ThemedText>or</ThemedText>
              <TouchableOpacity
                onPress={() => router.push('/register')}>
                <ThemedView style={styles.circularButton} type='primary'>
                  <Image
                    source={require('../assets/icons/google.png')}
                    style={{ width: 30, height: 30 }}
                  />
                </ThemedView>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/register')}
                style={{ marginVertical: 20 }}>
                <ThemedText>Dont have an account yet? Register</ThemedText>
              </TouchableOpacity>
            </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
  },
  formContainer: {
    marginTop: 150,
  },
  errorMsg: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  options: {
    alignItems: 'center',
    marginTop: 17,
  },
  circularButton: {
  width: 60,
  height: 60,
  marginTop: 10,
  marginBottom: 50,
  borderRadius: 30,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
  
});