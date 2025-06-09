import { StyleSheet, Image, Platform, View, ScrollView, TouchableOpacity, Text, Modal, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TabChooser from '@/components/TabChooser';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import JoinGroupModal from '../groups/join';
import ViewGroupModal from '../groups/view';
import { useRouter } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { getGroupById } from '@/services/firestore/groupDbService';

export default function GroupScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const [fabOpen, setFabOpen] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const smallFabAnim = useRef(new Animated.Value(0)).current;
  const { session } = useSession();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  useEffect(() => {
    if (fabOpen) {
      Animated.spring(smallFabAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 7,
      }).start();
    } else {
      Animated.spring(smallFabAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
      }).start();
    }
  }, [fabOpen]);

  useEffect(() => {
  if (activeTab !== 1) return;
  setLoadingGroups(true);
  console.log('session.user.groups:', session?.user?.groups); // <-- Add this line
  try {
    const groupIds = session?.user?.groups || [];
    const groupPromises = groupIds.map((id) => getGroupById(id));
    Promise.all(groupPromises)
      .then((groups) => setUserGroups(groups.filter(Boolean)))
      .catch(() => setUserGroups([]))
      .finally(() => setLoadingGroups(false));
  } catch (e) {
    setUserGroups([]);
    setLoadingGroups(false);
  }
}, [activeTab, session?.user?.groups]);

  // The vertical distance the small FAB will travel up
  const SMALL_FAB_DISTANCE = 70;

  return (
    <ThemedView style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 20 : 50, padding: 20 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <ThemedText type='title'>Groups</ThemedText>
          <TouchableOpacity style={{ justifyContent:'center', alignItems: 'center' }} onPress={() => router.push('/groups/chat')}>
            <AntDesign name="message1" size={20} color="black" />
          </TouchableOpacity>
        </View>
        
        <TabChooser
          tabs={['Tours', 'Your Groups']}
          onTabChange={setActiveTab}
          containerStyle={{ marginTop: 20, marginBottom: 10 }}
        />

        {activeTab === 0 && (
          <>
            <ThemedText type='defaultSemiBold' style={{ marginTop: 10 }}>
              Recommended for you
            </ThemedText>
            <View style={styles.recommendedContainer}>
              {/* Tours content goes here */}
            </View>
          </>
        )}

        {activeTab === 1 && (
          <>
              {loadingGroups ? (
                <ThemedText>Loading...</ThemedText>
              ) : userGroups.length === 0 ? (
                <ThemedText>No groups found. {session?.user?.groups}</ThemedText>
              ) : (
                userGroups.map((group, idx) => (
                  <TouchableOpacity
                    key={group?.inviteCode || idx}
                    style={styles.groupItem}
                    onPress={() => {
                      setSelectedGroup(group);
                      setViewModalVisible(true);
                    }}
                  >
                    <ThemedText type="default">{group?.name || 'Unnamed Group'}</ThemedText>
                    <ThemedText type="default" style={{ fontSize: 12, color: '#888' }}>
                      Invite Code: {group?.inviteCode}
                    </ThemedText>
                  </TouchableOpacity>
))
              )}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button and Modal */}
      <Modal
        visible={fabOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFabOpen(false)}
      >
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={() => setFabOpen(false)}>
          <View style={styles.fabModalContainer}>
            {/* Animated Small FAB */}
            <Animated.View
              style={[
                styles.fabRow,
                {
                  bottom: 75,
                  right: 10,
                  opacity: smallFabAnim,
                  transform: [
                    {
                      translateY: smallFabAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -SMALL_FAB_DISTANCE],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.fabLabel}>Join with Invite code</Text>
              <TouchableOpacity style={styles.smallFab}
                onPress={() => {
                    setFabOpen(false);
                    setJoinModalVisible(true);
                  }}>
                <MaterialIcons name="input" size={22} color="#00FFDE" />
              </TouchableOpacity>
            </Animated.View>
            {/* Main FAB */}
            <View style={styles.fabRow}>11
              <Text style={styles.fabLabel}>Create Group</Text>
              <TouchableOpacity style={styles.fabMain} onPress={() => {
                    setFabOpen(false);
                    router.push('/groups/create');
                  }}> 
                <MaterialIcons name="add" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setFabOpen(true)}>
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <JoinGroupModal
        visible={joinModalVisible}
        onClose={() => setJoinModalVisible(false)}
      />

      <ViewGroupModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        group={selectedGroup}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendedContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginTop: 10,
  },
  searchContainer: {
    marginTop: 20,
    width: '100%',
    borderColor: '#cccccc',
    borderWidth: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#00FFDE',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  fabModalContainer: {
    marginRight: 20,
    alignItems: 'flex-end',
    position: 'relative',
    minHeight: 130,
    minWidth: 180,
  },
  fabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
  },
  smallFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00FFDE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabLabel: {
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
    fontWeight: 'bold',
  },
  groupItem: {
    padding: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    backgroundColor: '#fffff',
  },
});