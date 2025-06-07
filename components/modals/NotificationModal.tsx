import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';

type NotificationModalProps = {
  visible: boolean;
  onClose: () => void;
};

const { width } = Dimensions.get('window');

export default function NotificationModal({ visible, onClose }: NotificationModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Popover container */}
        <View style={styles.popoverContainer}>
          {/* Soft arrow */}
          <View style={styles.softArrowContainer}>
            <View style={styles.softArrow} />
          </View>
          <ThemedView style={styles.modalContainer}>
            <View style={styles.header}>
              <ThemedText type="title">Notifications</ThemedText>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.content}>
              <ThemedText style={{ color: '#888', textAlign: 'center' }}>
                No notifications yet.
              </ThemedText>
            </View>
          </ThemedView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(30,30,30,0.15)',
  },
  popoverContainer: {
    position: 'absolute',
    top: 70, // Adjust to match your header height + bell position
    left: 0,
    width: width,
    alignItems: 'flex-end',
    zIndex: 100,
    margin: 16, // Adjust to align with bell
  },
  softArrowContainer: {
    width: width,
    alignItems: 'flex-end',
    paddingRight: 32, // Adjust to align with bell
  },
  softArrow: {
    width: 36,
    height: 18,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    alignSelf: 'flex-end',
    marginRight: 0,
    marginBottom: -8,
    // shadow for arrow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  modalContainer: {
    width: width,
    minHeight: 220,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
});