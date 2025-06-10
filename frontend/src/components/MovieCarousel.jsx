import { useEffect, useState, useCallback, useRef } from "react";
import MovieCard from "./MovieCard";
import SkeletonCard from "./SkeletonCard";
import SkeletonCarousel from "./SkeletonCarousel";

const SKELETON_COUNT = 4;

export default function MovieCarousel({
  fetchMovies,
  movies: staticMovies,
  title,
  icon: Icon,
  loading = false,
}) {
  const [movies, setMovies] = useState(staticMovies || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(!!fetchMovies);

  const [loadingNext, setLoadingNext] = useState(false);
  const endRef = useRef(null);

  const loadMovies = useCallback(
    async (pageNum) => {
      if (!fetchMovies) return;
      if (pageNum === 1) setInitialLoading(true);
      else setLoadingNext(true);

      try {
        const { results, hasMore: more } = await fetchMovies(pageNum);
        setMovies((prev) => {
          const ids = new Set(prev.map((m) => m.id));
          return [...prev, ...results.filter((m) => !ids.has(m.id))];
        });
        setHasMore(more);
      } catch (err) {
        console.error("Failed to load movies:", err);
      } finally {
        setInitialLoading(false);
        setLoadingNext(false);
      }
    },
    [fetchMovies]
  );

  useEffect(() => {
    if (fetchMovies) {
      setMovies([]);
      setPage(1);
      setHasMore(true);
      setInitialLoading(true);
      setLoadingNext(false);
    }
  }, [fetchMovies]);

  useEffect(() => {
    if (!fetchMovies) return;
    loadMovies(page);
  }, [page, loadMovies, fetchMovies]);

  const moviesToRender = fetchMovies ? movies : staticMovies || [];

  useEffect(() => {
    if (!fetchMovies || !hasMore || loadingNext || initialLoading) return;
    const node = endRef.current;
    if (!node) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      {
        root: node.parentElement,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [
    fetchMovies,
    hasMore,
    loadingNext,
    initialLoading,
    moviesToRender.length,
  ]);

  if (initialLoading || loading) {
    return <SkeletonCarousel title={title} />;
  }

  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold text-white tracking-tight mb-3 px-2 md:px-4 flex items-center gap-2">
        {Icon && <Icon className="inline-block text-accent" size={28} />}
        {title}
      </h2>
      <div
        className="
          flex gap-4 md:gap-6 overflow-x-auto pb-2 snap-x snap-mandatory
          scrollbar-thin scrollbar-thumb-gray-700 scrollbar-hide
          px-2 md:px-4
        "
        style={{ scrollBehavior: "smooth" }}
      >
        {moviesToRender.map((movie) => (
          <div
            key={movie.id}
            className="
              flex-shrink-0 snap-start
              w-[30vw] sm:w-[45vw] md:w-[24vw] lg:w-[20vw] xl:w-[16vw]
              h-[44vw] sm:h-[66vw] md:h-[35vw] lg:h-[28vw] xl:h-[22vw] max-h-[420px]
              max-w-xs
              transition-transform duration-200
              shadow-md 
              rounded-xl bg-surface
            "
          >
            <MovieCard movie={movie} />
          </div>
        ))}

        {loadingNext &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="
                flex-shrink-0 snap-start
                w-[30vw] sm:w-[45vw] md:w-[24vw] lg:w-[20vw] xl:w-[16vw]
                max-w-xs
                rounded-xl
              "
            >
              <SkeletonCard />
            </div>
          ))}

        {fetchMovies && hasMore && (
          <div
            ref={endRef}
            style={{ width: 1, height: 1, alignSelf: "stretch" }}
            aria-hidden="true"
          />
        )}
      </div>
    </section>
  );
}
