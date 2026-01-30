import React, { useState } from "react";
import { authService } from "@/api/supabase";
import { Lock } from "lucide-react";

interface AuthProps {
  onAuthSuccess: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, isDarkMode = false, toggleDarkMode }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError("Kullanıcı adı boş olamaz");
          setLoading(false);
          return;
        }
        await authService.signUp(email, password, username);
        setError("Kayıt başarılı! Lütfen e-mailini doğrula ve giriş yap.");
        setIsSignUp(false);
      } else {
        await authService.signIn(email, password);
        onAuthSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
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

      <div className={`p-8 max-w-md w-full mx-4 rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-center mb-6">
          <Lock className="w-12 h-12 text-dream-600" />
        </div>
        <h1 className={`text-2xl font-bold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Your Dream's🌙
        </h1>
        <p className={`text-center mb-8 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
          {isSignUp ? "Hesap Oluştur" : "Giriş Yap"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Örn: Mina"
                disabled={loading}
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dream-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-slate-300'}`}
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dream-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-slate-300'}`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-dream-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-slate-300'}`}
            />
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm ${isDarkMode ? 'bg-red-900/50 border border-red-700 text-red-300' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Bekle..." : isSignUp ? "Hesap Oluştur" : "Giriş Yap"}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className={`w-full py-2 rounded-lg transition-colors ${isDarkMode ? 'text-dream-400 hover:text-dream-300' : 'text-dream-600 hover:text-dream-700'}`}
          >
            {isSignUp ? "Zaten hesabım var" : "Hesap oluştur"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
