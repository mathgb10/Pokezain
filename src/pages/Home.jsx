import React from "react";
import { motion } from "framer-motion";
import { Gamepad2, Database, Download, Sparkles, Newspaper, Play, BookOpen, Eye, Clock } from "lucide-react";
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import "./Home.css";

const Home = ({ navigateTo }) => {
  return (
    <div className="home-page fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-content">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              O Hub Definitivo <br />
              <span className="text-gradient">Para Fãs de Pokémon</span>
            </h1>
            <p className="hero-subtitle">
              Explore ROMs fan-made, emuladores premium, mods de Minecraft e a Pokedex mais completa, tudo em um só lugar.
            </p>
            <div className="hero-cta">
              <button onClick={() => navigateTo("roms")} className="btn-primary">Explorar Agora</button>
              <button onClick={() => navigateTo("pokedex")} className="btn-secondary glass">Ver Pokedex</button>
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-image"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="floating-card glass">
              <Sparkles className="icon-gold" />
              <span>Novas ROMs Adicionadas!</span>
            </div>
            <img src="https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=1469&auto=format&fit=crop" alt="Pokemon" className="main-hero-img" />
          </motion.div>
        </div>
      </section>

      {/* Recent Feed */}
      <RecentFeed navigateTo={navigateTo} />

      {/* Categories Grid */}
      <section className="categories container">
        <h2 className="section-title">Explore as Categorias</h2>
        <div className="categories-grid">
          <CategoryCard 
            icon={<Newspaper />} 
            title="Notícias" 
            desc="Fique por dentro das últimas do mundo Pokémon." 
            onClick={() => navigateTo("noticias")}
          />
          <CategoryCard 
            icon={<Gamepad2 />} 
            title="Fan-made ROMs" 
            desc="Novas histórias e regiões criadas por fãs." 
            onClick={() => navigateTo("roms")}
          />
          <CategoryCard 
            icon={<Download />} 
            title="Emuladores" 
            desc="Versões configuradas para PC e Mobile." 
            onClick={() => navigateTo("emuladores")}
          />
          <CategoryCard 
            icon={<Database />} 
            title="Pokedex Nacional" 
            desc="Dados detalhados de todos os Pokémons." 
            onClick={() => navigateTo("pokedex")}
          />
          <CategoryCard 
            icon={<Sparkles />} 
            title="Mods Minecraft" 
            desc="Pixelmon, Cobblemon e mais." 
            onClick={() => navigateTo("minecraft")}
          />
          <CategoryCard 
            icon={<Play />} 
            title="Animes" 
            desc="Assista e baixe episódios clássicos." 
            onClick={() => navigateTo("anime")}
          />
          <CategoryCard 
            icon={<BookOpen />} 
            title="Mangás" 
            desc="Leia as aventuras do mangá oficial." 
            onClick={() => navigateTo("manga")}
          />
        </div>
      </section>
    </div>
  );
};

const RecentFeed = ({ navigateTo }) => {
  const [recentItems, setRecentItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecent = async () => {
      try {
        const q = query(collection(db, "content"), orderBy("createdAt", "desc"), limit(4));
        const snap = await getDocs(q);
        setRecentItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  if (loading || recentItems.length === 0) return null;

  return (
    <section className="recent-feed container">
      <h2 className="section-title">Adicionados Recentemente</h2>
      <div className="feed-grid">
        {recentItems.map(item => (
          <div key={item.id} onClick={() => navigateTo("content", item.type, item.title)} className="feed-card glass" style={{ cursor: 'pointer' }}>
            <div className="feed-img">
              <img src={item.imageUrl || "https://api.dicebear.com/7.x/initials/svg?seed=poke"} alt={item.title} />
              <span className={`feed-badge ${item.type}`}>{item.type}</span>
            </div>
            <div className="feed-info">
              <h3>{item.title}</h3>
              <div className="feed-meta">
                <span><Eye size={14} /> {item.views}</span>
                <span><Clock size={14} /> {item.createdAt?.toDate().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const CategoryCard = ({ icon, title, desc, onClick }) => (
  <div onClick={onClick} style={{ cursor: 'pointer' }}>
    <motion.div 
      className="cat-card glass"
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="cat-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{desc}</p>
    </motion.div>
  </div>
);

export default Home;
