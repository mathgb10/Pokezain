import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase";
import { collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { 
  Search, FilePlus, CheckCircle, Upload, AlertTriangle, Edit2, Trash2, 
  ImageIcon, Loader2, BarChart3, TrendingUp 
} from "lucide-react";
import "./Admin.css";

const Admin = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, add, manage
  const [contentList, setContentList] = useState([]);
  const [fetchingContent, setFetchingContent] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ totalItems: 0, totalViews: 0, byType: {} });
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "rom",
    url: "",
    imageUrl: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageType, setImageType] = useState("url"); // url, file
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);

  React.useEffect(() => {
    if (activeTab === "manage") {
      fetchContent();
    }
  }, [activeTab]);

  const fetchContent = async () => {
    setFetchingContent(true);
    try {
      const querySnapshot = await getDocs(collection(db, "content"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContentList(data);
      
      // Calculate stats
      const totalViews = data.reduce((acc, curr) => acc + (curr.views || 0), 0);
      const byType = data.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {});
      setStats({ totalItems: data.length, totalViews, byType });
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingContent(false);
    }
  };

  React.useEffect(() => {
    fetchContent();
  }, []);

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteDoc(doc(db, "content", itemToDelete.id));
      if (itemToDelete.imageUrl && itemToDelete.imageUrl.includes("firebasestorage")) {
        try {
          const imageRef = ref(storage, itemToDelete.imageUrl);
          await deleteObject(imageRef);
        } catch (e) { console.error("Erro ao deletar imagem:", e); }
      }
      setContentList(contentList.filter(i => i.id !== itemToDelete.id));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      type: item.type,
      url: item.url || item.downloadUrl || "",
      imageUrl: item.imageUrl || ""
    });
    setEditingId(item.id);
    setImageType("url");
    setImageFile(null);
    setActiveTab("add");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      if (imageType === "file" && imageFile) {
        const storageRef = ref(storage, `content/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const contentData = {
        ...formData,
        imageUrl: finalImageUrl,
        views: editingId ? (contentList.find(i => i.id === editingId)?.views || 0) : 0,
        updatedAt: serverTimestamp()
      };

      if (!editingId) {
        contentData.createdAt = serverTimestamp();
        contentData.views = 0;
        await addDoc(collection(db, "content"), contentData);
        
        await addDoc(collection(db, "notifications"), {
          message: `Novo conteúdo em ${formData.type}: ${formData.title}`,
          createdAt: serverTimestamp(),
          readBy: []
        });
      } else {
        await updateDoc(doc(db, "content", editingId), contentData);
      }

      setSuccess(true);
      setFormData({ title: "", description: "", type: "rom", url: "", imageUrl: "" });
      setImageFile(null);
      setEditingId(null);
      setTimeout(() => setSuccess(false), 4000);
      if (editingId) {
        setActiveTab("manage");
        setImageType("url");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar conteúdo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return (
    <div className="container" style={{padding: "100px 0", textAlign: "center"}}>
      <AlertTriangle size={60} color="#ff5350" style={{marginBottom: "20px"}} />
      <h1>Acesso Negado</h1>
      <p>Você não tem permissão para acessar esta página. Apenas mestres administradores podem entrar aqui.</p>
    </div>
  );

  const filteredContent = contentList.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-page container fade-in">
      <div className="admin-header">
        <h1>Painel do Mestre Pokémon</h1>
        <p>Gerencie as ROMs, Emuladores, Mods, Notícias e mais.</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 size={20} /> Dashboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('add');
            if (!editingId) setFormData({ title: "", description: "", type: "rom", url: "", imageUrl: "" });
          }}
        >
          <FilePlus size={20} /> {editingId ? "Editar Conteúdo" : "Adicionar Conteúdo"}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          <CheckCircle size={20} /> Gerenciar Existentes
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "dashboard" ? (
          <div className="admin-dashboard fade-in">
            <div className="stats-grid-admin">
              <div className="stat-card-admin glass">
                <FilePlus size={24} />
                <div className="stat-info">
                  <h3>{stats.totalItems}</h3>
                  <p>Total de Conteúdos</p>
                </div>
              </div>
              <div className="stat-card-admin glass">
                <TrendingUp size={24} />
                <div className="stat-info">
                  <h3>{Object.keys(stats.byType).reduce((a, b) => stats.byType[a] > stats.byType[b] ? a : b, "N/A")}</h3>
                  <p>Categoria Principal</p>
                </div>
              </div>
              <div className="stat-card-admin glass">
                <Upload size={24} />
                <div className="stat-info">
                  <h3>{stats.totalViews}</h3>
                  <p>Visualizações Totais</p>
                </div>
              </div>
            </div>

            <div className="dashboard-charts glass">
              <h3>Distribuição por Categoria</h3>
              <div className="category-stats">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="category-stat-item">
                    <span className={`type-badge-mini ${type}`}>{type}</span>
                    <div className="stat-bar-container-admin">
                      <div 
                        className="stat-bar-admin" 
                        style={{ width: `${(count / stats.totalItems) * 100}%` }}
                      ></div>
                    </div>
                    <span className="count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === "add" ? (
          <form className="admin-form glass" onSubmit={handleSubmit}>
            <h2>{editingId ? "Editando Conteúdo" : "Novo Conteúdo"}</h2>
            <div className="form-group">
              <label>Título do Conteúdo</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: Pokémon Fire Red v1.1"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Categoria</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="rom">Fan-made ROM</option>
                  <option value="emulator">Emulador</option>
                  <option value="minecraft">Mod Minecraft</option>
                  <option value="anime">Anime</option>
                  <option value="manga">Mangá</option>
                  <option value="news">Notícias</option>
                </select>
              </div>
              <div className="form-group">
                <label>Link (Download ou Link Externo)</label>
                <input 
                  type="url" 
                  required 
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrição Detalhada</label>
              <textarea 
                required 
                rows="4"
                placeholder="Descreva o que este conteúdo oferece..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <div className="form-group">
              <label>Imagem de Capa</label>
              <div className="image-type-selector">
                <button 
                  type="button" 
                  className={`type-option ${imageType === 'url' ? 'active' : ''}`}
                  onClick={() => setImageType('url')}
                >
                  Link da Web
                </button>
                <button 
                  type="button" 
                  className={`type-option ${imageType === 'file' ? 'active' : ''}`}
                  onClick={() => setImageType('file')}
                >
                  Upload de Arquivo
                </button>
              </div>

              {imageType === "url" ? (
                <input 
                  type="url" 
                  required={imageType === "url"} 
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              ) : (
                <div className="file-input-wrapper glass">
                  <ImageIcon size={24} />
                  <span>{imageFile ? imageFile.name : "Selecionar PNG/JPG..."}</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    required={imageType === "file" && !editingId}
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </div>
              )}
            </div>

            <div className="admin-form-actions">
              {editingId && (
                <button type="button" className="cancel-btn" onClick={() => {
                  setEditingId(null);
                  setFormData({ title: "", description: "", type: "rom", url: "", imageUrl: "" });
                  setImageFile(null);
                  setImageType("url");
                  setActiveTab("manage");
                }}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Processando..." : (
                  <>
                    <Upload size={20} /> {editingId ? "Salvar Alterações" : "Publicar na Plataforma"}
                  </>
                )}
              </button>
            </div>

            {success && (
              <div className="success-msg">
                <CheckCircle size={20} /> {editingId ? "Conteúdo atualizado!" : "Conteúdo publicado com sucesso!"}
              </div>
            )}
          </form>
        ) : (
          <div className="manage-section glass">
            <div className="manage-header">
              <h2>Conteúdos Publicados</h2>
              <div className="manage-search glass">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Filtrar por título ou categoria..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {fetchingContent ? (
              <div className="loading-state">
                <Loader2 className="spinner" size={30} />
                <p>Carregando conteúdos...</p>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Tipo</th>
                      <th>Views</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContent.map(item => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td><span className={`type-badge-mini ${item.type}`}>{item.type}</span></td>
                        <td>{item.views || 0}</td>
                        <td>{item.createdAt?.toDate()?.toLocaleDateString() || "N/A"}</td>
                        <td className="actions-cell">
                          <button className="edit-btn" onClick={() => handleEdit(item)}><Edit2 size={16} /></button>
                          <button className="delete-btn" onClick={() => confirmDelete(item)}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                    {filteredContent.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{textAlign: "center", padding: "40px"}}>Nenhum conteúdo encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteModalOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="alert-modal glass" onClick={e => e.stopPropagation()} style={{ padding: '30px', maxWidth: '400px', width: '90%', textAlign: 'center', borderRadius: '20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px' }}>🗑️</div>
            <h3 style={{ marginBottom: '10px' }}>Confirmar Exclusão</h3>
            <p style={{ opacity: 0.8, marginBottom: '25px', lineHeight: '1.5' }}>Tem certeza que deseja excluir o conteúdo "{itemToDelete?.title}"? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--text-main)', cursor: 'pointer', flex: 1 }}>Cancelar</button>
              <button onClick={executeDelete} style={{ padding: '10px 20px', borderRadius: '10px', background: '#ff5350', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
