import { StyleSheet, Image, Platform, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome6 } from '@expo/vector-icons';
import SOSButton from '@/components/SOSButton';

export default function EmergencyScreen() {
  return (
    <ThemedView style={Platform.OS === 'ios' ? {padding: 16, paddingTop: 0, alignItems:'center'} : {padding: 16, paddingTop: 25 ,alignItems:'center'}}>
      <ThemedView type='secondary' style={styles.mapContainer}>
        {/* map chuchu diri */}
      </ThemedView>
      <SOSButton style={styles.emergencyButton}>
        <FontAwesome6 name='exclamation' size={50} color='#ccc' />
      </SOSButton>
      <ThemedText type='subtitle'>
        Click to be on Emergency State!
      </ThemedText>
      <ThemedText>
        You are currently in
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 250,
    borderRadius: 16,
  },
  emergencyButton: {
    width: 120,
    height: 120,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
    marginBottom: 10,
  },
});
