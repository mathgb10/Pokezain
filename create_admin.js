import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  const email = "matheus@email.com";
  const password = "Mathzila2018";

  try {
    // Try to create user first
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Usuário criado:", userCredential.user.uid);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        console.log("Usuário já existe, fazendo login...");
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login feito:", userCredential.user.uid);
      } else {
        throw err;
      }
    }

    const uid = userCredential.user.uid;

    // Set admin role in Firestore
    await setDoc(doc(db, "users", uid), {
      email: email,
      role: "admin",
      favorites: []
    }, { merge: true });

    console.log(`Usuário ${email} configurado como ADMIN com sucesso!`);

    // Verify
    const userDoc = await getDoc(doc(db, "users", uid));
    console.log("Dados do usuário:", userDoc.data());

    process.exit(0);
  } catch (err) {
    console.error("Erro:", err.message);
    process.exit(1);
  }
}

createAdmin();
