export default function RowSkeleton() {
  return (
    <li className="bg-surface/90 rounded-xl shadow-card flex items-center gap-4 p-3 animate-pulse">
      <div className="w-20 h-28 bg-gray-800 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="h-5 bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-700 rounded w-1/4" />
      </div>
    </li>
  );
}
