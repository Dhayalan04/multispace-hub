import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/clock")({
  ssr: false,
  head: () => ({ meta: [{ title: "Clock — MultiSpace" }] }),
  component: ClockPage,
});

function ClockPage() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...opts }).format(now);

  return (
    <AppShell title="Clock" icon={<Clock className="h-5 w-5" />}>
      <div className="glass p-8 md:p-12 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">India Standard Time</p>
        <div className="my-6 font-mono text-6xl md:text-8xl font-semibold tracking-tight">
          {fmt({ hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
        </div>
        <div className="text-lg text-muted-foreground">
          {fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">Asia/Kolkata · UTC+05:30</div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Date", value: fmt({ day: "2-digit", month: "short", year: "numeric" }) },
          { label: "Day", value: fmt({ weekday: "long" }) },
          { label: "Week", value: `Week ${getISOWeek(now)}` },
        ].map((c) => (
          <div key={c.label} className="glass p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
            <div className="mt-1 text-2xl font-semibold">{c.value}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function getISOWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
}
