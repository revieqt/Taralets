import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import TextField from '@/components/TextField';
import PasswordField from '@/components/PasswordField';
import OutlineButton from '@/components/OutlineButton';
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
        <Image
          source={require('../assets/images/tara.png')}
          style={styles.mascot}
          resizeMode="contain"
        />
        <ThemedText type="title" style={styles.title}>
          Welcome to TaraG!
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Login to effectively plan your next travels!
        </ThemedText>

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
          gradientColors={['#205781', '#7AB2D3']}
        />

        <ThemedText style={{padding:20}}>----- or -----</ThemedText>

        <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerLink}>
          <ThemedText style={styles.registerText}>
            Don't have an account? <ThemedText style={{ textDecorationLine: 'underline' }}>Register</ThemedText>
          </ThemedText>
        </TouchableOpacity>
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
    maxWidth: 380,
    alignItems: 'center',
  },
  mascot: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 28,
    textAlign: 'center',
  },
  errorMsg: {
    color: '#d32f2f',
    backgroundColor: '#fdecea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    textAlign: 'center',
    fontSize: 15,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#007bff',
    fontSize: 15,
  },
});