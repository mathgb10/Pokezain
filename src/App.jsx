import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Pokedex from "./pages/Pokedex";
import Admin from "./pages/Admin";
import ContentPage from "./pages/ContentPage";
import AuthPage from "./pages/AuthPage";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pokedex" element={<Pokedex />} />
              <Route path="/noticias" element={<ContentPage type="news" title="Notícias Pokémon" />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/roms" element={<ContentPage type="rom" title="ROMs Fan-made" />} />
              <Route path="/emuladores" element={<ContentPage type="emulator" title="Emuladores" />} />
              <Route path="/anime" element={<ContentPage type="anime" title="Animes Pokémon" />} />
              <Route path="/manga" element={<ContentPage type="manga" title="Mangás Pokémon" />} />
              <Route path="/minecraft" element={<ContentPage type="minecraft" title="Mods de Minecraft" />} />
              <Route path="/auth" element={<AuthPage />} />
              {/* Adicionar outras rotas conforme o desenvolvimento */}
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  </AuthProvider>
  );
}

export default App;
