import React, { useRef,useState } from 'react';
import { TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, Image, View, ScrollView, Pressable } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../auth/firebaseConfig';
import { router } from 'expo-router';
import { doc, setDoc, Timestamp, getDocs, collection, query, where } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';

const defaultProfileImage = '../../../assets/images/defaultUser.jpg';

function calculateAge(birthdate: Date) {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const m = today.getMonth() - birthdate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
}

export default function RegisterScreen() {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [mname, setMname] = useState('');
  const [bdate, setBdate] = useState<Date | null>(null);
  const [gender, setGender] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const handleRegister = async () => {
    setErrorMsg('');
    // Validation
    if (
      !fname ||
      !lname ||
      !bdate ||
      !gender ||
      !contactNumber ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setErrorMsg('Required fields must not be empty.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setLoading(true);

    // Check if username already exists
    try {
      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setErrorMsg('Username already in use.');
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        setLoading(false);
        return;
      }
    } catch (e) {
      setErrorMsg('Error checking username. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const age = calculateAge(bdate as Date);
      await setDoc(doc(db, 'users', user.uid), {
        fname,
        lname,
        mname: mname || '',
        bdate: Timestamp.fromDate(bdate as Date),
        age,
        gender,
        contactNumber,
        username,
        email,
        status: 'Active',
        profileImage: defaultProfileImage,
        type: 'user',
        createdOn: Timestamp.now(),
      });
      Alert.alert('Success', 'Account created!');
      router.replace('/login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('Email is already in use.');
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Invalid email address.');
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      } else {
        setErrorMsg(error.message || 'Registration failed.');
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }
    }
    setLoading(false);
  };

  return (
    <ThemedView style={styles.background}>
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
          <View style={styles.cardWrapper}>
            <Image
              source={require('../assets/images/tara.png')}
              style={styles.mascot}
              resizeMode="contain"
            />
            <ThemedView style={styles.card}>
              <ThemedText type='title' style={styles.title}>
                Create an Account
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Fill-up the form and join our growing community!
              </ThemedText>

              {/* Error Message */}
              {errorMsg ? (
                <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText>
              ) : null}

              <TextInput
                placeholder="First Name"
                value={fname}
                onChangeText={setFname}
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor="#aaa"
              />

              <TextInput
                placeholder="Last Name"
                value={lname}
                onChangeText={setLname}
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor="#aaa"
              />

              <TextInput
                placeholder="Middle Name (optional)"
                value={mname}
                onChangeText={setMname}
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor="#aaa"
              />

              {/* Birthdate Picker */}
              <Pressable onPress={() => setShowDatePicker(true)}>
                <View pointerEvents="none">
                  <TextInput
                    placeholder="Birthdate"
                    value={bdate ? bdate.toISOString().slice(0, 10) : ''}
                    style={styles.input}
                    placeholderTextColor="#aaa"
                    editable={false}
                  />
                </View>
              </Pressable>
              {showDatePicker && (
                <DateTimePicker
                  value={bdate || new Date(2000, 0, 1)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setBdate(selectedDate);
                  }}
                  maximumDate={new Date()}
                />
              )}

              {/* Modern Gender Picker */}
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={gender}
                  onValueChange={setGender}
                  style={styles.picker}
                  dropdownIconColor="#007bff"
                >
                  <Picker.Item label="Select Gender" value="" color="#aaa" />
                  <Picker.Item label="Male" value="Male" />
                  <Picker.Item label="Female" value="Female" />
                  <Picker.Item label="Others" value="Others" />
                </Picker>
              </View>

              <TextInput
                placeholder="Contact Number"
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
                style={styles.input}
                placeholderTextColor="#aaa"
              />

              <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#aaa"
              />

              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#aaa"
              />

              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#aaa"
              />

              <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#aaa"
              />

              <TouchableOpacity onPress={handleRegister} disabled={loading} style={{ borderRadius: 25, marginTop: 6, marginBottom: 10 }}>
                <LinearGradient
                  colors={['#205781', '#7AB2D3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <ThemedText style={styles.buttonText}>
                    {loading ? 'Registering...' : 'Register'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/login')} style={styles.registerLink}>
                <ThemedText style={styles.registerText}>
                  Already have an account? <ThemedText style={{ textDecorationLine: 'underline' }}>Login</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 20,
    paddingTop: 10,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    alignSelf: 'center',
    position: 'relative',
    marginTop: 50,
  },
  mascot: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: -50,
    zIndex: 2,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    alignSelf: 'center',
    alignItems: 'stretch',
  },
  pickerWrapper: {
    backgroundColor: '#f1f3f6',
    borderRadius: 25,
    marginBottom: 16,
    borderWidth: 0,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#222',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    color: '#222',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 28,
    textAlign: 'center',
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
  input: {
    borderWidth: 0,
    backgroundColor: '#f1f3f6',
    padding: 14,
    borderRadius: 25,
    marginBottom: 16,
    fontSize: 16,
    color: '#222',
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 6,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: 6,
    alignItems: 'center',
  },
  registerText: {
    color: '#007bff',
    fontSize: 15,
  },
});