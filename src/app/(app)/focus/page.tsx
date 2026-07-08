import type { Metadata } from "next";
import { Topbar } from "@/components/layout/topbar";
import { FocusTimer } from "@/components/mind/focus-timer";

export const metadata: Metadata = {
  title: "Focus",
};

export default function FocusPage() {
  return (
    <>
      <Topbar title="Focus" />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 sm:px-6">
        <FocusTimer />
      </main>
    </>
  );
}
