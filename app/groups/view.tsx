import React, { useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import TabChooser from '@/components/TabChooser';

type ViewGroupProps = {
  visible: boolean;
  onClose: () => void;
  group?: any;
};

export default function ViewGroupModal({ visible, onClose, group }: ViewGroupProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <ThemedView style={styles.overlay}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <MaterialIcons name="close" size={28} color="#333"/>
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
                  Recommended for you
                </ThemedText>
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
    borderColor: '#333',
    borderWidth: 1,
  },
  content: {
    width: '100%',
    marginTop: 250,
    maxWidth: 400,
    padding: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});