import React, { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Filter, Trash2, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dream, ListDreamsFilter } from "@/types/dream";
import { dreamApi } from "@/api/dream";
import { supabase } from "@/api/supabase";
import DreamModal from "@/components/DreamModal";
import Calendar from "@/components/Calendar";

interface HomeProps {
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  isDarkMode?: boolean;
  user?: any;
}

type TabType = "my-dreams" | "shared-dreams";

const Home: React.FC<HomeProps> = ({ addToast, isDarkMode = false, user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("my-dreams");
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [filteredDreams, setFilteredDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const subscriptionRef = useRef<any>(null);

  // Rüyaları yükle
  const loadDreams = useCallback(async (query?: string, mood?: string) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const filters: ListDreamsFilter = {
        query: query || undefined,
        mood: mood || undefined,
      };
      const data = await dreamApi.listDreams(filters, user.id);
      setDreams(data);
      setFilteredDreams(data);
    } catch (err) {
      addToast("Rüyalar yüklenemedi", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [addToast, user?.id]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = supabase
      .channel("dreams-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dreams",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Real-time update:", payload);
          loadDreams(searchQuery, selectedMood);
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [user?.id, searchQuery, selectedMood, loadDreams]);

  // Başlangıçta yükle
  useEffect(() => {
    if (isInitialMount.current && user?.id) {
      isInitialMount.current = false;
      loadDreams(searchQuery, selectedMood);
    }
  }, [user?.id, loadDreams, searchQuery, selectedMood]);

  const handleSaveDream = async (dream: Dream) => {
    try {
      await dreamApi.upsertDream(dream);
      addToast(
        selectedDream ? "Rüya güncellendi" : "Rüya eklendi",
        "success"
      );
      setModalOpen(false);
      setSelectedDream(null);
    } catch (err) {
      addToast("Rüya kaydedilemedi", "error");
      console.error(err);
    }
  };

  const askDeleteConfirm = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    const id = deleteConfirm;
    setDeleteConfirm(null);
    
    try {
      await dreamApi.deleteDream(id);
      addToast("Rüya silindi", "success");
    } catch (err) {
      console.error("Silme hatası:", err);
      addToast("Rüya silinemedi: " + String(err), "error");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleEditDream = (dream: Dream) => {
    setSelectedDream(dream);
    setModalOpen(true);
  };

  const moods = ["happy", "sad", "scary", "romantic", "weird", "neutral"];
  const moodEmojis: { [key: string]: string } = {
    happy: "😊",
    sad: "😢",
    scary: "😨",
    romantic: "😍",
    weird: "🤪",
    neutral: "😐",
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Dream's🌙</h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Rüyaları paylaş ve keşfet</p>
        </div>
        <button
          onClick={() => {
            setSelectedDream(null);
            setModalOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Yeni Rüya
        </button>
      </div>

      {/* Tab Switcher */}
      <div className={`flex gap-4 mb-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setActiveTab("my-dreams")}
          className={`py-2 px-4 font-medium transition-colors ${
            activeTab === "my-dreams"
              ? `border-b-2 ${isDarkMode ? 'border-dream-400 text-dream-400' : 'border-dream-600 text-dream-600'}`
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          📖 Rüyalarım
        </button>
        <button
          onClick={() => setActiveTab("shared-dreams")}
          className={`py-2 px-4 font-medium transition-colors ${
            activeTab === "shared-dreams"
              ? `border-b-2 ${isDarkMode ? 'border-dream-400 text-dream-400' : 'border-dream-600 text-dream-600'}`
              : `${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          ✨ Paylaşılan Rüyalar
        </button>
      </div>

      {/* Arama ve Filtreler */}
      {activeTab === "my-dreams" && (
        <div className={`p-4 rounded-lg mb-6 shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className={`absolute left-3 top-3 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Rüya ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dream-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dream-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
              >
                <option value="">Tüm Ruh Halleri</option>
                {moods.map((mood) => (
                  <option key={mood} value={mood}>
                    {moodEmojis[mood]} {mood}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <Filter className="w-5 h-5" />
                Takvim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Takvim */}
      {showCalendar && activeTab === "my-dreams" && (
        <div className="mb-4">
          <Calendar 
            selectedDate={null}
            onDateSelect={() => {}}
            highlightedDates={dreams.map(d => d.occurredAt.split('T')[0])}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Rüyalar Listesi */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Rüyalar yükleniyor...</p>
          </div>
        ) : filteredDreams.length === 0 ? (
          <div className={`p-12 rounded-lg text-center shadow-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {activeTab === "my-dreams" ? "Henüz rüya kaydedilmemiş" : "Henüz paylaşılan rüya yok"}
            </p>
            {activeTab === "my-dreams" && (
              <button
                onClick={() => setModalOpen(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Başlasın!
              </button>
            )}
          </div>
        ) : (
          filteredDreams.map((dream) => (
            <div
              key={dream.id}
              className={`p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'}`}
              onClick={() => navigate(`/dream/${dream.id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {dream.title}
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(dream.occurredAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-2xl">{moodEmojis[dream.mood]}</div>
              </div>

              <p className={`line-clamp-2 mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{dream.content}</p>

              {dream.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {dream.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-dream-900 text-dream-200' : 'bg-blue-100 text-blue-700'}`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {dream.lucid && <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>Açık Rüya</span>}
                  <span>⭐ {dream.intensity}/10</span>
                </div>
                {activeTab === "my-dreams" && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleEditDream(dream);
                      }}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <Edit2 className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                    </button>
                    <button
                      onClick={(e) => askDeleteConfirm(e, dream.id)}
                      className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-red-900' : 'hover:bg-red-100'}`}
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rüya Modal */}
      <DreamModal
        dream={selectedDream}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDream(null);
        }}
        onSave={handleSaveDream}
        isDarkMode={isDarkMode}
      />

      {/* Silme Onay Modal */}
      {deleteConfirm && (
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
                onClick={cancelDelete}
                className={`px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
              >
                İptal
              </button>
              <button
                onClick={confirmDelete}
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

export default Home;
