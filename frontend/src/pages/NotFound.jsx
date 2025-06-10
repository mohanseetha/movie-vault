import { Link } from "react-router-dom";
import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="bg-glass rounded-xl p-8 shadow-lg backdrop-blur-md text-center max-w-md w-full">
          <div className="flex flex-col items-center mb-4">
            <Film className="text-accent mb-2" size={48} />
            <h1 className="text-6xl font-bold text-accent font-display mb-2">
              404
            </h1>
          </div>
          <p className="text-xl mb-2 font-semibold">Page not found.</p>
          <p className="text-text-soft mb-6">
            You seem lost in the vault. Maybe try searching for a movie or head
            back to home.
          </p>
          <Link
            to="/"
            className="bg-cta text-white px-6 py-2 rounded hover:bg-accent transition font-bold"
          >
            Go Home
          </Link>
        </div>
      </main>
    </div>
  );
}
