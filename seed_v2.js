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

const moreData = [
  {
    title: "Pokémon Unbound",
    description: "Uma das ROM hacks mais completas, com uma história original, novos gráficos e Pokémons de todas as gerações.",
    type: "rom",
    downloadUrl: "https://www.pokecommunity.com/showthread.php?t=382178",
    imageUrl: "https://images.unsplash.com/photo-1627315516027-2c4f82635293?q=80&w=1470&auto=format&fit=crop",
    views: 12500
  },
  {
    title: "Pokémon Prism",
    description: "Um hack lendário de Crystal que permite jogar como um Pokémon em certas partes e tem uma região totalmente nova.",
    type: "rom",
    downloadUrl: "https://pokemonprism.com/",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1470&auto=format&fit=crop",
    views: 8900
  },
  {
    title: "Novo Evento de Tera Raid: Mewtwo",
    description: "Prepare seu time! Mewtwo com a marca de Incomparável estará disponível por tempo limitado em Pokémon Scarlet & Violet.",
    type: "news",
    downloadUrl: "https://scarletviolet.pokemon.com/",
    imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Mewtwo",
    views: 3400
  },
  {
    title: "Pokémon Concierge: 2ª Temporada Confirmada",
    description: "A charmosa série em stop-motion da Netflix ganhará novos episódios em breve. Haru e Psyduck estão de volta!",
    type: "news",
    downloadUrl: "https://www.netflix.com/",
    imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Concierge",
    views: 2100
  },
  {
    title: "Pokémon Twilight Wings",
    description: "Série de curtas que explora a vida dos habitantes da região de Galar. Uma obra prima de animação.",
    type: "anime",
    downloadUrl: "https://www.youtube.com/pokemon",
    imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Twilight",
    views: 5600
  },
  {
    title: "Pokémon Origins",
    description: "O anime que reconta a história original de Red e Blue com foco na fidelidade aos jogos.",
    type: "anime",
    downloadUrl: "https://www.pokemon.com/br/animation/",
    imageUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Origins",
    views: 9800
  }
];

async function seed() {
  console.log("Iniciando semeadura extra de dados...");
  for (const item of moreData) {
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
