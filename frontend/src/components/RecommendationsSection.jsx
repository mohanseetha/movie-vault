import { Star } from "lucide-react";
import { Section, SectionHeading } from "./Section";
import MovieCarousel from "./MovieCarousel";

export function RecommendationsSection({ recommendations, loading }) {
  return (
    <Section>
      <SectionHeading icon={Star}>You Might Also Like</SectionHeading>
      {loading ? (
        <RecommendationsSkeleton />
      ) : recommendations.length > 0 ? (
        <MovieCarousel movies={recommendations} title="" />
      ) : (
        <EmptyRecommendations />
      )}
    </Section>
  );
}

function RecommendationsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex-none w-48 h-72 bg-white/10 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}

function EmptyRecommendations() {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">🔍</div>
      <p className="text-text-soft text-lg">
        No recommendations available at this time
      </p>
    </div>
  );
}
