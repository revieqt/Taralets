import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebaseConfig';
import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore (excluding birthdate)
      await setDoc(doc(db, 'users', user.uid), {
        username,
        contactNumber,
        email,
        type: 'user',
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Account created!');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <ThemedView style={styles.header}>
        <ThemedText type='title'>
            Create an Account
        </ThemedText>
        <ThemedText>Fill-up the form and join our growing community!</ThemedText>
      </ThemedView>
      

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Contact Number"
        value={contactNumber}
        onChangeText={setContactNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />

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

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 20 }}>
        <Text style={{color: '#007bff' }}>Already have an account? Login</Text>
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
