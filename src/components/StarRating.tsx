import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          disabled={disabled}
          className="transition-colors"
        >
          <Star
            className={`w-6 h-6 ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
