import "@/styles/globals.css";
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import DreamDetail from "@/pages/DreamDetail";
import Settings from "@/pages/Settings";
import Header from "@/components/Header";
import PinLock from "@/components/PinLock";
import Toast from "@/components/Toast";
import { Dream } from "@/types/dream";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

const App: React.FC = () => {
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    // Uygulama başladığında PIN aktif mi diye kontrol et
    const isPinEnabled = localStorage.getItem("pinEnabled") === "true";
    return isPinEnabled;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  // Dark mode değiştiğinde HTML'e class ekle/kaldır
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleLock = () => {
    setIsLocked(true);
  };

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  if (isLocked) {
    return <PinLock onUnlock={handleUnlock} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  return (
    <Router>
      <div className={`flex flex-col h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        <Header onLock={handleLock} addToast={addToast} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route
              path="/"
              element={<Home addToast={addToast} isDarkMode={isDarkMode} />}
            />
            <Route
              path="/dream/:id"
              element={<DreamDetail addToast={addToast} isDarkMode={isDarkMode} />}
            />
            <Route
              path="/settings"
              element={<Settings addToast={addToast} onLock={handleLock} isDarkMode={isDarkMode} />}
            />
          </Routes>
        </div>
        <Toast toasts={toasts} />
      </div>
    </Router>
  );
};

export default App;
