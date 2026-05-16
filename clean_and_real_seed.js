import { db } from "./firebase_node.js";
import { collection, addDoc, getDocs, deleteDoc, serverTimestamp } from "firebase/firestore";
import fs from 'fs';

// Helper para ler dados reais se existirem
let realData = { animes: [], mangas: [] };
try {
  realData = JSON.parse(fs.readFileSync('real_pokemon_data.json', 'utf8'));
} catch (e) {
  console.log("Arquivo real_pokemon_data.json não encontrado, usando dados padrão.");
}

const seedContent = [
  // ROMs
  {
    title: "Pokémon Unbound",
    description: "Uma das ROM hacks mais avançadas, com uma nova região (Borrius), gráficos de 4ª geração, sistema de missões e todos os Pokémon até a 8ª geração.",
    type: "rom",
    imageUrl: "https://images.tcdn.com.br/img/img_prod/1126131/pokemon_unbound_v2_1_1_salve_no_cartucho_gba_1333_1_0c5e75878d672834b8c9354924c5625c.jpg",
    url: "https://www.pokecommunity.com/showthread.php?t=382178",
    views: 0,
    createdAt: serverTimestamp()
  },
  {
    title: "Pokémon Radical Red",
    description: "A experiência definitiva de Kanto com dificuldade aumentada, Pokémon de todas as gerações, Mega Evolução e Dynamax.",
    type: "rom",
    imageUrl: "https://images.tcdn.com.br/img/img_prod/1126131/pokemon_radical_red_v4_1_salve_no_cartucho_gba_1335_1_b6e6e8e8e8e8e8e8e8e8e8e8e8e8e8e8.jpg",
    url: "https://www.pokecommunity.com/showthread.php?t=437688",
    views: 0,
    createdAt: serverTimestamp()
  },
  
  // Minecraft
  {
    title: "Cobblemon",
    description: "O mod de Pokémon para Minecraft que foca na integração perfeita com o mundo, usando modelos 3D que seguem o estilo do jogo.",
    type: "minecraft",
    imageUrl: "https://media.forgecdn.net/avatars/655/543/638058284716766016.png",
    url: "https://cobblemon.com/",
    views: 0,
    createdAt: serverTimestamp()
  },
  {
    title: "Pixelmon Reforged",
    description: "O mod mais clássico e completo de Pokémon para Minecraft, transformando o jogo em um RPG completo.",
    type: "minecraft",
    imageUrl: "https://pixelmonmod.com/wiki/images/thumb/5/5a/PixelmonLogo.png/300px-PixelmonLogo.png",
    url: "https://reforged.gg/",
    views: 0,
    createdAt: serverTimestamp()
  },

  // Notícias
  {
    title: "Pokémon Legends: Z-A anunciado para 2025",
    description: "A Nintendo surpreendeu os fãs com o anúncio de um novo jogo da série Legends, que se passará inteiramente em Lumiose City.",
    type: "news",
    imageUrl: "https://assets.pokemon.com/assets/cms2-pt-br/img/video-games/_tiles/pokemon-legends-z-a/announcement/pokemon-legends-z-a-169.jpg",
    url: "https://www.pokemon.com/br/games/pokemon-legends-z-a",
    views: 0,
    createdAt: serverTimestamp()
  },
  {
    title: "Campeonato Mundial Pokémon 2024 em Honolulu",
    description: "Os melhores treinadores do mundo se reunirão no Havaí para disputar o título mundial de VGC, TCG e Pokémon GO.",
    type: "news",
    imageUrl: "https://assets.pokemon.com/assets/cms2-pt-br/img/video-games/_tiles/worlds/2024/worlds-2024-169-br.jpg",
    url: "https://www.pokemon.com/br/play-pokemon/mundiais/2024/sobre",
    views: 0,
    createdAt: serverTimestamp()
  },

  // Emuladores
  {
    title: "mGBA (GBA)",
    description: "O melhor emulador de Game Boy Advance para PC, focado em precisão e performance.",
    type: "emulator",
    imageUrl: "https://mgba.io/img/logo.png",
    url: "https://mgba.io/",
    views: 0,
    createdAt: serverTimestamp()
  },
  {
    title: "Citra (3DS)",
    description: "Emulador de Nintendo 3DS de código aberto, permitindo jogar títulos como Pokémon X/Y e Sun/Moon em alta resolução.",
    type: "emulator",
    imageUrl: "https://citra-emu.org/images/logo.png",
    url: "https://citra-emu.org/",
    views: 0,
    createdAt: serverTimestamp()
  },

  // Animes e Mangas Reais (da API) - views começam em 0
  ...realData.animes.map(a => ({ ...a, views: 0, createdAt: serverTimestamp() })),
  ...realData.mangas.map(m => ({ ...m, views: 0, createdAt: serverTimestamp() }))
];

async function seed() {
  console.log("Iniciando limpeza do banco...");
  const snapshot = await getDocs(collection(db, "content"));
  for (const doc of snapshot.docs) {
    await deleteDoc(doc.ref);
  }
  console.log("Banco limpo!");

  console.log("Populando com dados reais (views = 0)...");
  for (const item of seedContent) {
    await addDoc(collection(db, "content"), item);
  }

  // Notificação de sistema
  await addDoc(collection(db, "notifications"), {
    message: "Bem-vindo ao Pokezain! Explore nossa nova biblioteca de conteúdos.",
    createdAt: serverTimestamp(),
    readBy: []
  });

  console.log("Seed finalizado com sucesso! Todas as views começam em 0.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
