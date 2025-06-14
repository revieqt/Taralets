import React, { useState } from 'react';
import { StyleSheet, Platform, TouchableOpacity, View, Switch, TextInput } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from "expo-router";

export default function RoutesSettings() {
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [reminderDistance, setReminderDistance] = useState('100');

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.titleContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <AntDesign size={24} name="left" color={"#cccccc"} />
        </TouchableOpacity>
        <ThemedText type='subtitle'>Settings</ThemedText>
      </ThemedView>

      {/* Push Notification Toggle */}
      <View style={styles.settingItem}>
        <ThemedText type='default'>Remind me when nearing stop</ThemedText>
        <Switch
          value={isPushEnabled}
          onValueChange={setIsPushEnabled}
        />
      </View>

      {/* Distance input shown only if enabled */}
      {isPushEnabled && (
        <View style={styles.inputContainer}>
          <ThemedText type='default'>Alert me when I'm within (meters):</ThemedText>
          <TextInput
            style={styles.textInput}
            keyboardType="numeric"
            value={reminderDistance}
            onChangeText={setReminderDistance}
            placeholder="e.g. 100"
          />
        </View>
      )}

      {/* TaraVoice Toggle */}
      <View style={styles.settingItem}>
        <ThemedText type='default'>Enable TaraVoice for directions</ThemedText>
        <Switch
          value={isVoiceEnabled}
          onValueChange={setIsVoiceEnabled}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    marginTop: 20,
  },
  inputContainer: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  textInput: {
    marginTop: 5,
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
    backgroundColor: '#fff',
  },
});
