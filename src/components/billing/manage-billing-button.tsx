"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Opens the Stripe billing portal for the current customer. */
export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function open() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      window.location.href = data.url ?? "/profile";
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={open} disabled={loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
      Manage subscription
    </Button>
  );
}
