// firebaseConfig/index.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCn20TvjC98ePXmOEQiJySSq2QN2p0QuRg",
    authDomain: "taralets-3adb8.firebaseapp.com",
    projectId: "taralets-3adb8",
    storageBucket: "taralets-3adb8.firebasestorage.app",
    messagingSenderId: "353174524186",
    appId: "1:353174524186:web:45cf6ee4f8878bc0df9ca3"
  };

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
