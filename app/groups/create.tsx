import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TextField from '@/components/TextField';
import GradientButton from '@/components/GradientButton';
import { createGroup } from '@/services/firestore/groupDbService';
import { useSession } from '@/context/SessionContext';

export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { session } = useSession?.() || {};

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a group name.');
      return;
    }
    setLoading(true);
    try {
      await createGroup({
        admin: session?.user?.id || 'admin', // Replace with actual user id if available
        members: [session?.user?.id || 'admin'],
        // itinerary: '', // Add if needed
        name: name,
      });
      Alert.alert('Success', 'Group created successfully!');
      setName('');
      // Optionally navigate or reset form here
    } catch (e) {
      Alert.alert('Error', 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: 24 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ThemedText type="title" style={{ marginBottom: 24 }}>
          Create Group
        </ThemedText>
        <View style={styles.form}>
          <TextField
            placeholder="Group Name"
            value={name}
            onChangeText={setName}
            style={{ marginBottom: 20 }}
          />
          <GradientButton
            title={loading ? 'Creating...' : 'Create Group'}
            onPress={handleCreateGroup}
            buttonStyle={{ marginTop: 8 }}
            disabled={loading}
            loading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '100%',
    marginTop: 12,
  },
});