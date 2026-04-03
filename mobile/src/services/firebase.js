import { Platform } from 'react-native';

let firebaseApp = null;
let db = null;

if (Platform.OS !== 'web') {
  // Native Firebase (Android/iOS only)
  const firebase = require('@react-native-firebase/app').default;
  require('@react-native-firebase/firestore');
  
  firebaseApp = firebase;
  db = firebase.firestore();
} else {
  // Web Mock (Prevents crash in browser)
  console.warn('[FIREBASE] Native Firebase is disabled on Web.');
  db = {
    collection: () => ({
      doc: () => ({ set: async () => {}, get: async () => ({ exists: false }) }),
      add: async () => ({ id: 'mock-id' }),
      limit: () => ({ get: async () => ({ docs: [] }) }),
    }),
  };
}

export { db };
export default firebaseApp;
