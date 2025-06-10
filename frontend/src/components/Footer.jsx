import tmdbLogo from "../assets/tmdbLogo.svg";

export default function Footer() {
  return (
    <footer className="bg-background text-gray-500 text-center py-6 border-t border-surface flex flex-col items-center gap-2">
      <div className="flex items-center justify-center gap-2 text-xs">
        This product uses the TMDB API but is not endorsed or certified by TMDB
        <img
          src={tmdbLogo}
          alt="TMDB Logo"
          className="inline-block h-5 align-middle"
          style={{ marginLeft: 4 }}
        />
      </div>
      <div className="text-sm mt-1">
        &copy; {new Date().getFullYear()} MovieVault &mdash; Your Personalized
        Movie Journal
      </div>
    </footer>
  );
}
