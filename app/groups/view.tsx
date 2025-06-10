import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import TabChooser from '@/components/TabChooser';
import { getGroupMembers } from '@/services/firestore/groupDbService';

type ViewGroupProps = {
  visible: boolean;
  onClose: () => void;
  group?: any;
};

const screenHeight = Dimensions.get('window').height;

export default function ViewGroupModal({ visible, onClose, group }: ViewGroupProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
  if (activeTab === 1 && group?.id) {
    setLoadingMembers(true);
    console.log('Fetching members for group:', group.id);
    getGroupMembers(group.id)
      .then((data) => {
        console.log('Fetched members:', data);
        setMembers(data);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoadingMembers(false));
  }
}, [activeTab, group?.id]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <ThemedView style={styles.overlay}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={onClose}>
            <View style={styles.backButton}>
              <View style={styles.backIcon}><AntDesign name="left" size={15} color="white" /></View>
              
              <Text style={{marginRight: 10, color: 'white'}}>Back</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.content}>
            <ThemedText type="title">{group?.name || 'Group Info'}</ThemedText>
            <ThemedText type='default'>Invite Code: {group?.inviteCode}</ThemedText>

            <TabChooser
              tabs={['Itinerary', 'Members', 'Chat']}
              onTabChange={setActiveTab}
              containerStyle={{ marginTop: 20, marginBottom: 10 }}
            />

            {activeTab === 0 && (
              <>
                <ThemedText type='defaultSemiBold' style={{ marginTop: 10, height: 500 }}>
                  Itinerary
                </ThemedText>
              </>
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
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
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
  backIcon:{
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
    marginTop: screenHeight / 2,
    maxWidth: 400,
    padding: 20,
    paddingTop: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: screenHeight / 2,
  },
});