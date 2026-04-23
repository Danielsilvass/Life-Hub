import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhvv6_uHVRw4m1gMZoz6HpsOfbvW54pqc",
  authDomain: "life-hub-3f7ad.firebaseapp.com",
  projectId: "life-hub-3f7ad",
  storageBucket: "life-hub-3f7ad.firebasestorage.app",
  messagingSenderId: "181273621796",
  appId: "1:181273621796:web:8579407eb721ccf33cafb1",
  measurementId: "G-C2V2ZJJKQF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
