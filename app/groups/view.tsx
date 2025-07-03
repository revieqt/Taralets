import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Text, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AntDesign } from '@expo/vector-icons';
import TabChooser from '@/components/TabChooser';
import { getGroupMembers } from '@/services/firestore/groupDbService';
import ChatModal from '../groups/chat';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

interface ViewGroupModalProps {
  visible: boolean;
  group: any;
  onClose: () => void;
}

export default function ViewGroupModal({ visible, group, onClose }: ViewGroupModalProps) {
  if (!visible || !group) return null;
  const router = useRouter();

  const groupId = group?.id;
  const groupName = group?.name;
  const inviteCode = group?.inviteCode;

  const [activeTab, setActiveTab] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [activeChatId, setActiveChatId] = useState('');

  useEffect(() => {
    if (activeTab === 1 && groupId) {
      setLoadingMembers(true);
      getGroupMembers(groupId as string)
        .then((data) => {
          setMembers(data);
        })
        .catch(() => {
          setMembers([]);
        })
        .finally(() => setLoadingMembers(false));
    }
  }, [activeTab, groupId]);

  useEffect(() => {
    if (activeTab === 2 && groupId) {
      const timeout = setTimeout(() => {
        setActiveChatId(groupId as string);
        setChatModalVisible(true);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [activeTab, groupId]);

  // Overlay modal for full screen
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={onClose}>
              <View style={styles.backButton}>
                <View style={styles.backIcon}>
                  <AntDesign name="left" size={15} color="white" />
                </View>
                <Text style={{ marginRight: 10, color: 'white' }}>Back</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.content}>
              <ThemedText type="title">{groupName || 'Group Info'}</ThemedText>
              <ThemedText type='default'>Invite Code: {inviteCode}</ThemedText>

              <TabChooser
                tabs={['Itinerary', 'Members', 'Chat']}
                onTabChange={setActiveTab}
                containerStyle={{ marginTop: 20, marginBottom: 10 }}
              />

              {activeTab === 0 && (
                <ThemedText type='defaultSemiBold' style={{ marginTop: 10, height: 500 }}>
                  Itinerary
                </ThemedText>
              )}

              {activeTab === 1 && (
                <>
                  <ThemedText type='defaultSemiBold' style={{ marginTop: 10 }}>
                    Members
                  </ThemedText>
                  {loadingMembers ? (
                    <ThemedText style={{ marginTop: 10 }}>Loading members...</ThemedText>
                  ) : members.length === 0 ? (
                    <ThemedText style={{ marginTop: 10 }}>No members found.</ThemedText>
                  ) : (
                    members.map((member, idx) => (
                      <View key={member.id || idx} style={{ marginTop: 10, marginBottom: 6 }}>
                        <ThemedText type="default">{member.fname} {member.lname}</ThemedText>
                        <ThemedText type="default" style={{ fontSize: 12, color: '#888' }}>
                          {member.email}
                        </ThemedText>
                      </View>
                    ))
                  )}
                </>
              )}
            </View>
          </ScrollView>

          <ChatModal
            chatId={activeChatId}
            visible={chatModalVisible}
            onClose={() => setChatModalVisible(false)}
          />
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 100,
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    borderWidth: 1,
  },
  backIcon: {
    justifyContent: 'center',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 25,
    width: 25,
    height: 25,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    marginTop: screenHeight / 8,
    maxWidth: 400,
    padding: 20,
    paddingTop: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: screenHeight / 2,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
});