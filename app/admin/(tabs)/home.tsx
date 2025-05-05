import { Image, StyleSheet, Platform, View, TouchableOpacity } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import VerticalRule from '@/components/VerticalRule';
import { Octicons, MaterialIcons, MaterialCommunityIcons} from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <ThemedView style={styles.container}>
        <ThemedText type='title'>Home</ThemedText>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    padding: 20,
  },
  menuContainer:{
    width: '100%',
    height: 80,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
  },
  menuButton:{
    width: '28%',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    gap: 5,
  },
  verticalRule: {
    alignSelf: 'center',
  }
});
