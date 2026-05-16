import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Bell, User, LogOut, Menu, X, ShieldCheck, LogIn, Sun, Moon } from "lucide-react";
import AuthModal from "./AuthModal";
import NotificationsDropdown from "./NotificationsDropdown";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const q = query(collection(db, "notifications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const unread = snapshot.docs.filter(doc => !doc.data().readBy?.includes(user.uid)).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="logo">
          <span className="logo-poke">Poke</span>
          <span className="logo-zain">zain</span>
        </Link>

        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <Link to="/pokedex" onClick={() => setIsMenuOpen(false)}>Pokedex</Link>
          <Link to="/noticias" onClick={() => setIsMenuOpen(false)}>Notícias</Link>
          <Link to="/roms" onClick={() => setIsMenuOpen(false)}>ROMs</Link>
          <Link to="/emuladores" onClick={() => setIsMenuOpen(false)}>Emuladores</Link>
          <Link to="/minecraft" onClick={() => setIsMenuOpen(false)}>Minecraft</Link>
          <Link to="/anime" onClick={() => setIsMenuOpen(false)}>Animes</Link>
          <Link to="/manga" onClick={() => setIsMenuOpen(false)}>Mangás</Link>
          
          {isAdmin && (
            <Link to="/admin" className="admin-link" onClick={() => setIsMenuOpen(false)}>
              <ShieldCheck size={18} /> Admin
            </Link>
          )}
        </div>

        <div className="nav-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Alternar Tema">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="notification-bell" onClick={() => setIsNotifOpen(!isNotifOpen)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
            <NotificationsDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {user ? (
            <div className="user-profile">
              <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Profile" className="avatar" />
              <button onClick={logout} className="logout-btn" title="Sair">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="login-btn glass">
              <LogIn size={18} /> Entrar
            </Link>
          )}

          <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;
