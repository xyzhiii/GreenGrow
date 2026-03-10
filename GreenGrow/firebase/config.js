// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1_zNkhNHzfmtKvJcdMGxTcM2R-7zrwUQ",
  authDomain: "greengrow-41922.firebaseapp.com",
  projectId: "greengrow-41922",
  storageBucket: "greengrow-41922.firebasestorage.app",
  messagingSenderId: "12959500274",
  appId: "1:12959500274:web:d782728c8fd90d3797cd6b",
  measurementId: "G-6B7F7E92E2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);