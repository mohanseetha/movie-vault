import { Users } from "lucide-react";
import { Section, SectionHeading } from "./Section";

export function CastSection({ cast }) {
  if (!cast.length) return null;

  return (
    <Section>
      <SectionHeading icon={Users}>Top Cast</SectionHeading>
      <div className="flex flex-wrap gap-2">
        {cast.slice(0, 12).map((actor, idx) => (
          <span
            key={actor || idx}
            className="bg-accent/10 text-accent px-3 py-1.5 rounded-full text-sm font-medium border border-accent/20 hover:bg-accent/20 transition-colors duration-200"
          >
            {actor}
          </span>
        ))}
        {cast.length > 12 && (
          <span className="text-text-soft text-sm px-3 py-1.5">
            +{cast.length - 12} more
          </span>
        )}
      </div>
    </Section>
  );
}
