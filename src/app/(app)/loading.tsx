export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
      <div className="skeleton h-9 w-64 rounded-lg" />
      <div className="skeleton mt-2 h-5 w-48 rounded-lg" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-56 rounded-2xl" />
        <div className="skeleton h-56 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    </div>
  );
}
