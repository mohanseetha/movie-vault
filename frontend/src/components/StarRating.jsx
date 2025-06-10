import { Star } from "lucide-react";

export default function StarRating({ value, size = 18, showText = true }) {
  const stars = Math.round((value / 10) * 5 * 2) / 2;
  const rating = value ? ((value / 10) * 5).toFixed(1) : "N/A";
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) =>
          stars >= i ? (
            <Star
              key={i}
              className="text-yellow-400 fill-yellow-400 drop-shadow-sm"
              size={size}
            />
          ) : stars >= i - 0.5 ? (
            <Star
              key={i}
              className="text-yellow-400 fill-yellow-400/50 drop-shadow-sm"
              size={size}
            />
          ) : (
            <Star key={i} className="text-gray-500" size={size} />
          )
        )}
      </span>
      {showText && (
        <span className="text-white font-semibold text-sm bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {rating}/5
        </span>
      )}
    </div>
  );
}
