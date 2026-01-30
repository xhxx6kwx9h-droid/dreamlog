import React, { useState } from "react";
import { Lock, Settings, LogOut, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onLock: () => void;
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  user?: any;
  onLogout?: () => void;
  onNotificationsClick?: () => void;
  unreadNotificationCount?: number;
}

const Header: React.FC<HeaderProps> = ({ onLock, addToast, isDarkMode, toggleDarkMode, user, onLogout, onNotificationsClick, unreadNotificationCount = 0 }) => {
  const navigate = useNavigate();
  const [showPinWarning, setShowPinWarning] = useState(false);

  const handleLockClick = () => {
    const isPinEnabled = localStorage.getItem("pinEnabled") === "true";
    const pinHash = localStorage.getItem("pinHash");
    
    if (!isPinEnabled || !pinHash) {
      // PIN belirlenmemiş, uyarı göster
      setShowPinWarning(true);
    } else {
      // PIN var, kilitle
      onLock();
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      addToast("Çıkış yapıldı", "success");
    }
  };

  const username = user?.user_metadata?.username || user?.email?.split("@")[0] || "Kullanıcı";

  return (
    <>
      <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Dream's🌙</h1>
              {user && (
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Hoşgeldin, <span className="font-semibold">{username}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all duration-300 text-2xl ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title={isDarkMode ? "Aydınlık Mod" : "Karanlık Mod"}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>
              {/* Notification Button */}
              {onNotificationsClick && (
                <button
                  onClick={onNotificationsClick}
                  className={`p-2 rounded-lg transition-colors relative ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-emerald-400' : 'text-gray-600 hover:bg-gray-100 hover:text-emerald-600'}`}
                  title="Bildirimler"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                    </span>
                  )}
                </button>
              )}
              {onLogout && (
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-red-400' : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'}`}
                  title="Çıkış Yap"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={handleLockClick}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Uygulamayı Kilitle"
              >
                <Lock className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
              <button
                onClick={() => navigate("/settings")}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                title="Ayarlar"
              >
                <Settings className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* PIN Uyarı Modal */}
      {showPinWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-amber-500" />
            </div>
            <h3 className={`text-lg font-semibold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              PIN Belirlenmemiş
            </h3>
            <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Uygulamayı kilitlemek için önce Ayarlar'dan bir PIN belirlemeniz gerekiyor.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPinWarning(false)}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                Kapat
              </button>
              <button
                onClick={() => {
                  setShowPinWarning(false);
                  navigate("/settings");
                }}
                className="flex-1 px-4 py-2 bg-dream-600 text-white rounded-lg hover:bg-dream-700 transition-colors"
              >
                Ayarlara Git
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
