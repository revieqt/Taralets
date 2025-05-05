import { StyleSheet, View, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { collection, getDocs, query, where, doc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '@/auth/firebaseConfig';
import { DataTable, Button, Dialog, Portal, Text, TextInput, Menu, Divider, Provider } from 'react-native-paper';

export default function TabTwoScreen() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [warnVisible, setWarnVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [durationMenuVisible, setDurationMenuVisible] = useState(false);
  const [reasonMenuVisible, setReasonMenuVisible] = useState(false);

  const [duration, setDuration] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  const durationOptions = {
    '1 day': 1,
    '3 days': 3,
    '1 week': 7,
    '2 weeks': 14,
    '1 month': 30,
    '1 year': 365
  };

  const reasonOptions = ['Unappropriate behaviour', 'Suspicious Activities', 'Others'];

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), where('type', '==', 'user'));
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const handleWarn = async () => {
    if (!duration || !reason || !message || !selectedUser) return;
    try {
      await addDoc(collection(db, 'warnings'), {
        userId: selectedUser.id,
        duration: durationOptions[duration],
        reason,
        message,
        createdAt: new Date()
      });
      setWarnVisible(false);
      setDuration('');
      setReason('');
      setMessage('');
    } catch (e) {
      Alert.alert('Error', 'Failed to issue warning');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteDoc(doc(db, 'users', selectedUser.id));
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setDeleteVisible(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  return (
    <Provider>
      <ThemedView style={styles.container}>
        <ThemedText type='title'>Users</ThemedText>

        <ThemedView style={styles.subContainer}>
          <ThemedText type='subtitle'>User List</ThemedText>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Username</DataTable.Title>
              <DataTable.Title>Email</DataTable.Title>
              <DataTable.Title>Contact</DataTable.Title>
              <DataTable.Title>Status</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>
            {users.map(user => (
              <DataTable.Row key={user.id}>
                <DataTable.Cell>{user.username}</DataTable.Cell>
                <DataTable.Cell>{user.email}</DataTable.Cell>
                <DataTable.Cell>{user.contactNumber}</DataTable.Cell>
                <DataTable.Cell>{user.status}</DataTable.Cell>
                <DataTable.Cell>
                  <Button onPress={() => { setSelectedUser(user); setWarnVisible(true); }}>Warn</Button>
                  <Button onPress={() => { setSelectedUser(user); setDeleteVisible(true); }}>Delete</Button>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </ThemedView>

        <ThemedView style={styles.subContainer}>
          <ThemedText type='subtitle'>Tour Guides</ThemedText>
          <ThemedText type='defaultSemiBold'>Tour Guide Applications</ThemedText>
        </ThemedView>

        <ThemedView style={styles.subContainer}>
          <ThemedText type='subtitle'>Reports</ThemedText>
          <ThemedText type='defaultSemiBold'></ThemedText>
        </ThemedView>
        <ThemedView style={styles.subContainer}>
          <ThemedText type='subtitle'>Warnings</ThemedText>
          <ThemedText type='defaultSemiBold'></ThemedText>
        </ThemedView>
        <ThemedView style={styles.subContainer}>
          <ThemedText type='subtitle'>Bans</ThemedText>
          <ThemedText type='defaultSemiBold'></ThemedText>
        </ThemedView>

        {/* Warn Dialog */}
        <Portal>
          <Dialog visible={warnVisible} onDismiss={() => setWarnVisible(false)}>
            <Dialog.Title>Warn User</Dialog.Title>
            <Dialog.Content>
              <View>
                <Button onPress={() => setDurationMenuVisible(true)}>{duration || 'Select Duration'}</Button>
                <Menu
                  visible={durationMenuVisible}
                  onDismiss={() => setDurationMenuVisible(false)}
                  anchor={<Text></Text>}
                >
                  {Object.keys(durationOptions).map((key) => (
                    <Menu.Item key={key} onPress={() => { setDuration(key); setDurationMenuVisible(false); }} title={key} />
                  ))}
                </Menu>
              </View>

              <View>
                <Button onPress={() => setReasonMenuVisible(true)}>{reason || 'Select Reason'}</Button>
                <Menu
                  visible={reasonMenuVisible}
                  onDismiss={() => setReasonMenuVisible(false)}
                  anchor={<Text></Text>}
                >
                  {reasonOptions.map((r) => (
                    <Menu.Item key={r} onPress={() => { setReason(r); setReasonMenuVisible(false); }} title={r} />
                  ))}
                </Menu>
              </View>

              <TextInput
                label="Message"
                value={message}
                onChangeText={setMessage}
                mode="outlined"
                multiline
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleWarn}>Confirm</Button>
              <Button onPress={() => setWarnVisible(false)}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {/* Delete Dialog */}
        <Portal>
          <Dialog visible={deleteVisible} onDismiss={() => setDeleteVisible(false)}>
            <Dialog.Title>Confirm Delete</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to delete this user?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={handleDelete}>Yes</Button>
              <Button onPress={() => setDeleteVisible(false)}>No</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ThemedView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  subContainer: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginBottom: 10,
  },
});
