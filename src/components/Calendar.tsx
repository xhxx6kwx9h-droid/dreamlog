import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate?: string | null;
  onDateSelect?: (date: string) => void;
  highlightedDates: string[];
  isDarkMode?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate = null,
  onDateSelect = () => {},
  highlightedDates,
  isDarkMode,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthYear = currentDate.toLocaleDateString("tr-TR", {
    month: "short",
    year: "numeric",
  });

  const formatDate = (day: number): string => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return d.toISOString().split("T")[0];
  };

  const isHighlighted = (day: number): boolean => {
    return highlightedDates.includes(formatDate(day));
  };

  const isSelected = (day: number): boolean => {
    return selectedDate === formatDate(day);
  };

  return (
    <div className={`inline-block p-3 rounded-lg border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100'}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{monthYear}</span>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-slate-100'}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["P", "P", "S", "Ç", "P", "C", "C"].map((day, i) => (
          <div
            key={i}
            className={`text-center text-[10px] font-medium w-6 h-5 flex items-center justify-center ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => day && onDateSelect(formatDate(day))}
            className={`w-6 h-6 rounded text-xs font-medium transition-colors flex items-center justify-center ${
              day === null
                ? "cursor-default"
                : isSelected(day)
                  ? "bg-dream-600 text-white"
                  : isHighlighted(day)
                    ? isDarkMode 
                      ? "bg-dream-900/50 text-dream-400 hover:bg-dream-800/50"
                      : "bg-dream-100 text-dream-700 hover:bg-dream-200"
                    : isDarkMode
                      ? "text-gray-400 hover:bg-gray-700"
                      : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
