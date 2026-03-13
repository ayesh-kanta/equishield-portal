import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyApXkcFtkgwCMJoxb8g5n-qTq6O2KhuhEQ",
  authDomain: "equishield-portal.firebaseapp.com",
  projectId: "equishield-portal",
  storageBucket: "equishield-portal.firebasestorage.app",
  messagingSenderId: "123521404311",
  appId: "1:123521404311:web:dbfe76260e7cc21de748d2",
  measurementId: "G-EWWTYZHXPX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);