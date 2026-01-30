import React, { useState, useEffect } from "react";
import { Dream, Mood } from "@/types/dream";
import { X } from "lucide-react";
import StarRating from "./StarRating";
import { v4 as uuidv4 } from "uuid";

interface DreamModalProps {
  dream?: Dream | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dream: Dream) => Promise<void>;
  onSuccess?: () => void;
  isDarkMode?: boolean;
}

const DreamModal: React.FC<DreamModalProps> = ({
  dream,
  isOpen,
  onClose,
  onSave,
  onSuccess,
  isDarkMode,
}) => {
  const [formData, setFormData] = useState<Dream>({
    id: "",
    title: "",
    occurredAt: new Date().toISOString(),
    content: "",
    tags: [],
    mood: "neutral",
    intensity: 3,
    lucid: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dream) {
      setFormData(dream);
    } else {
      setFormData({
        id: uuidv4(),
        title: "",
        occurredAt: new Date().toISOString(),
        content: "",
        tags: [],
        mood: "neutral",
        intensity: 3,
        lucid: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [dream, isOpen]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t: string) => t !== tag),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Başlık ve içerik gerekli");
      return;
    }

    setLoading(true);
    try {
      const updatedDream = {
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      await onSave(updatedDream);
      onSuccess?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const moods: Mood[] = ["happy", "sad", "scary", "romantic", "weird", "neutral"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className={`rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-slate-200 bg-white'}`}>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {dream ? "Rüyayı Düzenle" : "Yeni Rüya"}
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              Başlık *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Rüyanıza bir başlık verin"
              className={`input-field w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Tarih & Saat *
              </label>
              <input
                type="datetime-local"
                value={formData.occurredAt.slice(0, 16)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    occurredAt: new Date(e.target.value).toISOString(),
                  })
                }
                className={`input-field w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Ruh Hali
              </label>
              <select
                value={formData.mood}
                onChange={(e) =>
                  setFormData({ ...formData, mood: e.target.value as Mood })
                }
                className={`input-field w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              >
                <option value="happy">Mutlu</option>
                <option value="sad">Üzgün</option>
                <option value="scary">Korkunç</option>
                <option value="romantic">Romantik</option>
                <option value="weird">Garip</option>
                <option value="neutral">Nötr</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Yoğunluk
              </label>
              <StarRating
                value={formData.intensity}
                onChange={(v) => setFormData({ ...formData, intensity: v })}
              />
            </div>

            <div>
              <label className={`flex items-center gap-3 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                <input
                  type="checkbox"
                  checked={formData.lucid}
                  onChange={(e) =>
                    setFormData({ ...formData, lucid: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300"
                />
                Bilinçli Rüya
              </label>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              İçerik *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="Rüyanızı açıklayın..."
              rows={6}
              className={`input-field w-full resize-none ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              Etiketler
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Etiket ekleyin..."
                className={`input-field flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-secondary"
              >
                Ekle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag: string) => (
                <div
                  key={tag}
                  className={`badge-tag flex items-center gap-2 pr-2 ${isDarkMode ? 'bg-gray-700 text-dream-400' : ''}`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className={`${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              İptal Et
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : "Rüyayı Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DreamModal;
