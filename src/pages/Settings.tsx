import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { dreamApi } from "@/api/dream";
import { ArrowLeft, Download, Upload, Lock, LogOut } from "lucide-react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

interface SettingsProps {
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  onLock: () => void;
  isDarkMode?: boolean;
  user?: any;
}

const Settings: React.FC<SettingsProps> = ({ addToast, onLock, isDarkMode = false, user }) => {
  const navigate = useNavigate();
  const [pinEnabled, setPinEnabled] = useState(() =>
    localStorage.getItem("pinEnabled") === "true"
  );
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisablePinConfirm, setShowDisablePinConfirm] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      console.log("Export başlatılıyor...");
      const json = await dreamApi.exportJson();
      console.log("JSON alındı, dosya seçimi açılıyor...");
      const filePath = await save({
        defaultPath: "ruyagunluk-yedek.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (filePath) {
        console.log("Dosya yolu:", filePath);
        await writeTextFile(filePath, json);
        addToast("Rüyalar başarıyla dışarı aktarıldı", "success");
      }
    } catch (err) {
      console.error("Export hatası:", err);
      addToast("Rüyalar dışarı aktarılamadı: " + String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      console.log("Import başlatılıyor...");
      const filePath = await open({
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      console.log("Seçilen dosya:", filePath);
      if (filePath && typeof filePath === "string") {
        const json = await readTextFile(filePath);
        console.log("Dosya okundu, içe aktarılıyor...");
        const result = await dreamApi.importJson(json);
        addToast(
          `${result.imported} yeni, ${result.updated} güncellenen rüya içe aktarıldı`,
          "success"
        );
        navigate("/");
      }
    } catch (err) {
      console.error("Import hatası:", err);
      addToast("Rüyalar içe aktarılamadı: " + String(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPin = async () => {
    console.log("handleSetPin çağrıldı");
    if (!newPin || !confirmPin) {
      addToast("Lütfen tüm PIN alanlarını doldurun", "error");
      return;
    }

    if (newPin !== confirmPin) {
      addToast("PIN'ler eşleşmiyor", "error");
      return;
    }

    if (newPin.length < 4) {
      addToast("PIN en az 4 haneli olmalı", "error");
      return;
    }

    try {
      console.log("PIN hash'leniyor...");
      const hash = await dreamApi.hashPin(newPin);
      console.log("Hash alındı:", hash);
      localStorage.setItem("pinHash", hash);
      localStorage.setItem("pinEnabled", "true");
      setPinEnabled(true);
      setNewPin("");
      setConfirmPin("");
      addToast("PIN başarıyla ayarlandı", "success");
    } catch (err) {
      console.error("PIN hatası:", err);
      addToast("PIN ayarlanamadı: " + String(err), "error");
    }
  };

  const askDisablePinConfirm = () => {
    console.log("PIN kaldırma onayı isteniyor");
    setShowDisablePinConfirm(true);
  };

  const confirmDisablePin = () => {
    console.log("PIN kaldırılıyor");
    setShowDisablePinConfirm(false);
    localStorage.removeItem("pinHash");
    localStorage.setItem("pinEnabled", "false");
    setPinEnabled(false);
    addToast("PIN kilidi kaldırıldı", "success");
  };

  const cancelDisablePin = () => {
    console.log("PIN kaldırma iptal edildi");
    setShowDisablePinConfirm(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`border-b p-6 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-dream-600 hover:text-dream-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Geri
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Ayarlar</h1>
          </div>

          {/* Backup Section */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Download className="w-5 h-5" />
              Yedek & İçe Aktar
            </h2>
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              Tüm rüyalarınızı JSON dosyasına aktarın. Yedekleme veya transfer için.
              Önceden aktarılan rüyaları içe aktarın.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Dışarı Aktar
              </button>
              <button
                onClick={handleImport}
                disabled={loading}
                className="btn-secondary flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                İçe Aktar
              </button>
            </div>
          </div>

          {/* PIN Security Section */}
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Lock className="w-5 h-5" />
              PIN Kilidi
            </h2>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              Rüya günlüğünüze isteğe bağlı PIN koruması ekleyin. PIN, 
              güvenli hash kullanılarak yerel olarak saklanır.
            </p>

            {pinEnabled ? (
              <div className={`border rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'}`}>
                <p className={`font-medium ${isDarkMode ? 'text-green-400' : 'text-green-800'}`}>PIN kilidi etkin</p>
              </div>
            ) : (
              <div className={`border rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>
                  PIN kilidi şu anda devre dışı
                </p>
              </div>
            )}

            {!pinEnabled ? (
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                    Yeni PIN (4+ haneli)
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="PIN Girin"
                    className={`input-field w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                    maxLength={6}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                    PIN'i Onayla
                  </label>
                  <input
                    type="password"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="PIN'i Onayla"
                    className={`input-field w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleSetPin}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  PIN Kilidi Etkinleştir
                </button>
              </div>
            ) : (
              <button
                onClick={askDisablePinConfirm}
                className="btn-danger w-full flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Kaldır
              </button>
            )}
          </div>

          {/* Info Section */}
          <div className={`p-6 rounded-xl border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-slate-50 border-slate-300'}`}>
            <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Your Dream's🌙 Hakkında</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              v1.0.0 - Gizli, çevrimdışı ilk rüya günlüğü. Tüm veriler
              cihazınızda yerel olarak saklanır.
            </p>
          </div>
        </div>
      </div>

      {/* PIN Kaldırma Onay Modal */}
      {showDisablePinConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-red-500" />
            </div>
            <h3 className={`text-lg font-semibold text-center mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              PIN Kilidini Kaldır
            </h3>
            <p className={`text-center mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              PIN kilidini kaldırmak istediğinize emin misiniz? Uygulamanız artık şifre ile korunmayacak.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDisablePin}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                İptal
              </button>
              <button
                onClick={confirmDisablePin}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Kaldır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
