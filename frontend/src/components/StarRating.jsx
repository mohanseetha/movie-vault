import { Star } from "lucide-react";

function getStarType(stars, i) {
  if (stars >= i) return "full";
  if (stars >= i - 0.5) return "half";
  return "empty";
}

export default function StarRating({ value, size = 18, showText = true }) {
  const stars = Math.round((Number(value) || 0) * 2) / 2;
  const rating = value ? Number(value).toFixed(1) : "N/A";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => {
            const type = getStarType(stars, i);
            if (type === "full") {
              return (
                <Star
                  key={i}
                  className="text-yellow-400 fill-yellow-400 drop-shadow-sm"
                  size={size}
                />
              );
            }
            if (type === "half") {
              return (
                <span
                  key={i}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: size,
                    height: size,
                  }}
                >
                  <Star
                    className="text-yellow-400 fill-yellow-400 drop-shadow-sm"
                    size={size}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: size,
                      height: size,
                      clipPath: "inset(0 50% 0 0)",
                    }}
                  />
                  <Star
                    className="text-gray-500"
                    size={size}
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: size,
                      height: size,
                      clipPath: "inset(0 0 0 50%)",
                    }}
                  />
                </span>
              );
            }
            return <Star key={i} className="text-gray-500" size={size} />;
          })}
        </span>
        {showText && (
          <span className="text-white font-semibold text-sm bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {rating}
          </span>
        )}
      </div>
    </div>
  );
}
