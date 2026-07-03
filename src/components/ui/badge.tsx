import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        gold: "bg-gold/12 text-gold-bright border border-gold/25",
        green: "bg-green/25 text-green-bright border border-green-bright/25",
        neutral: "bg-surface-2 text-muted border border-border",
        premium:
          "bg-gradient-to-r from-gold/20 to-bronze/20 text-gold-bright border border-gold/30",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
