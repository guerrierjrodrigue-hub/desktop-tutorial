import { cn } from "@/lib/utils";

interface RingProps {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  progressClassName?: string;
  children?: React.ReactNode;
}

/** Circular progress ring, Apple Fitness style. */
export function Ring({
  value,
  size = 120,
  stroke = 10,
  className,
  trackClassName = "text-surface-2",
  progressClassName = "text-gold",
  children,
}: RingProps) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped);
  return (
    <div className={cn("relative inline-grid place-items-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={trackClassName}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-out", progressClassName)}
          stroke="currentColor"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center">{children}</div>
      )}
    </div>
  );
}
