import { getCurrentUser } from "@/lib/queries/profile";

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export async function Greeting() {
  const currentUser = await getCurrentUser();
  const now = new Date();
  const firstName = currentUser.name.split(" ")[0];
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <p className="text-sm font-medium text-gold-bright">{dateLabel}</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
        {greetingFor(now)}, {firstName}.
      </h1>
      <p className="mt-1.5 text-muted">
        Let&apos;s honor God with your body today.
      </p>
    </div>
  );
}
