import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import TextField from '@/components/TextField';
import GradientButton from '@/components/GradientButton';
import { useSession } from '@/context/SessionContext';
import { joinGroupByInviteCodeWithUser } from '@/services/firestore/groupDbService';

type JoinGroupModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function JoinGroupModal({ visible, onClose }: JoinGroupModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { session, updateSession } = useSession();

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code.');
      return;
    }
    if (!session?.user?.id) {
      Alert.alert('Error', 'No user session found.');
      return;
    }
    setLoading(true);
    const result = await joinGroupByInviteCodeWithUser(inviteCode.trim(), session.user.id, updateSession);
    setLoading(false);
    Alert.alert(result.success ? 'Success' : 'Error', result.message, [
      { text: 'OK', onPress: () => result.success && onClose() },
    ]);
    if (result.success) setInviteCode('');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <ThemedView style={styles.overlay}>
        <TouchableOpacity onPress={onClose} style={styles.floatingCloseButton}>
          <MaterialIcons name="close" size={28} color="#333" />
        </TouchableOpacity>

        <View style={styles.centeredView}>
          <ThemedText type="title">Join Group</ThemedText>
          <ThemedText type='default'>Input invite code to join another group.</ThemedText>
          
          <TextField
              placeholder="Enter invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
              style={{ marginBottom: 20 }}
            />

          <GradientButton
            title={loading ? "Joining..." : "Join Group"}
            onPress={handleJoin}
            buttonStyle={{ marginTop: 8 }}
            disabled={loading}
          />
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  floatingCloseButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 100,
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    borderColor: '#333',
    borderWidth: 1,
  },
  centeredView: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 20,
  },
});