import React, { useState } from "react";
import { X, Mail, Lock, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AuthModal.css";

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { loginWithEmail, registerWithEmail } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("Falha na autenticação. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal glass fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="auth-tabs">
          <button 
            className={`tab ${isLogin ? "active" : ""}`} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`tab ${!isLogin ? "active" : ""}`} 
            onClick={() => setIsLogin(false)}
          >
            Registro
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}</h2>
          <p>{isLogin ? "Entre para acessar seus favoritos e conteúdos." : "Junte-se à comunidade Pokezain."}</p>

          {error && <div className="error-msg">{error}</div>}

          <div className="input-group">
            <Mail size={20} />
            <input 
              type="email" 
              placeholder="E-mail" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <Lock size={20} />
            <input 
              type="password" 
              placeholder="Senha" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Processando..." : (
              isLogin ? <><LogIn size={20} /> Entrar</> : <><UserPlus size={20} /> Registrar</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
