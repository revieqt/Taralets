import { StyleSheet, Image, Platform, View, ScrollView, TouchableOpacity } from 'react-native';
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
import { getUserChats } from '@/services/firestore/chatDbService';
import ChatModal from '../groups/chat';
import FabMenu from '@/components/FabMenu';

export default function GroupScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const { session } = useSession();
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [userChats, setUserChats] = useState<any[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const handleCloseViewModal = () => {
    setViewModalVisible(false);
    setSelectedGroup(null);
  };

  useEffect(() => {
    if (activeTab !== 1) return;
    setLoadingGroups(true);
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

  useEffect(() => {
    if (activeTab !== 2 || !session?.user?.id) return;
    setLoadingChats(true);

    getUserChats(session.user.id)
      .then((chats) => setUserChats(chats))
      .catch(() => setUserChats([]))
      .finally(() => setLoadingChats(false));
  }, [activeTab, session?.user?.id]);

  return (
    <ThemedView style={{ flex: 1 }}>
      {activeTab === 0 && (
        <>
          <View style={styles.recommendedContainer}></View>
        </>
      )}

      <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 20 : 50, padding: 20 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <ThemedText type='title' style={{ color: activeTab === 0 ? '#fff' : undefined }}>Groups</ThemedText>
          <TabChooser
            tabs={['Tours', 'Your Groups', 'Chats']}
            onTabChange={setActiveTab}
            containerStyle={{ marginTop: 20, marginBottom: 10 }}
            activeButtonStyle={activeTab === 0 ? { backgroundColor: 'rgba(255,255,255,0.3)', borderColor: '#fff' } : undefined}
            activeTextStyle={activeTab === 0 ? { color: '#fff' } : undefined}
            buttonStyle={activeTab === 0 ? { borderColor: '#fff' } : undefined}
            textStyle={activeTab === 0 ? { color: '#fff' } : undefined}
          />

          {activeTab === 0 && (
            <>
              <ThemedView style={styles.tourContent}>
                <View style={styles.searchContainer}></View>
              </ThemedView>
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

          {activeTab === 2 && (
            <>
              {loadingChats ? (
                <ThemedText>Loading chats...</ThemedText>
              ) : userChats.length === 0 ? (
                <ThemedText>No chats found.</ThemedText>
              ) : (
                userChats.map((chat, idx) => (
                  <TouchableOpacity
                    key={chat?.id || idx}
                    style={styles.groupItem}
                    onPress={() => {
                      setActiveChatId(chat.id);
                      setChatModalVisible(true);
                    }}
                  >
                    <ThemedText type="default">{chat?.name || 'Unnamed Chat'}</ThemedText>
                    <ThemedText type="default" style={{ fontSize: 12, color: '#888' }}>
                      Last message: {chat?.lastMessage?.text || 'No messages yet'}
                    </ThemedText>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}
        </ScrollView>

        {/* FabMenu replaces the old FAB logic */}
        <FabMenu
          mainLabel="Create Group"
          mainIcon={<MaterialIcons name="add" size={32} color="#fff" />}
          mainOnPress={() => router.push('/groups/create')}
          actions={[
            {
              label: 'Join with Invite code',
              icon: <MaterialIcons name="input" size={20} color="#00FFDE" />,
              onPress: () => setJoinModalVisible(true),
            },
            {
              label: 'Send New Message',
              icon: <AntDesign name="mail" size={20} color="#00FFDE" />,
              onPress: () => setJoinModalVisible(true),
            },
          ]}
        />

        <JoinGroupModal
          visible={joinModalVisible}
          onClose={() => setJoinModalVisible(false)}
        />

        <ViewGroupModal
          visible={viewModalVisible}
          group={selectedGroup}
          onClose={handleCloseViewModal}
        />

        <ChatModal  
          visible={chatModalVisible}
          chatId={activeChatId || ''}
          onClose={() => setChatModalVisible(false)}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  recommendedContainer: {
    width: '100%',
    height: 400,
    borderRadius: 16,
    backgroundColor: '#ccc',
    position: 'absolute',
    zIndex: -50,
  },
  tourContent: {
    marginTop: 240,
    width: '100%',
    height: 100,
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
  groupItem: {
    padding: 16,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    backgroundColor: '#fffff',
  },
});