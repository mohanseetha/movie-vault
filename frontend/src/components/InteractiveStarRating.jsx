import { useState } from "react";
import { Star } from "lucide-react";

export default function InteractiveStarRating({
  rating,
  onRatingChange,
  size = 24,
}) {
  const [hoveredRating, setHoveredRating] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="transition-all duration-150 hover:scale-110"
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => onRatingChange(star)}
        >
          <Star
            size={size}
            className={`transition-colors duration-150 ${
              star <= (hoveredRating || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
