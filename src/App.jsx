import React, { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pokedex from "./pages/Pokedex";
import Admin from "./pages/Admin";
import ContentPage from "./pages/ContentPage";
import "./index.css";

function App() {
  const [view, setView] = useState("home");
  const [contentTitle, setContentTitle] = useState("");
  const [contentType, setContentType] = useState("");

  const navigateTo = (page, type = "", title = "") => {
    setView(page);
    setContentType(type);
    setContentTitle(title);
    window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (view) {
      case "home":
        return <Home navigateTo={navigateTo} />;
      case "pokedex":
        return <Pokedex />;
      case "admin":
        return <Admin />;
      case "noticias":
        return <ContentPage type="news" title="Notícias Pokémon" />;
      case "roms":
        return <ContentPage type="rom" title="ROMs Fan-made" />;
      case "emuladores":
        return <ContentPage type="emulator" title="Emuladores" />;
      case "anime":
        return <ContentPage type="anime" title="Animes Pokémon" />;
      case "manga":
        return <ContentPage type="manga" title="Mangás Pokémon" />;
      case "minecraft":
        return <ContentPage type="minecraft" title="Mods de Minecraft" />;
      case "content":
        return <ContentPage type={contentType} title={contentTitle} />;
      default:
        return <Home navigateTo={navigateTo} />;
    }
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="app-wrapper">
          <Navbar navigateTo={navigateTo} currentView={view} />
          <main className="content">
            {renderView()}
          </main>
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
