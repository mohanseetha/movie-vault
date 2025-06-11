import { Play, Edit3, Heart, LogOut, Share2, Check } from "lucide-react";
import ActionButton from "./ActionButton";

export function MovieActions({
  isLogged,
  isInWatchlist,
  onLogMovie,
  onWatchlistAction,
  onShare,
  watchlistLoading,
  shareSuccess,
}) {
  return (
    <div className="flex flex-wrap gap-3 pt-4">
      <ActionButton
        icon={isLogged ? Edit3 : Play}
        label={isLogged ? "Edit Log" : "Log Movie"}
        primary={true}
        onClick={onLogMovie}
        disabled={false}
      />
      {!isLogged && (
        <ActionButton
          icon={isInWatchlist ? LogOut : Heart}
          label={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          onClick={onWatchlistAction}
          disabled={watchlistLoading}
        />
      )}
      <ActionButton
        icon={shareSuccess ? Check : Share2}
        label={shareSuccess ? "Copied!" : "Share"}
        onClick={onShare}
      />
    </div>
  );
}
