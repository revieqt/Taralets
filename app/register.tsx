import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity, View } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firestore/config'; // Adjust the import path as necessary
import { router } from 'expo-router';
import { doc, setDoc, Timestamp, getDocs, collection, query, where } from 'firebase/firestore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import TextField from '@/components/TextField';
import PasswordField from '@/components/PasswordField';
import DatePicker from '@/components/DatePicker';
import GradientButton from '@/components/GradientButton';
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
  const scrollRef = useRef<ScrollView>(null);

  const handleRegister = async () => {
    setErrorMsg('');
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
      router.replace('/login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('Email is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(error.message || 'Registration failed.');
      }
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
    setLoading(false);
  };

  return (
    <ThemedView style={styles.background}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, width: '100%' }}
      >
        <ScrollView
          ref={scrollRef}
          style={{ width: '100%', padding: 20 }}
          contentContainerStyle={{ paddingBottom: 30 }}
          keyboardShouldPersistTaps="handled"
        >

          <ThemedText type="title" style={{ marginTop: 50}}>
            Create an Account
          </ThemedText>
          <ThemedText style={{ marginBottom: 20}}>
            Fill up the form and join our growing community!
          </ThemedText>

          {errorMsg ? (
            <ThemedText style={styles.errorMsg}>{errorMsg}</ThemedText>
          ) : null}

          <TextField
            placeholder="First Name"
            value={fname}
            onChangeText={setFname}
            autoCapitalize="words"
          />

          <TextField
            placeholder="Last Name"
            value={lname}
            onChangeText={setLname}
            autoCapitalize="words"
          />

          <TextField
            placeholder="Middle Name (optional)"
            value={mname}
            onChangeText={setMname}
            autoCapitalize="words"
          />

          <DatePicker
            placeholder="Birthdate"
            value={bdate}
            onChange={setBdate}
          />

          <TextField
            placeholder="Gender"
            value={gender}
            onChangeText={setGender}
          />

          <TextField
            placeholder="Contact Number"
            value={contactNumber}
            onChangeText={setContactNumber}
            keyboardType="phone-pad"
          />

          <TextField
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextField
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <PasswordField
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />

          <PasswordField
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <GradientButton
            title={loading ? 'Registering...' : 'Register'}
            onPress={handleRegister}
            gradientColors={['#00FFDE', '#0065F8']}
          />

          <TouchableOpacity onPress={() => router.push('/login')} style={styles.registerLink}>
            <ThemedText style={styles.registerText}>
              Already have an account? <ThemedText style={{ textDecorationLine: 'underline' }}>Login</ThemedText>
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
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
  registerLink: {
    marginTop: 10,
    alignItems: 'center',
  },
  registerText: {
    color: '#007bff',
    fontSize: 15,
  },
});