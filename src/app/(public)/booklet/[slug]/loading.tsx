/**
 * Booklet Loading Component
 *  * Loading state fallback for booklet detail pages.
 */

export default function BookletSlugLoading() {
  return (
    <div className="w-full flex-1 bg-[#FAF6EE] animate-pulse">
      <div className="h-[36dvh] min-h-[260px] bg-[#0B0907]" />
      <div className="max-w-3xl mx-auto py-14 px-6 space-y-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`h-3.5 bg-black/8 rounded ${i % 3 === 2 ? "w-1/2" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
}
