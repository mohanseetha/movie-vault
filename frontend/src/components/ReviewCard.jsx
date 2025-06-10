import { User } from "lucide-react";
import InteractiveStarRating from "./InteractiveStarRating";

export default function ReviewCard({ review }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-surface/30 hover:border-accent/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-full flex items-center justify-center">
            <User size={18} className="text-accent" />
          </div>
          <div>
            <p className="font-medium text-text-main">{review.username}</p>
            <p className="text-text-soft text-sm">
              {new Date(
                review.watched_date || review.created_at
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <InteractiveStarRating
            rating={review.rating}
            onRatingChange={() => {}}
            size={14}
          />
        </div>
      </div>
      {review.review && (
        <p className="text-text-main leading-relaxed">{review.review}</p>
      )}
    </div>
  );
}
