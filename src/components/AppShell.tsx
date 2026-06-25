import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <header className="mx-auto mb-6 flex max-w-5xl items-center justify-between glass px-4 py-3">
        <div className="flex items-center gap-3">
          {icon}
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">{title}</h1>
        </div>
        <Link
          to="/"
          className="glass glass-hover inline-flex items-center gap-2 px-3 py-2 text-sm font-medium"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
      </header>
      <main className="mx-auto max-w-5xl">{children}</main>
    </div>
  );
}
