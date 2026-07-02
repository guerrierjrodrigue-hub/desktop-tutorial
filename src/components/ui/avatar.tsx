import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
  color?: string;
}

/** Avatar with graceful initials fallback. */
export function Avatar({ name, src, className, color }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "grid size-10 place-items-center overflow-hidden rounded-full border border-border text-sm font-semibold text-foreground",
        className,
      )}
      style={{ background: color ?? "var(--color-green-deep)" }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
