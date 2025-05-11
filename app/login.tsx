import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/');
    } catch (error: any) {
      // Firebase error codes: https://firebase.google.com/docs/reference/js/auth#autherrorcodes
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
        <View style={styles.cardWrapper}>
          <Image
            source={require('../assets/images/tara.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
          <ThemedView style={styles.card}>
            <ThemedText type='title' style={styles.title}>
              Welcome to TaraG!
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Login to effectively plan your next travels!
            </ThemedText>

            {errorMsg ? (
              <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText>
            ) : null}

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              placeholderTextColor="#aaa"
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholderTextColor="#aaa"
            />

            <TouchableOpacity
                onPress={handleLogin}
                style={{ borderRadius: 25, marginTop: 6, marginBottom: 10 }}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#205781', '#7AB2D3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <ThemedText style={styles.buttonText}>
                    {loading ? 'Logging in...' : 'Login'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerLink}>
              <ThemedText style={styles.registerText}>
                Don't have an account? <ThemedText style={{ textDecorationLine: 'underline' }}>Register</ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
  },
  mascot: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: -50,
    zIndex: 2,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    alignSelf: 'center',
    alignItems: 'stretch',
  },
  title: {
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
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
  input: {
    borderWidth: 0,
    backgroundColor: '#f1f3f6',
    padding: 14,
    borderRadius: 25,
    marginBottom: 16,
    fontSize: 16,
    color: '#222',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 6,
    marginBottom: 10,
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
    marginTop: 6,
    alignItems: 'center',
  },
  registerText: {
    color: '#007bff',
    fontSize: 15,
  },
});