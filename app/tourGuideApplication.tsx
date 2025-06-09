import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TextField from '@/components/TextField';
import GradientButton from '@/components/GradientButton';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../services/firestore/config'; // Adjust the import path as necessary
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function TourGuideApplication() {
  const [address, setAddress] = useState('');
  const [certification, setCertification] = useState('');
  const [experience, setExperience] = useState('');
  const [languages, setLanguages] = useState('');
  const [region, setRegion] = useState('');
  const [license, setLicense] = useState('');
  const [socials, setSocials] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const auth = getAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!address || !certification || !experience || !languages || !region || !license || !socials) {
      setErrorMsg('All fields are required.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        setErrorMsg('User not authenticated.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'applications'), {
        userID: user.uid, // Include the user ID
        address,
        certification,
        experience,
        languages,
        region,
        license,
        socials,
        status: 'Pending',
        submittedOn: Timestamp.now(),
      });

      Alert.alert('Application Sent', 'Your application is waiting for administrator approval.');
      setAddress('');
      setCertification('');
      setExperience('');
      setLanguages('');
      setRegion('');
      setLicense('');
      setSocials('');
      router.push('/(tabs)/profile'); // Navigate back to the profile page
    } catch (error) {
      setErrorMsg('Failed to submit application. Please try again.');
    }

    setLoading(false);
  };

  return (
    <ThemedView style={styles.background}>
      <LinearGradient
        colors={['#205781', '#7AB2D3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Tour Guide Application
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Fill out the form to apply as a tour guide.
        </ThemedText>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={{ width: '100%' }}
          contentContainerStyle={{ alignItems: 'center', paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >
          {errorMsg ? (
            <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText>
          ) : null}

          <TextField
            placeholder="Address"
            value={address}
            onChangeText={setAddress}
          />

          <TextField
            placeholder="Tour Guide Certification"
            value={certification}
            onChangeText={setCertification}
          />

          <TextField
            placeholder="Years of Experience"
            value={experience}
            onChangeText={setExperience}
            keyboardType="numeric"
          />

          <TextField
            placeholder="Languages Spoken"
            value={languages}
            onChangeText={setLanguages}
          />

          <TextField
            placeholder="Tour Region"
            value={region}
            onChangeText={setRegion}
          />

          <TextField
            placeholder="License Number"
            value={license}
            onChangeText={setLicense}
          />

          <TextField
            placeholder="Social Media Links"
            value={socials}
            onChangeText={setSocials}
          />

          <GradientButton
            title={loading ? 'Submitting...' : 'Submit Application'}
            onPress={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  header: {
    width: '100%',
    height: 160,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 65,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#f1f3f6',
    marginTop: 3,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  errorMsg: {
    color: '#d32f2f',
    backgroundColor: '#fdecea',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    textAlign: 'center',
    fontSize: 15,
  },
});