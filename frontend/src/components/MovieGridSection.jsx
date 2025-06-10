import MovieCard from "./MovieCard";

export function MovieGridSection({
  loading,
  movies,
  icon,
  title,
  loadingText,
  emptyText,
  emptySub,
  gridKey = "id",
}) {
  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      <div className="w-full bg-surface/90 py-8 px-4 flex flex-col items-center justify-center shadow-md mb-8">
        {icon}
        <h1 className="text-3xl font-extrabold font-display mb-2">{title}</h1>
        <div className="text-accent text-lg font-bold">
          {loading
            ? loadingText
            : movies.length === 0
            ? emptyText
            : `You have ${movies.length} movie${movies.length > 1 ? "s" : ""}${
                title === "Watched Movies" ? " watched!" : " to watch!"
              }`}
        </div>
        <div className="text-text-soft text-sm mt-1">
          {movies.length > 0 &&
            (title === "Watched Movies"
              ? "Keep logging your screenings and grow your vault!"
              : "Ready for a movie night?")}
        </div>
      </div>
      <main className="flex-1 container mx-auto px-3 md:px-4 pb-8">
        {loading ? (
          <SkeletonRow />
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            {icon}
            <div className="text-text-soft text-lg font-semibold mb-2">
              {emptyText}
            </div>
            <div className="text-text-soft text-sm">{emptySub}</div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {movies.map((movie) =>
              movie ? <MovieCard key={movie[gridKey]} movie={movie} /> : null
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid gap-6 grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface rounded-xl shadow-card animate-pulse p-2 flex flex-col gap-2 w-full"
        >
          <div className="aspect-[2/3] w-full bg-gray-800 rounded" />
          <div className="h-4 bg-gray-700 rounded w-3/4 mt-2" />
          <div className="h-3 bg-gray-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
