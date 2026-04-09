import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase web config — these values are public by design (security via Firebase Rules)
const firebaseConfig = {
  apiKey:            'AIzaSyD6VxC_KJ3WcDcj-J2ir5-EZxq-sdLoyaM',
  authDomain:        'oviguide-in.firebaseapp.com',
  projectId:         'oviguide-in',
  storageBucket:     'oviguide-in.firebasestorage.app',
  messagingSenderId: '20834692643',
  appId:             '1:20834692643:web:d4aa93358a7b8f4a9d0b96',
};

// Avoid re-initialising on hot-reload
const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(app);
