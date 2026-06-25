import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, CalendarDays, CloudSun, Calculator, NotebookPen, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "MultiSpace — Dashboard" },
      { name: "description", content: "Your glassy dashboard of everyday tools." },
    ],
  }),
  component: Dashboard,
});

const apps = [
  { to: "/clock", label: "Clock", desc: "IST live time", icon: Clock, hue: "from-sky-400/40 to-indigo-500/40" },
  { to: "/calendar", label: "Calendar & Alarm", desc: "Date + alarms", icon: CalendarDays, hue: "from-fuchsia-400/40 to-purple-500/40" },
  { to: "/weather", label: "Weather", desc: "India forecast", icon: CloudSun, hue: "from-amber-300/40 to-rose-400/40" },
  { to: "/calculator", label: "Calculator", desc: "Quick math", icon: Calculator, hue: "from-emerald-300/40 to-teal-500/40" },
  { to: "/notes", label: "Notes", desc: "Private + PIN", icon: NotebookPen, hue: "from-pink-400/40 to-orange-400/40" },
] as const;

function Dashboard() {
  const { user, loading, signInGoogle, signOutUser } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass px-6 py-4 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass w-full max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">MultiSpace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Clock, calendar, alarms, weather, calculator and private notes — all in one liquid-glass space.
          </p>
          <button
            onClick={() => signInGoogle().catch((e) => alert(e.message))}
            className="glass glass-hover mt-6 inline-flex items-center justify-center gap-3 px-5 py-3 text-sm font-medium"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-10">
      <header className="mx-auto mb-8 flex max-w-6xl flex-wrap items-center justify-between gap-3 glass px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Welcome back</p>
          <h1 className="text-lg font-semibold">{user.displayName ?? user.email}</h1>
        </div>
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img src={user.photoURL} alt="" className="h-9 w-9 rounded-full border border-white/30" />
          )}
          <button
            onClick={() => signOutUser()}
            className="glass glass-hover inline-flex items-center gap-2 px-3 py-2 text-sm"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {apps.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="glass glass-hover group relative flex aspect-square flex-col items-center justify-center gap-3 p-5 text-center"
          >
            <div
              className={`absolute inset-0 -z-10 rounded-[inherit] bg-gradient-to-br ${a.hue} opacity-60 blur-2xl transition-opacity group-hover:opacity-90`}
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <a.icon className="h-7 w-7" />
            </div>
            <div>
              <div className="text-sm font-semibold">{a.label}</div>
              <div className="text-xs text-muted-foreground">{a.desc}</div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 16.3 4.5 9.7 8.8 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.5 2.2-7.1 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 39.1 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.1 5c-.4.4 6.8-5 6.8-14.5 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
