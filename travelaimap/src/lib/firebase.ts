import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCtMcw2rVGcCOQ40IzVoEDYSKQ2iCE17hE",
  authDomain: "travelai-map.firebaseapp.com",
  projectId: "travelai-map",
  storageBucket: "travelai-map.appspot.com",
  messagingSenderId: "936253303177",
  appId: "1:936253303177:web:9530f7be29161292b29958",
  measurementId: "G-0D0ECL20BN"
};

// Инициализация Firebase
export const app = initializeApp(firebaseConfig); 
export const db = getFirestore(app);
export const auth = getAuth(app); 