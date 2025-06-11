import { MessageSquare } from "lucide-react";
import { Section, SectionHeading } from "./Section";
import ReviewCard from "./ReviewCard";

export function ReviewsSection({ reviews, loading, user, onLogMovie }) {
  const filteredReviews = (reviews || []).filter(
    (r) => r.review && r.review.trim().length > 0
  );

  return (
    <Section>
      <SectionHeading icon={MessageSquare} count={filteredReviews.length}>
        Reviews
      </SectionHeading>
      {loading ? (
        <ReviewsSkeleton />
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-6">
          {filteredReviews.map((review, index) => (
            <ReviewCard key={review.id || index} review={review} />
          ))}
        </div>
      ) : (
        <EmptyReviews user={user} onLogMovie={onLogMovie} />
      )}
    </Section>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white/10 rounded-xl p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-surface rounded-full"></div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-surface rounded"></div>
              <div className="w-16 h-3 bg-surface rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full h-3 bg-surface rounded"></div>
            <div className="w-3/4 h-3 bg-surface rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyReviews({ user, onLogMovie }) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">💬</div>
      <p className="text-text-soft text-lg mb-4">
        No reviews yet. Be the first to share your thoughts!
      </p>
      {user && (
        <button
          onClick={onLogMovie}
          className="px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium transition-colors"
        >
          Write a Review
        </button>
      )}
    </div>
  );
}
