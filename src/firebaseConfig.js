// src/firebaseConfig.js

// 1. Ganti impor 'analytics' dengan 'auth' and 'firestore'
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 2. Ini adalah data config kamu (SUDAH BENAR)
const firebaseConfig = {
  apiKey: "AIzaSyC554gc99HdIza9abBVgpSj2cWp5hHG_FA",
  authDomain: "hackatonutb.firebaseapp.com",
  projectId: "hackatonutb",
  storageBucket: "hackatonutb.firebasestorage.app",
  messagingSenderId: "454043411099",
  appId: "1:454043411099:web:b5d5469f4f57382d039c3e",
  measurementId: "G-L8H743E793"
};

// 3. Inisialisasi dan EKSPOR service yang kita butuhkan
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Kita butuh Auth untuk login
export const db = getFirestore(app); // Kita butuh Firestore untuk cek role