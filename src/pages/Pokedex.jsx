import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Loader2, Heart, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import PokemonModal from "../components/PokemonModal";
import "./Pokedex.css";

const GENS = [
  { id: 0, name: "Todos", limit: 1025, offset: 0, total: 1025 },
  { id: 1, name: "Gen 1", limit: 151, offset: 0 },
  { id: 2, name: "Gen 2", limit: 100, offset: 151 },
  { id: 3, name: "Gen 3", limit: 135, offset: 251 },
  { id: 4, name: "Gen 4", limit: 107, offset: 386 },
  { id: 5, name: "Gen 5", limit: 156, offset: 493 },
  { id: 6, name: "Gen 6", limit: 72, offset: 649 },
  { id: 7, name: "Gen 7", limit: 88, offset: 721 },
  { id: 8, name: "Gen 8", limit: 96, offset: 809 },
  { id: 9, name: "Gen 9", limit: 105, offset: 905 },
];

const TYPES = [
  { name: "fire", color: "#ff4422", icon: "🔥" },
  { name: "water", color: "#3399ff", icon: "💧" },
  { name: "grass", color: "#77cc55", icon: "🌿" },
  { name: "electric", color: "#ffcc33", icon: "⚡" },
  { name: "ice", color: "#66ccff", icon: "❄️" },
  { name: "fighting", color: "#bb5544", icon: "🥊" },
  { name: "poison", color: "#aa5599", icon: "☠️" },
  { name: "ground", color: "#ddbb55", icon: "⛰️" },
  { name: "flying", color: "#8899ff", icon: "🦅" },
  { name: "psychic", color: "#ff5599", icon: "🔮" },
  { name: "bug", color: "#aabb22", icon: "🐞" },
  { name: "rock", color: "#bbaa66", icon: "🪨" },
  { name: "ghost", color: "#6666bb", icon: "👻" },
  { name: "dragon", color: "#7766ee", icon: "🐲" },
  { name: "dark", color: "#775544", icon: "🌑" },
  { name: "steel", color: "#aaaabb", icon: "⚙️" },
  { name: "fairy", color: "#ee99ee", icon: "✨" }
];

const SORT_OPTIONS = [
  { id: "id-asc", name: "Menor ID" },
  { id: "id-desc", name: "Maior ID" },
  { id: "name-asc", name: "Nome (A-Z)" },
  { id: "name-desc", name: "Nome (Z-A)" },
  { id: "hp-desc", name: "Maior HP" },
  { id: "attack-desc", name: "Maior Ataque" },
  { id: "defense-desc", name: "Maior Defesa" },
  { id: "speed-desc", name: "Maior Velocidade" },
];
const Pokedex = () => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentGen, setCurrentGen] = useState(GENS[0]);
  const [selectedType, setSelectedType] = useState(null);
  const [sortBy, setSortBy] = useState("id-asc");
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sizeFilter, setSizeFilter] = useState("all");
  const [dualTypeOnly, setDualTypeOnly] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonDesc, setPokemonDesc] = useState("");

  const [allPokemon, setAllPokemon] = useState([]); // Cache for all pokemon names/IDs
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;
  const { user } = useAuth();

  useEffect(() => {
    fetchAllPokemon();
  }, []);

  const fetchAllPokemon = async () => {
    try {
      // Fetch all pokemon names and IDs (basic info)
      const res = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1025");
      const mapped = res.data.results.map((p, index) => {
        // Extract ID from URL because index + 1 doesn't work for all cases (e.g. variations)
        const id = parseInt(p.url.split("/").filter(Boolean).pop());
        return {
          name: p.name,
          id: id,
          url: p.url
        };
      });
      setAllPokemon(mapped);
    } catch (err) {
      console.error("Erro ao carregar lista de Pokémon:", err);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchPokemon(0);
  }, [currentGen]);

  const fetchPokemon = async (targetPage = page) => {
    if (search.trim() !== "") return; // Don't fetch paginated list if searching globally

    setLoading(true);
    try {
      let offset = currentGen.id === 0
        ? targetPage * PAGE_SIZE
        : currentGen.offset + (targetPage * PAGE_SIZE);

      let limit = PAGE_SIZE;

      if (currentGen.id !== 0) {
        const remaining = currentGen.limit - (targetPage * PAGE_SIZE);
        if (remaining <= 0) return;
        limit = Math.min(PAGE_SIZE, remaining);
      }

      const res = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const detailedData = await Promise.all(
        res.data.results.map(async (p) => {
          try {
            const detail = await axios.get(p.url);
            return detail.data;
          } catch (e) {
            return null;
          }
        })
      );
      setPokemon(detailedData.filter(p => p !== null));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleGlobalSearch = async () => {
    if (search.trim() === "") {
      fetchPokemon(0);
      return;
    }

    setLoading(true);
    setPage(0);
    try {
      // Search in our local cache
      const results = allPokemon.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase().trim()) || 
        p.id.toString() === search.trim()
      ).slice(0, 40); // Limit to 40 results for performance

      if (results.length > 0) {
        const detailedData = await Promise.all(
          results.map(async (p) => {
            try {
              const detail = await axios.get(p.url);
              return detail.data;
            } catch (e) { return null; }
          })
        );
        setPokemon(detailedData.filter(p => p !== null));
      } else {
        setPokemon([]);
      }
    } catch (err) {
      console.error(err);
      setPokemon([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchPokemon(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim() !== "") {
        handleGlobalSearch();
      } else {
        fetchPokemon(0);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (user) fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      setFavorites(userDoc.data().favorites || []);
    }
  };

  const handlePokeClick = async (p) => {
    setSelectedPokemon(p);
    setPokemonDesc("Carregando descrição...");
    try {
      const speciesRes = await axios.get(p.species.url);
      const entries = speciesRes.data.flavor_text_entries;

      // Filter entries by language
      const ptEntries = entries.filter(e => e.language.name === "pt" || e.language.name === "pt-BR");
      const enEntries = entries.filter(e => e.language.name === "en");

      let entry = ptEntries[0] || enEntries[0];

      if (entry) {
        // Clean up the text (remove special characters like form feeds)
        const cleanText = entry.flavor_text
          .replace(/\f/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .trim();
        setPokemonDesc(cleanText);
      } else {
        setPokemonDesc("Nenhuma descrição disponível para este Pokémon nos idiomas suportados.");
      }
    } catch (err) {
      console.error("Erro ao buscar espécie:", err);
      setPokemonDesc("A descrição deste Pokémon não pôde ser carregada no momento.");
    }
  };

  const toggleFavorite = async (e, id) => {
    e.stopPropagation();
    if (!user) return alert("Faça login para favoritar!");

    const isFav = favorites.includes(id);
    const userRef = doc(db, "users", user.uid);

    try {
      if (isFav) {
        await updateDoc(userRef, { favorites: arrayRemove(id) });
        setFavorites(favorites.filter(favId => favId !== id));
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(id) });
        setFavorites([...favorites, id]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPokemon = pokemon.filter(p => {
    const cleanSearch = search.toLowerCase().trim();
    const matchesSearch = cleanSearch === "" || 
                         p.name.toLowerCase().includes(cleanSearch) || 
                         p.id.toString() === cleanSearch;
    const matchesType = !selectedType || p.types.some(t => t.type.name === selectedType);
    const matchesFav = !showFavoritesOnly || favorites.includes(p.id);

    // Size filter (height is in decimetres)
    let matchesSize = true;
    if (sizeFilter === "small") matchesSize = p.height < 10; // < 1m
    else if (sizeFilter === "medium") matchesSize = p.height >= 10 && p.height < 25; // 1m - 2.5m
    else if (sizeFilter === "large") matchesSize = p.height >= 25; // > 2.5m

    const matchesDualType = !dualTypeOnly || p.types.length > 1;

    return matchesSearch && matchesType && matchesFav && matchesSize && matchesDualType;
  });

  const getStatValue = (p, statName) => {
    return p.stats.find(s => s.stat.name === statName)?.base_stat || 0;
  };

  const sortedPokemon = [...filteredPokemon].sort((a, b) => {
    switch (sortBy) {
      case "id-asc": return a.id - b.id;
      case "id-desc": return b.id - a.id;
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      case "hp-desc": return getStatValue(b, "hp") - getStatValue(a, "hp");
      case "attack-desc": return getStatValue(b, "attack") - getStatValue(a, "attack");
      case "defense-desc": return getStatValue(b, "defense") - getStatValue(a, "defense");
      case "speed-desc": return getStatValue(b, "speed") - getStatValue(a, "speed");
      default: return 0;
    }
  });

  return (
    <div className="pokedex-page container fade-in">
      <div className="pokedex-header">
        <div className="header-top">
          <h1>Pokédex</h1>
          <div className="gen-selector">
            {GENS.map(gen => (
              <button
                key={gen.id}
                className={`gen-btn ${currentGen.id === gen.id ? 'active' : ''}`}
                onClick={() => setCurrentGen(gen)}
              >
                {gen.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filters-row">
          <div className="search-bar glass">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sort-selector glass">
            <Filter size={18} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>
          </div>

          <div className="extra-filters glass">
            <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)}>
              <option value="all">Todos os Tamanhos</option>
              <option value="small">Pequenos (&lt;1m)</option>
              <option value="medium">Médios (1m-2.5m)</option>
              <option value="large">Grandes (&gt;2.5m)</option>
            </select>
          </div>

          <button
            className={`fav-toggle-btn glass ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          >
            <Heart size={18} fill={showFavoritesOnly ? "#ff5350" : "none"} color={showFavoritesOnly ? "#ff5350" : "currentColor"} />
            <span>Favoritos</span>
          </button>


          <button
            className={`dual-type-btn glass ${dualTypeOnly ? 'active' : ''}`}
            onClick={() => setDualTypeOnly(!dualTypeOnly)}
          >
            <span>Tipo Duplo</span>
          </button>
        </div>

        <div className="filters-row">
          <div className="type-filters">
            <button
              className={`type-tag ${!selectedType ? 'active' : ''}`}
              onClick={() => setSelectedType(null)}
            >
              🌈 Todos
            </button>
            {TYPES.map(type => (
              <button
                key={type.name}
                className={`type-tag ${type.name} ${selectedType === type.name ? 'active' : ''}`}
                onClick={() => setSelectedType(type.name)}
                style={{
                  "--type-color": type.color,
                  borderColor: selectedType === type.name ? type.color : 'rgba(255,255,255,0.1)'
                }}
              >
                {type.icon} {type.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="spinner" size={40} />
          <p>Carregando Pokémons...</p>
        </div>
      ) : (
        <div className="pokemon-grid">
          {sortedPokemon.map(p => (
            <div key={p.id} className="poke-card glass" onClick={() => handlePokeClick(p)}>
              <div className="poke-id">#{String(p.id).padStart(3, '0')}</div>
              <button
                className={`fav-btn ${favorites.includes(p.id) ? 'active' : ''}`}
                onClick={(e) => toggleFavorite(e, p.id)}
              >
                <Heart fill={favorites.includes(p.id) ? "#ff5350" : "none"} size={18} />
              </button>
              <div className={`img-wrapper ${p.types[0].type.name}`}>
                <img src={p.sprites.other['official-artwork'].front_default} alt={p.name} />
              </div>
              <h3>{p.name}</h3>
              <div className="poke-types">
                {p.types.map(t => (
                  <span key={t.type.name} className={`type-badge ${t.type.name}`}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {sortedPokemon.length === 0 && (
            <div className="no-content glass" style={{ gridColumn: "1/-1", padding: "40px" }}>
              <p>Nenhum Pokémon encontrado com esses filtros.</p>
            </div>
          )}
        </div>
      )}

      {!loading && search.trim() === "" && (() => {
        const totalItems = currentGen.id === 0 ? currentGen.total : currentGen.limit;
        const totalPages = Math.ceil(totalItems / PAGE_SIZE);
        return (
          <div className="pagination glass">
            <button
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
              className="page-btn"
            >
              ◀ Anterior
            </button>
            <span className="page-info">Página {page + 1} de {totalPages}</span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="page-btn"
            >
              Próxima ▶
            </button>
          </div>
        );
      })()}

      {selectedPokemon && (
        <PokemonModal
          pokemon={selectedPokemon}
          description={pokemonDesc}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  );
};

export default Pokedex;
