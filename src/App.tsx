import "@/styles/globals.css";
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "@/pages/Home";
import DreamDetail from "@/pages/DreamDetail";
import Settings from "@/pages/Settings";
import Auth from "@/pages/Auth";
import Header from "@/components/Header";
import PinLock from "@/components/PinLock";
import Toast from "@/components/Toast";
import NotificationCenter from "@/components/NotificationCenter";
import { authService } from "@/api/supabase";
import { Dream } from "@/types/dream";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface AppContentProps {
  user: any;
  isLoadingAuth: boolean;
  isLocked: boolean;
  isDarkMode: boolean;
  showNotificationCenter: boolean;
  unreadNotificationCount: number;
  toasts: Toast[];
  onLock: () => void;
  toggleDarkMode: () => void;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  setShowNotificationCenter: (show: boolean) => void;
  setUnreadNotificationCount: (count: number) => void;
}

const AppContent: React.FC<AppContentProps> = ({
  user,
  isLoadingAuth,
  isLocked,
  isDarkMode,
  showNotificationCenter,
  unreadNotificationCount,
  toasts,
  onLock,
  toggleDarkMode,
  addToast,
  setShowNotificationCenter,
  setUnreadNotificationCount,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Login sonrası ana sayfaya git
  useEffect(() => {
    if (user && !isLoadingAuth) {
      // User login olmuş, her zaman home'a git
      navigate("/", { replace: true });
    }
  }, [user, isLoadingAuth, navigate]);

  if (isLoadingAuth) {
    return (
      <div className={`flex items-center justify-center w-screen h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-dream-900 to-dream-700'}`}>
        <p className="text-white text-lg">Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Auth 
        onAuthSuccess={() => {
          // Auth başarılı - state update trigger et
          // AppContent re-render olacak ve user update olmuş olacak
        }} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
    );
  }

  if (isLocked) {
    return <PinLock onUnlock={() => { onLock(); }} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      <Header 
        onLock={onLock} 
        addToast={addToast} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
        user={user} 
        onLogout={() => {
          authService.signOut();
        }}
        onNotificationsClick={() => setShowNotificationCenter(true)}
        unreadNotificationCount={unreadNotificationCount}
      />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={<Home addToast={addToast} isDarkMode={isDarkMode} user={user} onUnreadCountChange={setUnreadNotificationCount} />}
          />
          <Route
            path="/dream/:id"
            element={<DreamDetail addToast={addToast} isDarkMode={isDarkMode} user={user} />}
          />
          <Route
            path="/settings"
            element={<Settings addToast={addToast} onLock={onLock} isDarkMode={isDarkMode} user={user} />}
          />
        </Routes>
      </div>
      <Toast toasts={toasts} />
      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
        isDarkMode={isDarkMode}
        user={user}
        onMarkAsRead={() => setUnreadNotificationCount(0)}
      />
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const isPinEnabled = localStorage.getItem("pinEnabled") === "true";
    return isPinEnabled;
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // Auth durumunu kontrol et
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();

    // Auth state değişikliklerini dinle
    const { unsubscribe } = authService.onAuthStateChange((authUser) => {
      setUser(authUser);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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

  if (isLoadingAuth) {
    return (
      <div className={`flex items-center justify-center w-screen h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-dream-900 to-dream-700'}`}>
        <p className="text-white text-lg">Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => {
      // Auth successful olunca, auth state'i refresh et
      authService.getCurrentUser().then(setUser);
    }} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  if (isLocked) {
    return <PinLock onUnlock={handleUnlock} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  return (
    <Router>
      <AppContent
        user={user}
        isLoadingAuth={isLoadingAuth}
        isLocked={isLocked}
        isDarkMode={isDarkMode}
        showNotificationCenter={showNotificationCenter}
        unreadNotificationCount={unreadNotificationCount}
        toasts={toasts}
        onLock={handleLock}
        toggleDarkMode={toggleDarkMode}
        addToast={addToast}
        setShowNotificationCenter={setShowNotificationCenter}
        setUnreadNotificationCount={setUnreadNotificationCount}
      />
    </Router>
  );
};

export default App;
