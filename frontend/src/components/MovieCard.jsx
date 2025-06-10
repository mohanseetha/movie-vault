import { useNavigate } from "react-router-dom";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();

  return (
    <div
      className="relative cursor-pointer rounded-xl overflow-hidden shadow-card group transition-all h-full"
      onClick={() => navigate(`/movies/${movie.id}`)}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${movie.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(`/movies/${movie.id}`);
        }
      }}
    >
      <img
        src={
          movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "/assets/placeholder.jpg"
        }
        alt={movie.title}
        className="aspect-[2/3] w-full h-full object-cover rounded-xl transition group-hover:opacity-80"
        draggable={false}
      />
    </div>
  );
}
