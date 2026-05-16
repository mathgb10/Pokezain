import axios from 'axios';
import fs from 'fs';

async function fetchPokemonData() {
  console.log('Buscando animes de Pokémon...');
  const animeRes = await axios.get('https://api.jikan.moe/v4/anime?q=pokemon&limit=6');
  const animes = animeRes.data.data.map(a => ({
    title: a.title,
    description: a.synopsis,
    type: 'anime',
    imageUrl: a.images.jpg.large_image_url,
    url: a.url,
    views: Math.floor(Math.random() * 5000) + 1000
  }));

  console.log('Buscando mangás de Pokémon...');
  const mangaRes = await axios.get('https://api.jikan.moe/v4/manga?q=pokemon&limit=6');
  const mangas = mangaRes.data.data.map(m => ({
    title: m.title,
    description: m.synopsis,
    type: 'manga',
    imageUrl: m.images.jpg.large_image_url,
    url: m.url,
    views: Math.floor(Math.random() * 3000) + 500
  }));

  const data = { animes, mangas };
  fs.writeFileSync('real_pokemon_data.json', JSON.stringify(data, null, 2));
  console.log('Dados salvos em real_pokemon_data.json');
}

fetchPokemonData().catch(console.error);
