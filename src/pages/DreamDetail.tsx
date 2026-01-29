import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Dream } from "@/types/dream";
import { dreamApi } from "@/api/dream";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";
import DreamModal from "@/components/DreamModal";

interface DreamDetailProps {
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  isDarkMode?: boolean;
}

const DreamDetail: React.FC<DreamDetailProps> = ({ addToast, isDarkMode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadDream = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await dreamApi.getDream(id);
      setDream(data);
      if (!data) {
        addToast("Rüya bulunamadı", "error");
        navigate("/");
      }
    } catch (err) {
      addToast("Rüya yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }, [id, addToast, navigate]);

  useEffect(() => {
    loadDream();
  }, [loadDream]);

  const handleSaveDream = async (updatedDream: Dream) => {
    try {
      const saved = await dreamApi.upsertDream(updatedDream);
      setDream(saved);
      addToast("Rüya güncellendi", "success");
    } catch (err) {
      addToast("Rüya kaydedilemedi", "error");
    }
  };

  const askDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!dream) return;
    setShowDeleteConfirm(false);
    try {
      await dreamApi.deleteDream(dream.id);
      addToast("Rüya silindi", "success");
      navigate("/");
    } catch (err) {
      addToast("Rüya silinemedi", "error");
    }
  };

  const getMoodEmoji = (mood: string): string => {
    const emojis: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      scary: "😨",
      romantic: "😍",
      weird: "🤨",
      neutral: "😐",
    };
    return emojis[mood] || "😐";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Yükleniyor...</p>
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>Rüya bulunamadı</p>
        <button onClick={() => navigate("/")} className="btn-primary">
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className={`border-b p-6 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-dream-600 hover:text-dream-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Geri
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              Düzenle
            </button>
            <button
              onClick={askDeleteConfirm}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Sil
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {dream.title}
                </h1>
                <span className="text-4xl">{getMoodEmoji(dream.mood)}</span>
              </div>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                {new Date(dream.occurredAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className={`grid grid-cols-3 gap-4 mb-8 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-slate-50'}`}>
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Ruh Hali</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {dream.mood.charAt(0).toUpperCase() + dream.mood.slice(1)}
                </p>
              </div>
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Yoğunluk</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={i < dream.intensity ? "text-yellow-400" : "text-slate-300"}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Bilinçli Rüya</p>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {dream.lucid ? "Evet" : "Hayır"}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                İçerik
              </h2>
              <p className={`leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                {dream.content}
              </p>
            </div>

            {dream.tags.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Etiketler
                </h2>
                <div className="flex flex-wrap gap-2">
                  {dream.tags.map((tag: string) => (
                    <span key={tag} className={`badge-tag ${isDarkMode ? 'bg-gray-700 text-dream-400' : ''}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className={`pt-6 border-t text-xs ${isDarkMode ? 'border-gray-700 text-gray-500' : 'border-slate-200 text-slate-500'}`}>
              <p>
                Oluşturulma: {new Date(dream.createdAt).toLocaleString("tr-TR")}
              </p>
              <p>
                Son güncelleme: {new Date(dream.updatedAt).toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DreamModal
        dream={dream}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDream}
        isDarkMode={isDarkMode}
      />

      {/* Silme Onay Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Rüyayı Sil
            </h3>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Bu rüyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamDetail;
