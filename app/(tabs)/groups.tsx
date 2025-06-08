import { StyleSheet, Image, Platform, View } from 'react-native';
import { useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TabChooser from '@/components/TabChooser';
import TextField from '@/components/TextField';

export default function GroupScreen() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <ThemedView style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 20 : 50, padding: 20 }}>
      <ThemedText type='title'>Groups</ThemedText>

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
          <ThemedText type='defaultSemiBold' style={{ marginTop: 10 }}>
            Your Groups
          </ThemedText>
          <View style={styles.recommendedContainer}>
            {/* Your Groups content goes here */}
          </View>
        </>
      )}

      <View style={styles.searchContainer}>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
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
});