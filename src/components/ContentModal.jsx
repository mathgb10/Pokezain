import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Download, Eye, Calendar, ExternalLink, Zap } from "lucide-react";
import "./ContentModal.css";

const ContentModal = ({ item, onClose, onDownload }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!item) return null;

  const itemUrl = item.url || item.downloadUrl;

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-glass content-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-body">
          <div className="modal-image">
            <img src={item.imageUrl || "https://api.dicebear.com/7.x/initials/svg?seed=poke"} alt={item.title} />
          </div>
          
          <div className="modal-info">
            <div className="category-tag">{item.type}</div>
            <h2>{item.title}</h2>
            
            <div className="modal-meta">
              <span><Eye size={16} /> {item.views} visualizações</span>
              {item.createdAt && (
                <span><Calendar size={16} /> {new Date(item.createdAt.seconds * 1000).toLocaleDateString()}</span>
              )}
            </div>

            <div className="description-box">
              <h3>Descrição</h3>
              <p>{item.description}</p>
            </div>

            <div className="modal-actions">
              {item.type === "anime" ? (
                <button className="watch-btn" onClick={() => window.open(itemUrl || "#", "_blank")}>
                  <Zap size={20} /> Assista Já
                </button>
              ) : item.type === "manga" ? (
                <button className="watch-btn" style={{ background: "linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)" }} onClick={() => window.open(itemUrl || "#", "_blank")}>
                  <ExternalLink size={20} /> Ler Agora
                </button>
              ) : item.type === "news" ? (
                <button className="source-btn" onClick={() => window.open(itemUrl || "#", "_blank")}>
                  <ExternalLink size={20} /> Ver Matéria Completa
                </button>
              ) : (
                <button className="download-primary" onClick={() => onDownload(item)}>
                  <Download size={20} /> Baixar / Acessar Agora
                  <ExternalLink size={16} className="ext-icon" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ContentModal;
