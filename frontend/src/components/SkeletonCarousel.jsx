import SkeletonCard from "./SkeletonCard";

export default function SkeletonCarousel({ title = "" }) {
  return (
    <section className="my-8">
      {title && (
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
          {title}
        </h2>
      )}
      <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="
              flex-shrink-0 snap-start
              w-[30vw] sm:w-[45vw] md:w-[24vw] lg:w-[20vw] xl:w-[16vw]
              max-w-xs
            "
          >
            <SkeletonCard />
          </div>
        ))}
      </div>
    </section>
  );
}
