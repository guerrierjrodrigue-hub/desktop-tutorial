export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
      <div className="skeleton h-9 w-64 rounded-lg" />
      <div className="skeleton mt-2 h-5 w-48 rounded-lg" />
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="skeleton h-28 rounded-2xl" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="skeleton h-72 rounded-2xl" />
            <div className="skeleton h-72 rounded-2xl" />
          </div>
          <div className="skeleton h-40 rounded-2xl" />
        </div>
        <div className="space-y-5">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-52 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
