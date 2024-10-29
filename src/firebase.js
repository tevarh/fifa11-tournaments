// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBglUq-vOKnWTwEy2haspALfcsAq8w2gJ4",
  authDomain: "fifa11-tournaments-f468e.firebaseapp.com",
  projectId: "fifa11-tournaments-f468e",
  storageBucket: "fifa11-tournaments-f468e.appspot.com",
  messagingSenderId: "1012071313787",
  appId: "1:1012071313787:web:2c6930dd714ed171b34dde",
  measurementId: "G-RHK9YJ40SK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);