import { initializeApp } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBy-7tiwutoPgxTJrMmOb6FwQVlBVIhV4w',
  authDomain: 'shwapno-operations.firebaseapp.com',
  projectId: 'shwapno-operations',
  storageBucket: 'shwapno-operations.appspot.com',
  messagingSenderId: '1036142263926',
  appId: '1:1036142263926:web:8cb202c66493b2155ce957',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };

