import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Ruler, Weight, Activity, Shield, Zap, Heart } from "lucide-react";
import "./PokemonModal.css";

const PokemonModal = ({ pokemon, description, onClose }) => {
  useEffect(() => {
    // Disable scrolling on the body when the modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!pokemon) return null;

  const getStatIcon = (name) => {
    switch (name) {
      case "hp": return <Heart size={16} />;
      case "attack": return <Zap size={16} />;
      case "defense": return <Shield size={16} />;
      case "speed": return <Activity size={16} />;
      default: return null;
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-glass poke-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-content">
          <div className="modal-left">
            <div className={`image-container ${pokemon.types[0].type.name}`}>
              <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} />
            </div>
            <div className="poke-types">
              {pokemon.types.map(t => (
                <span key={t.type.name} className={`type-badge ${t.type.name}`}>
                  {t.type.name}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-right">
            <div className="header">
              <span className="number">#{String(pokemon.id).padStart(3, '0')}</span>
              <h2>{pokemon.name}</h2>
            </div>

            <p className="description">
              {description || "Nenhuma descrição disponível para este Pokémon."}
            </p>

            <div className="stats-grid">
              <div className="stat-item">
                <Ruler size={18} />
                <span>{pokemon.height / 10} m</span>
                <label>Altura</label>
              </div>
              <div className="stat-item">
                <Weight size={18} />
                <span>{pokemon.weight / 10} kg</span>
                <label>Peso</label>
              </div>
            </div>

            <div className="base-stats">
              <h3>Estatísticas Base</h3>
              {pokemon.stats.slice(0, 4).map(stat => (
                <div key={stat.stat.name} className="stat-row">
                  <div className="stat-label">
                    {getStatIcon(stat.stat.name)}
                    <span>{stat.stat.name.replace("-", " ")}</span>
                  </div>
                  <div className="stat-bar-container">
                    <div 
                      className="stat-bar" 
                      style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                    ></div>
                    <span className="stat-value">{stat.base_stat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default PokemonModal;
