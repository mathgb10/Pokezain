import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
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

const sampleData = [
  {
    title: "Pokémon Fire Red Extended",
    description: "Uma versão aprimorada do clássico Fire Red com Pokémons até a 8ª geração e novas mecânicas de batalha.",
    type: "rom",
    downloadUrl: "https://example.com/firered",
    imageUrl: "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=1469&auto=format&fit=crop",
    views: 150
  },
  {
    title: "mGBA - O Melhor Emulador de GBA",
    description: "Emulador leve e preciso para rodar suas ROMs de Game Boy Advance com perfeição.",
    type: "emulator",
    downloadUrl: "https://mgba.io/downloads.html",
    imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=GBA",
    views: 890
  },
  {
    title: "Pixelmon Reforged 9.1.5",
    description: "O mod definitivo de Pokémon para Minecraft 1.16.5. Capture, treine e lute em um mundo aberto.",
    type: "minecraft",
    downloadUrl: "https://reforged.gg/",
    imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Minecraft",
    views: 4500
  },
  {
    title: "Pokémon Horizons: Episódio 50",
    description: "Acompanhe as novas aventuras de Liko e Roy na região de Paldea.",
    type: "anime",
    downloadUrl: "https://www.pokemon.com/br/animation/",
    imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Anime",
    views: 230
  },
  {
    title: "Pokémon Special (Adventures) Vol 1",
    description: "O mangá que segue fielmente a história dos jogos. Red começa sua jornada!",
    type: "manga",
    downloadUrl: "https://example.com/manga",
    imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Manga",
    views: 120
  },
  {
    title: "Campeonato Mundial Pokémon 2026",
    description: "Tudo o que você precisa saber sobre as datas e locais do próximo mundial.",
    type: "news",
    downloadUrl: "https://www.pokemon.com/br/pokemon-news/",
    imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=News",
    views: 560
  }
];

async function seed() {
  console.log("Iniciando semeadura de dados...");
  for (const item of sampleData) {
    try {
      await addDoc(collection(db, "content"), {
        ...item,
        createdAt: serverTimestamp()
      });
      console.log(`Adicionado: ${item.title}`);
    } catch (e) {
      console.error(`Erro ao adicionar ${item.title}:`, e);
    }
  }
  console.log("Dados semeados com sucesso!");
  process.exit(0);
}

seed();
