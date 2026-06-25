import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Bell, Trash2, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/calendar")({
  ssr: false,
  head: () => ({ meta: [{ title: "Calendar & Alarm — MultiSpace" }] }),
  component: CalendarPage,
});

type Alarm = { id: string; time: string; label: string; enabled: boolean; firedKey?: string };

const STORAGE_KEY = "multispace.alarms.v1";

function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const istNow = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const istDateKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(now);

  const [alarms, setAlarms] = useState<Alarm[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setAlarms(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }, [alarms]);

  // alarm trigger
  useEffect(() => {
    setAlarms((prev) =>
      prev.map((a) => {
        if (a.enabled && a.time === istNow && a.firedKey !== istDateKey) {
          try {
            new Audio(
              "data:audio/wav;base64,UklGRhwMAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YfgLAAA="
            ).play();
          } catch {}
          alert(`⏰ Alarm: ${a.label || a.time}`);
          return { ...a, firedKey: istDateKey };
        }
        return a;
      })
    );
  }, [istNow, istDateKey]);

  // calendar grid
  const monthStart = view;
  const monthEnd = new Date(view.getFullYear(), view.getMonth() + 1, 0);
  const startWeekday = (monthStart.getDay() + 6) % 7; // make Monday=0
  const days: Array<Date | null> = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++)
    days.push(new Date(view.getFullYear(), view.getMonth(), d));

  const [newTime, setNewTime] = useState("07:00");
  const [newLabel, setNewLabel] = useState("");

  return (
    <AppShell title="Calendar & Alarm" icon={<CalendarDays className="h-5 w-5" />}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              className="glass glass-hover px-3 py-1.5 text-sm"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
            >
              ←
            </button>
            <div className="text-lg font-semibold">
              {view.toLocaleString("en-IN", { month: "long", year: "numeric" })}
            </div>
            <button
              className="glass glass-hover px-3 py-1.5 text-sm"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="py-1">
                {d}
              </div>
            ))}
            {days.map((d, i) => {
              const isToday =
                d &&
                d.toDateString() ===
                  new Date(
                    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata" }).format(now)
                  ).toDateString();
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm ${
                    d ? "bg-white/5 hover:bg-white/10" : ""
                  } ${isToday ? "bg-primary/40 font-bold text-foreground ring-1 ring-primary/60" : ""}`}
                >
                  {d?.getDate() ?? ""}
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">All dates shown in IST.</div>
        </div>

        <div className="glass p-5">
          <div className="mb-3 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Alarms (IST)</h2>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Time</label>
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="glass-input block"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Label</label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Wake up"
                className="glass-input block w-full"
              />
            </div>
            <button
              className="glass glass-hover inline-flex items-center gap-2 px-3 py-2 text-sm"
              onClick={() => {
                setAlarms([
                  ...alarms,
                  {
                    id: crypto.randomUUID(),
                    time: newTime,
                    label: newLabel,
                    enabled: true,
                  },
                ]);
                setNewLabel("");
              }}
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {alarms.length === 0 && (
              <li className="text-sm text-muted-foreground">No alarms yet.</li>
            )}
            {alarms.map((a) => (
              <li key={a.id} className="flex items-center justify-between glass p-3">
                <div>
                  <div className="font-mono text-xl">{a.time}</div>
                  <div className="text-xs text-muted-foreground">{a.label || "Alarm"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={a.enabled}
                      onChange={(e) =>
                        setAlarms((p) =>
                          p.map((x) =>
                            x.id === a.id ? { ...x, enabled: e.target.checked, firedKey: undefined } : x
                          )
                        )
                      }
                    />
                    On
                  </label>
                  <button
                    onClick={() => setAlarms((p) => p.filter((x) => x.id !== a.id))}
                    className="glass glass-hover p-2"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Alarms ring once per day at the chosen IST time while this tab stays open.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
