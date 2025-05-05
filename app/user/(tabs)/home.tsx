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
    <ParallaxScrollView>

      <View style={styles.menuContainer}>
      <TouchableOpacity onPress={() => router.push('user/routes')} style={styles.menuButton}>
        <MaterialIcons name="route" size={24} color="black" />
        <ThemedText>Routes</ThemedText>
      </TouchableOpacity>
      
      <View style={styles.verticalRule}>
        <VerticalRule height="50%" color="#aaa" thickness={1}/>
      </View>
      
      <TouchableOpacity onPress={() => router.push('user/itineraries')} style={styles.menuButton}>
        <Octicons name="paper-airplane" size={24} color="black" />
        <ThemedText>Itineraries</ThemedText>
      </TouchableOpacity>
      
      <View style={styles.verticalRule}>
        <VerticalRule height="50%" color="#aaa" thickness={1}/>
      </View>

      <TouchableOpacity onPress={() => router.push('user/weather')} style={styles.menuButton}>
        <MaterialCommunityIcons name="weather-sunset" size={24} color="black" />
        <ThemedText>Weather</ThemedText>
      </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
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
