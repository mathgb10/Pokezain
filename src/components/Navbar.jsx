import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Bell, User, LogOut, Menu, X, ShieldCheck, LogIn, Sun, Moon } from "lucide-react";
import AuthModal from "./AuthModal";
import NotificationsDropdown from "./NotificationsDropdown";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "../firebase";
import "./Navbar.css";

const Navbar = ({ navigateTo, currentView }) => {
  const { user, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-profile-container")) {
        setIsUserMenuOpen(false);
      }
      if (isNotifOpen && !event.target.closest(".notification-bell")) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, isNotifOpen]);

  const handleNavClick = (page) => {
    navigateTo(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar glass">
      <div className="container nav-content">
        <div onClick={() => handleNavClick("home")} className="logo" style={{ cursor: 'pointer' }}>
          <span className="logo-poke">Poke</span>
          <span className="logo-zain">zain</span>
        </div>

        <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <button className={`nav-link-btn ${currentView === 'pokedex' ? 'active' : ''}`} onClick={() => handleNavClick("pokedex")}>Pokedex</button>
          <button className={`nav-link-btn ${currentView === 'noticias' ? 'active' : ''}`} onClick={() => handleNavClick("noticias")}>Notícias</button>
          <button className={`nav-link-btn ${currentView === 'roms' ? 'active' : ''}`} onClick={() => handleNavClick("roms")}>ROMs</button>
          <button className={`nav-link-btn ${currentView === 'emuladores' ? 'active' : ''}`} onClick={() => handleNavClick("emuladores")}>Emuladores</button>
          <button className={`nav-link-btn ${currentView === 'minecraft' ? 'active' : ''}`} onClick={() => handleNavClick("minecraft")}>Minecraft</button>
          <button className={`nav-link-btn ${currentView === 'anime' ? 'active' : ''}`} onClick={() => handleNavClick("anime")}>Animes</button>
          <button className={`nav-link-btn ${currentView === 'manga' ? 'active' : ''}`} onClick={() => handleNavClick("manga")}>Mangás</button>
          
          {isAdmin && (
            <button className={`nav-link-btn admin-link ${currentView === 'admin' ? 'active' : ''}`} onClick={() => handleNavClick("admin")}>
              <ShieldCheck size={18} /> Admin
            </button>
          )}
        </div>

        <div className="nav-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Alternar Tema">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="notification-bell">
            <button className="icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
            </button>
            <NotificationsDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {user ? (
            <div className="user-profile-container">
              <button className="user-profile-btn" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="Profile" className="avatar" />
              </button>
              
              {isUserMenuOpen && (
                <div className="user-dropdown glass fade-in" style={{ zIndex: 10001 }}>
                  <div className="user-info-dropdown">
                    <p className="user-name">{user.displayName || "Treinador"}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation();
                      logout(); 
                      setIsUserMenuOpen(false); 
                    }} 
                    className="dropdown-item logout"
                  >
                    <LogOut size={16} /> Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="login-btn glass">
              <LogIn size={18} /> Entrar
            </button>
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
