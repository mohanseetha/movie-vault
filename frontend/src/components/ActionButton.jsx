/* eslint-disable no-unused-vars */
export default function ActionButton({
  icon: Icon,
  label,
  primary = false,
  onClick,
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 
        backdrop-blur-md border hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${
          primary
            ? "bg-accent text-white border-accent hover:bg-accent/90 hover:shadow-accent/25"
            : "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30"
        }
      `}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
