/** Instant fallback for login/signup while the page streams in — never a blank screen. */
export default function AuthLoading() {
  return (
    <div className="w-full max-w-sm" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="skeleton h-9 w-48 rounded-lg" />
      <div className="skeleton mt-3 h-4 w-64 rounded-lg" />
      <div className="mt-8 space-y-3">
        <div className="skeleton h-11 rounded-xl" />
        <div className="skeleton h-11 rounded-xl" />
      </div>
      <div className="mt-6 space-y-3">
        <div className="skeleton h-11 rounded-xl" />
        <div className="skeleton h-11 rounded-xl" />
        <div className="skeleton h-11 rounded-xl" />
      </div>
    </div>
  );
}
