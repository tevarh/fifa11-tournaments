import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function batchUpdateUsers() {
  try {
    const usersCollection = collection(db, 'users');
    const userDocs = await getDocs(usersCollection);

    userDocs.forEach(async (userDoc) => {
      const userData = userDoc.data();

      if (!userData.username || !userData.gameRangerId || !userData.discordUser) {
        const userRef = doc(db, 'users', userDoc.id);
        await updateDoc(userRef, {
          username: userData.username || '',
          gameRangerId: userData.gameRangerId || '',
          discordUser: userData.discordUser || ''
        });
        console.log(`Updated user document: ${userDoc.id}`);
      }
    });

    console.log('Batch update completed.');
  } catch (error) {
    console.error('Error updating user documents:', error);
  }
}
