import { useState } from "react";
import { Star } from "lucide-react";

export default function InteractiveStarRating({
  rating,
  onRatingChange,
  size = 24,
}) {
  const [hovered, setHovered] = useState(null);

  function getHoverValue(e, star) {
    const { left, width } = e.target.getBoundingClientRect();
    const x = e.clientX - left;
    return x < width / 2 ? star - 0.5 : star;
  }

  function renderStar(star) {
    const value = hovered !== null ? hovered : rating;
    if (value >= star) return "full";
    if (value >= star - 0.5) return "half";
    return "empty";
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="transition-all duration-150 hover:scale-110 p-0 m-0 bg-transparent border-none"
          onMouseMove={(e) => setHovered(getHoverValue(e, star))}
          onMouseLeave={() => setHovered(null)}
          onClick={(e) => onRatingChange(getHoverValue(e, star))}
          style={{ lineHeight: 0 }}
        >
          <Star
            size={size}
            className={
              renderStar(star) === "full"
                ? "text-yellow-400 fill-yellow-400"
                : renderStar(star) === "half"
                ? "text-yellow-400"
                : "text-gray-400"
            }
            style={{
              position: "relative",
              display: "block",
              ...(renderStar(star) === "half"
                ? { clipPath: "inset(0 50% 0 0)" }
                : {}),
            }}
          />
          {renderStar(star) === "half" && (
            <Star
              size={size}
              className="text-gray-400"
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                clipPath: "inset(0 0 0 50%)",
                pointerEvents: "none",
              }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
