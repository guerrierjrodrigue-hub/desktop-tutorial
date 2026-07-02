import { icons, type LucideProps } from "lucide-react";

/** Render a Lucide icon by its string name (used for data-driven icons). */
export function Icon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
}
