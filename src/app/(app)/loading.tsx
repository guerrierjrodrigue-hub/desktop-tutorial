import { Logo } from "@/components/brand/logo";

export default function AppLoading() {
  return (
    <div
      className="grid min-h-[70svh] w-full place-items-center px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="logo-breathe flex flex-col items-center gap-3">
        <Logo variant="mark" height={52} />
        <Logo variant="inline" height={20} className="text-foreground" />
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
