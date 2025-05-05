// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert , StyleSheet} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../auth/firebaseConfig'; // Adjust the import based on your project structure
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/index'); // go to home screen after login
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      
      <ThemedView style={styles.header}>
        <ThemedText type='title'>
          Welcome Back!
        </ThemedText>
        <ThemedText>Login to effectively plan your next travels!</ThemedText>
      </ThemedView>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <ThemedText style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Login</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 20 }}>
        <ThemedText style={{ color: '#007bff' }}>Don't have an account? Register</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
  },  
  header: {
    gap: 5,
    marginBottom: 20,
  },
});