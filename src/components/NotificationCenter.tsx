import React, { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";
import { dreamApi } from "@/api/dream";

interface Notification {
  id: string;
  sharedBy: string;
  dreamId: string;
  dreamTitle: string;
  dreamMood: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  user?: any;
  onMarkAsRead?: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  isDarkMode = false,
  user,
  onMarkAsRead,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const moodEmojis: Record<string, string> = {
    happy: "😊",
    sad: "😢",
    scary: "😨",
    romantic: "😍",
    weird: "🤨",
    neutral: "😐",
  };

  useEffect(() => {
    if (isOpen && user?.id) {
      loadNotifications();
    }
  }, [isOpen, user?.id]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await dreamApi.getNotifications(user?.id);
      setNotifications(data);
      // Mark all as read
      await dreamApi.markAllNotificationsAsRead(user?.id);
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onMarkAsRead?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`rounded-xl max-w-md w-full mx-4 shadow-2xl max-h-96 overflow-hidden flex flex-col ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header */}
        <div
          className={`border-b p-4 flex items-center justify-between ${
            isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Bildirimler
            </h3>
          </div>
          <button
            onClick={handleClose}
            className={`text-xl font-bold ${
              isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div
          className={`flex-1 overflow-y-auto ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {loading ? (
            <div className="p-6 text-center">
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                Yükleniyor...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                Bildirim yok
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-opacity-50 transition-colors ${
                    !notif.isRead
                      ? isDarkMode
                        ? "bg-emerald-900 bg-opacity-20"
                        : "bg-emerald-50"
                      : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {moodEmojis[notif.dreamMood]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {notif.sharedBy} bir rüya paylaştı
                      </p>
                      <p
                        className={`text-sm truncate ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {notif.dreamTitle}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isDarkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {new Date(notif.createdAt).toLocaleDateString("tr-TR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
