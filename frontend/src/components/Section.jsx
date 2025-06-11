export function Section({ children, className = "" }) {
  return (
    <section className={`relative z-30 bg-background py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">{children}</div>
    </section>
  );
}

export function SectionHeading({ icon: Icon, children, count }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-text-main mb-2 flex items-center gap-3">
        {Icon && <Icon className="text-accent" size={32} />}
        {children}
        {typeof count === "number" && (
          <span className="text-accent/70 font-normal">({count})</span>
        )}
      </h2>
      <div className="w-24 h-1 bg-gradient-to-r from-accent to-accent/50 rounded-full"></div>
    </div>
  );
}
