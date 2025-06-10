export default function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl shadow-card animate-pulse p-2 flex flex-col gap-2 w-full h-full">
      <div className="h-32 md:h-48 xl:h-64 w-full bg-gray-800 rounded" />
      <div className="h-4 bg-gray-700 rounded w-3/4 mt-2" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
    </div>
  );
}
