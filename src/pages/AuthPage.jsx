import React, { useState } from "react";
import { Mail, Lock, UserPlus, LogIn, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./AuthPage.css";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

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
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Falha na autenticação. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container glass fade-in">
        <Link to="/" className="back-link">
          <ChevronLeft size={20} /> Voltar para Home
        </Link>

        <div className="auth-header">
          <div className="logo-small">
            <span className="logo-poke">Poke</span>
            <span className="logo-zain">zain</span>
          </div>
          <h1>{isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}</h1>
          <p>{isLogin ? "Acesse sua conta para ver seus favoritos." : "Junte-se à maior comunidade Pokémon do Brasil."}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? "active" : ""}`} 
            onClick={() => setIsLogin(true)}
          >
            Entrar
          </button>
          <button 
            className={`auth-tab ${!isLogin ? "active" : ""}`} 
            onClick={() => setIsLogin(false)}
          >
            Registrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-dedicated">
          {error && <div className="error-msg">{error}</div>}

          <div className="input-field glass">
            <Mail size={20} />
            <input 
              type="email" 
              placeholder="Seu melhor e-mail" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-field glass">
            <Lock size={20} />
            <input 
              type="password" 
              placeholder="Sua senha secreta" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Processando..." : (
              isLogin ? <><LogIn size={20} /> Entrar na Conta</> : <><UserPlus size={20} /> Criar Minha Conta</>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Ainda não tem conta?" : "Já possui uma conta?"}
            <button onClick={() => setIsLogin(!isLogin)} className="switch-btn">
              {isLogin ? "Registrar-se agora" : "Fazer Login"}
            </button>
          </p>
        </div>
      </div>
      
      <div className="auth-background">
        <motion.div 
          className="blob blob-1"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        ></motion.div>
        <motion.div 
          className="blob blob-2"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        ></motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
