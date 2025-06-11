export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent/40 rounded-full animate-spin animation-delay-75"></div>
        </div>
        <p className="text-text-soft font-medium">{message}</p>
      </div>
    </div>
  );
}
