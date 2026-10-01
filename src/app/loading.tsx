/** Instant fallback for public pages while they stream in — never a blank screen. */
export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <div className="skeleton h-8 w-36 rounded-lg" />
        <div className="skeleton h-9 w-28 rounded-full" />
      </div>
      <div className="mx-auto mt-16 flex w-full max-w-3xl flex-col items-center px-6">
        <div className="skeleton h-7 w-56 rounded-full" />
        <div className="skeleton mt-6 h-14 w-full rounded-xl" />
        <div className="skeleton mt-3 h-14 w-4/5 rounded-xl" />
        <div className="skeleton mt-6 h-5 w-2/3 rounded-lg" />
        <div className="skeleton mt-9 h-12 w-64 rounded-full" />
      </div>
    </div>
  );
}
