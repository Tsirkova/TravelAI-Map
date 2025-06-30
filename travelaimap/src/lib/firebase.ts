// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCtMcw2rVGcCOQ40IzVoEDYSKQ2iCE17hE",
  authDomain: "travelai-map.firebaseapp.com",
  projectId: "travelai-map",
  storageBucket: "travelai-map.firebasestorage.app",
  messagingSenderId: "936253303177",
  appId: "1:936253303177:web:9530f7be29161292b29958",
  measurementId: "G-0D0ECL20BN"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Экспортируем базу данных