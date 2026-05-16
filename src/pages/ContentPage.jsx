import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc, increment, orderBy } from "firebase/firestore";
import { Download, Eye, Calendar, ExternalLink, Zap } from "lucide-react";
import ContentModal from "../components/ContentModal";
import "./ContentPage.css";

const ContentPage = ({ type, title }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchContent();
  }, [type]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "content"), 
        where("type", "==", type),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      let firebaseData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (type === 'anime') {
        try {
          const res = await fetch("https://api.jikan.moe/v4/anime?q=pokemon&limit=20");
          const jikanData = await res.json();
          if (jikanData.data) {
             const apiAnimes = jikanData.data.map(a => ({
               id: `jikan-${a.mal_id}`,
               title: a.title,
               description: a.synopsis || "Sem descrição disponível pela API.",
               imageUrl: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url,
               url: a.url,
               views: a.members || 0,
               isApi: true,
               animeType: a.type
             }));
             firebaseData = [...firebaseData, ...apiAnimes];
          }
        } catch(apiErr) {
          console.error("Erro ao buscar Jikan API:", apiErr);
        }
      }
      setItems(firebaseData);
    } catch (err) {
      console.error("Erro ao buscar conteúdo:", err);
      // Fallback: tentar sem orderBy se o índice não existir ainda
      try {
        const qFallback = query(collection(db, "content"), where("type", "==", type));
        const querySnapshot = await getDocs(qFallback);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(data);
      } catch (fallbackErr) {
        console.error("Erro no fallback:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (item) => {
    setSelectedItem(item);
    try {
      if(!item.isApi) {
        const docRef = doc(db, "content", item.id);
        await updateDoc(docRef, { views: increment(1) });
      }
      setItems(items.map(i => i.id === item.id ? {...i, views: (i.views || 0) + 1} : i));
    } catch (err) {
      console.error("Erro ao incrementar views:", err);
    }
  };

  const handleDownload = async (item) => {
    // Se for anime ou notícia, o 'download' é abrir o link
    if (item.url) {
      window.open(item.url, "_blank");
    } else if (item.downloadUrl) {
      window.open(item.downloadUrl, "_blank");
    }
  };

  return (
    <div className="content-page container fade-in">
      <div className="page-header">
        <h1>{title}</h1>
        <p>
          {type === 'news' ? 'Fique por dentro das últimas novidades e eventos do universo Pokémon.' : 
           type === 'minecraft' ? 'Transforme seu Minecraft com os melhores mods de Pokémon (Pixelmon, Cobblemon).' :
           type === 'rom' ? 'Jogue as melhores hack-roms criadas pela comunidade (Unbound, Radical Red).' :
           type === 'anime' ? 'Assista aos episódios e filmes da jornada de Ash e novos protagonistas.' :
           type === 'manga' ? 'Leia as aventuras clássicas e novas adaptações em mangá de Pokémon.' :
           type === 'emulator' ? 'Os melhores softwares para rodar seus jogos clássicos com perfeição.' :
           'Explore os melhores conteúdos selecionados pela nossa equipe.'}
        </p>
      </div>

      <div className="content-filters" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
        <div className="search-bar glass" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderRadius: '15px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <input 
            type="text" 
            placeholder={`Pesquisar em ${title}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', fontSize: '1rem', outline: 'none' }}
          />
        </div>

        {type === 'anime' && (
          <div className="anime-filters" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} 
              onClick={() => setFilterType('all')}
              style={{ padding: '8px 24px', borderRadius: '12px', background: filterType === 'all' ? 'var(--primary-color)' : 'var(--card-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
            >Todos</button>
            <button 
              className={`filter-btn ${filterType === 'tv' ? 'active' : ''}`} 
              onClick={() => setFilterType('tv')}
              style={{ padding: '8px 24px', borderRadius: '12px', background: filterType === 'tv' ? 'var(--primary-color)' : 'var(--card-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
            >Séries (TV)</button>
            <button 
              className={`filter-btn ${filterType === 'movie' ? 'active' : ''}`} 
              onClick={() => setFilterType('movie')}
              style={{ padding: '8px 24px', borderRadius: '12px', background: filterType === 'movie' ? 'var(--primary-color)' : 'var(--card-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
            >Filmes</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="pokeball-loader"></div>
          <p>Buscando dados no servidor...</p>
        </div>
      ) : (
        <div className={`content-grid ${type}`}>
          {items.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
            if (!matchesSearch) return false;

            if (type !== 'anime' || filterType === 'all') return true;
            if (item.isApi) {
              return item.animeType?.toLowerCase() === filterType.toLowerCase();
            }
            if (filterType === 'movie') {
              return item.title.toLowerCase().includes('filme') || item.title.toLowerCase().includes('movie') || item.category === 'movie';
            } else {
              return !item.title.toLowerCase().includes('filme') && !item.title.toLowerCase().includes('movie');
            }
          }).map(item => (
            <div key={item.id} className={`content-card glass ${type}-card`} onClick={() => handleOpenModal(item)}>
              <div className="card-image">
                <img src={item.imageUrl || "https://api.dicebear.com/7.x/initials/svg?seed=poke"} alt={item.title} />
                <div className="card-overlay">
                  <span>{type === 'news' ? 'Ler Notícia' : 'Ver Detalhes'}</span>
                </div>
                {type === 'news' && <span className="news-badge">Novidade</span>}
              </div>
              <div className="card-info">
                <h3>{item.title}</h3>
                <p className="card-desc">
                  {item.description ? item.description.substring(0, 80) + (item.description.length > 80 ? "..." : "") : "Sem descrição disponível."}
                </p>
                <div className="card-meta">
                  <span className="views">
                    <Eye size={14} /> {item.views} {type === 'news' ? 'leitura' : 'visualização'}{item.views !== 1 ? 's' : ''}
                  </span>
                  <button className="card-download-btn" onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item);
                  }}>
                    {type === 'news' ? <ExternalLink size={16} /> : 
                     type === 'anime' ? <Zap size={16} /> :
                     type === 'manga' ? <Eye size={16} /> :
                     type === 'rom' || type === 'minecraft' || type === 'emulator' ? <Download size={16} /> :
                     <ExternalLink size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="no-content glass">
              <p>Ainda não há conteúdo nesta categoria. Volte em breve!</p>
            </div>
          )}
        </div>
      )}

      {selectedItem && (
        <ContentModal 
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default ContentPage;
