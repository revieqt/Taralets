import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { ThemedIcons } from '@/components/ThemedIcons';

export interface KebabAction {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

interface KebabMenuProps {
  actions: KebabAction[];
}

const KebabMenu: React.FC<KebabMenuProps> = ({ actions }) => {
  const [visible, setVisible] = useState(false);

  const handlePress = (action: KebabAction) => {
    setVisible(false);
    action.onPress();
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)} style={styles.kebabButton}>
        <ThemedIcons library='MaterialIcons' name="more-vert" size={24}/>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={styles.menu}>
            {actions.map((action, index) => (
              <Pressable key={index} style={styles.menuItem} onPress={() => handlePress(action)}>
                <View style={styles.icon}>{action.icon}</View>
                <Text style={styles.label}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  kebabButton: {
    padding: 8,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menu: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});

export default KebabMenu;
