import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDXECWCCXQO6JZLAVE_lJJRYVXrEkJEB4A",
  authDomain: "iiot-world-reports.firebaseapp.com",
  projectId: "iiot-world-reports",
  storageBucket: "iiot-world-reports.firebasestorage.app",
  messagingSenderId: "169633793510",
  appId: "1:169633793510:web:7ae94aa36c2a8ccd5dc227",
  measurementId: "G-WKKT4HJZBS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;