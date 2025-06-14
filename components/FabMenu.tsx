import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Modal, Animated, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

type FabMenuButton = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

type FabMenuProps = {
  mainLabel: string;
  mainIcon?: React.ReactNode;
  mainOnPress: () => void;
  actions?: FabMenuButton[];
  style?: ViewStyle;
};

export default function FabMenu({
  mainLabel,
  mainIcon,
  mainOnPress,
  actions = [],
  style,
}: FabMenuProps) {
  const [fabOpen, setFabOpen] = useState(false);
  const anims = useRef(actions.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (fabOpen) {
      Animated.stagger(
        60,
        anims.map(anim =>
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 7,
          })
        )
      ).start();
    } else {
      Animated.stagger(
        40,
        anims.map(anim =>
          Animated.spring(anim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 7,
          })
        ).reverse()
      ).start();
    }
  }, [fabOpen, anims]);

  const SMALL_FAB_DISTANCE = 70;

  return (
    <>
      <Modal
        visible={fabOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFabOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackground}
          activeOpacity={1}
          onPress={() => setFabOpen(false)}
        >
          <View style={styles.fabModalContainer}>
            {actions.map((action, idx) => (
              <Animated.View
                key={action.label}
                style={[
                  styles.fabRow,
                  {
                    bottom: 90, // Fixed for all
                    right: 10,
                    opacity: anims[idx],
                    transform: [
                      {
                        translateY: anims[idx].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -SMALL_FAB_DISTANCE * (idx + 1)],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.fabLabel}>{action.label}</Text>
                <TouchableOpacity
                  style={styles.smallFab}
                  onPress={() => {
                    setFabOpen(false);
                    action.onPress();
                  }}
                >
                  {action.icon}
                </TouchableOpacity>
              </Animated.View>
            ))}
            {/* Main FAB */}
            <View style={styles.fabRow}>
              <Text style={styles.fabLabel}>{mainLabel}</Text>
              <TouchableOpacity
                style={styles.fabMain}
                onPress={() => {
                  setFabOpen(false);
                  mainOnPress();
                }}
              >
                {mainIcon ?? <MaterialIcons name="add" size={32} color="#fff" />}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
      <TouchableOpacity style={[styles.fab, style]} onPress={() => setFabOpen(true)}>
        {mainIcon ?? <MaterialIcons name="add" size={32} color="#fff" />}
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
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
});