"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps extends ButtonProps {
  plan: "monthly" | "annual" | "free";
  label: string;
}

/** Starts a Stripe Checkout session (or routes free/demo users to the app). */
export function CheckoutButton({ plan, label, ...props }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function go() {
    if (plan === "free") {
      window.location.href = "/signup";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      window.location.href = data.url ?? "/dashboard";
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button onClick={go} disabled={loading} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      {label}
    </Button>
  );
}
