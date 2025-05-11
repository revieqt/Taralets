import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Application() {
 

  return (
    <ThemedView style={styles.background}>
      <ThemedText>Application form irid hahahaha</ThemedText>
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
    paddingTop: 60, // Add extra top padding for mascot
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