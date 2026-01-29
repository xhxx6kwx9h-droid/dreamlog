import React, { useState } from "react";
import { Lock } from "lucide-react";
import { dreamApi } from "@/api/dream";

interface PinLockProps {
  onUnlock: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const PinLock: React.FC<PinLockProps> = ({ onUnlock, isDarkMode = false, toggleDarkMode }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const storedHash = localStorage.getItem("pinHash");
      if (!storedHash) {
        setError("PIN yapılandırılmadı");
        setLoading(false);
        return;
      }

      if (!pin || pin.length < 4) {
        setError("PIN en az 4 haneli olmalı");
        setLoading(false);
        return;
      }

      const isValid = await dreamApi.verifyPin(pin, storedHash);
      if (isValid) {
        onUnlock();
      } else {
        setError("Geçersiz PIN");
        setPin("");
      }
    } catch (err) {
      console.error("PIN verification error:", err);
      setError("PIN doğrulanırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center w-full h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-dream-900 to-dream-700'}`}>
      {/* Dark Mode Toggle */}
      {toggleDarkMode && (
        <button
          onClick={toggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-lg text-2xl hover:bg-white/10 transition-colors"
          title={isDarkMode ? "Aydınlık Mod" : "Karanlık Mod"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
      )}
      
      <div className={`p-8 max-w-sm w-full mx-4 rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-center mb-6">
          <Lock className="w-12 h-12 text-dream-600" />
        </div>
        <h1 className={`text-2xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Your Dream's🌙
        </h1>
        <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          Kilidi açmak için PIN'inizi girin
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN Girin"
              className={`w-full text-center text-2xl tracking-widest px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dream-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-slate-300'}`}
              maxLength={6}
              disabled={loading}
            />
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-red-900/50 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!pin || loading}
            className="btn-primary w-full"
          >
            {loading ? "Doğrulanıyor..." : "Kilidi Aç"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PinLock;
