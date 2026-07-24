/**
 * BookCardSkeleton
 * Loading placeholder matching BookCard's exact layout (cover, title,
 * author, price, button) so the swap-in feels seamless — no layout shift.
 */
function BookCardSkeleton() {
  return (
    <div
      className="flex w-full max-w-none flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white sm:max-w-[15rem] lg:max-w-[15.5rem]"
      aria-hidden="true"
    >
      <div className="aspect-[4/3] w-full animate-pulse bg-stone-200" />
      <div className="flex flex-col p-3">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-stone-200" />
        <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-stone-200" />
        <div className="mt-2.5 h-3.5 w-1/3 animate-pulse rounded bg-stone-200" />
        <div className="mt-3 h-8 w-full animate-pulse rounded-xl bg-stone-100" />
      </div>
    </div>
  );
}

export default BookCardSkeleton;
