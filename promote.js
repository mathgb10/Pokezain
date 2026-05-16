import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const email = process.argv[2];
const uid = process.argv[3];

if (!email || !uid) {
  console.log("Uso: node promote.js <email> <uid>");
  process.exit(1);
}

async function promote() {
  console.log(`Promovendo ${email} (${uid}) para admin...`);
  try {
    await setDoc(doc(db, "users", uid), {
      email: email,
      role: "admin"
    }, { merge: true });
    console.log("Sucesso! O usuário agora é administrador.");
  } catch (e) {
    console.error("Erro:", e);
  }
  process.exit(0);
}

promote();
