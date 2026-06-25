import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NotebookPen, Lock, Plus, Trash2, Save, LogOut } from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { getDb } from "@/lib/firebase";

export const Route = createFileRoute("/notes")({
  ssr: false,
  head: () => ({ meta: [{ title: "Notes — MultiSpace" }] }),
  component: NotesPage,
});

type Note = { id: string; title: string; body: string; updatedAt?: any };

async function hash(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function NotesPage() {
  const { user, loading } = useAuth();
  const [pinHash, setPinHash] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setChecking(true);
      const snap = await getDoc(doc(getDb(), "users", user.uid));
      setPinHash((snap.data()?.pinHash as string) ?? null);
      setChecking(false);
    })();
  }, [user]);

  if (loading || checking) {
    return (
      <AppShell title="Notes" icon={<NotebookPen className="h-5 w-5" />}>
        <div className="glass p-6 text-center">Loading…</div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell title="Notes" icon={<NotebookPen className="h-5 w-5" />}>
        <div className="glass p-6 text-center">Please sign in from the dashboard first.</div>
      </AppShell>
    );
  }

  if (!unlocked) {
    return (
      <AppShell title="Notes" icon={<NotebookPen className="h-5 w-5" />}>
        <PinGate
          mode={pinHash ? "verify" : "create"}
          onCreated={async (pin) => {
            const h = await hash(pin);
            await setDoc(
              doc(getDb(), "users", user.uid),
              { pinHash: h, updatedAt: serverTimestamp() },
              { merge: true }
            );
            setPinHash(h);
            setUnlocked(true);
          }}
          onVerify={async (pin) => {
            const ok = (await hash(pin)) === pinHash;
            if (ok) setUnlocked(true);
            return ok;
          }}
        />
      </AppShell>
    );
  }

  return <Vault uid={user.uid} onLock={() => setUnlocked(false)} />;
}

function PinGate({
  mode,
  onCreated,
  onVerify,
}: {
  mode: "create" | "verify";
  onCreated: (pin: string) => Promise<void>;
  onVerify: (pin: string) => Promise<boolean>;
}) {
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-sm">
      <div className="glass p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">
          {mode === "create" ? "Create a private PIN" : "Enter your PIN"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "create"
            ? "Choose a 4–8 digit PIN to lock your notes."
            : "Your notes are locked. Enter PIN to unlock."}
        </p>
        <form
          className="mt-5 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            if (!/^\d{4,8}$/.test(pin)) return setError("PIN must be 4–8 digits.");
            setBusy(true);
            try {
              if (mode === "create") {
                if (pin !== pin2) {
                  setError("PINs don't match.");
                  return;
                }
                await onCreated(pin);
              } else {
                const ok = await onVerify(pin);
                if (!ok) setError("Wrong PIN.");
              }
            } finally {
              setBusy(false);
            }
          }}
        >
          <input
            inputMode="numeric"
            maxLength={8}
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="PIN"
            className="glass-input w-full text-center tracking-[0.5em] text-xl"
            autoFocus
          />
          {mode === "create" && (
            <input
              inputMode="numeric"
              maxLength={8}
              type="password"
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))}
              placeholder="Confirm PIN"
              className="glass-input w-full text-center tracking-[0.5em] text-xl"
            />
          )}
          {error && <div className="text-sm text-destructive">{error}</div>}
          <button disabled={busy} className="glass glass-hover w-full py-2 font-medium">
            {mode === "create" ? "Set PIN & Unlock" : "Unlock"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Vault({ uid, onLock }: { uid: string; onLock: () => void }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const q = query(collection(getDb(), "users", uid, "notes"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setNotes(list);
      if (!selected && list[0]) {
        setSelected(list[0].id);
        setTitle(list[0].title ?? "");
        setBody(list[0].body ?? "");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const current = notes.find((n) => n.id === selected) ?? null;

  return (
    <AppShell title="Private Notes" icon={<NotebookPen className="h-5 w-5" />}>
      <div className="mb-4 flex justify-end gap-2">
        <button
          onClick={async () => {
            const ref = await addDoc(collection(getDb(), "users", uid, "notes"), {
              title: "Untitled",
              body: "",
              updatedAt: serverTimestamp(),
            });
            setSelected(ref.id);
            setTitle("Untitled");
            setBody("");
          }}
          className="glass glass-hover inline-flex items-center gap-2 px-3 py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> New
        </button>
        <button
          onClick={onLock}
          className="glass glass-hover inline-flex items-center gap-2 px-3 py-2 text-sm"
        >
          <LogOut className="h-4 w-4" /> Lock
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <aside className="glass max-h-[70vh] overflow-auto p-2">
          {notes.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">No notes yet.</div>
          )}
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setSelected(n.id);
                setTitle(n.title);
                setBody(n.body);
              }}
              className={`flex w-full items-start justify-between gap-2 rounded-lg p-3 text-left text-sm hover:bg-white/10 ${
                selected === n.id ? "bg-white/15" : ""
              }`}
            >
              <div className="min-w-0">
                <div className="truncate font-medium">{n.title || "Untitled"}</div>
                <div className="truncate text-xs text-muted-foreground">{n.body || "Empty"}</div>
              </div>
              <Trash2
                onClick={async (e) => {
                  e.stopPropagation();
                  await deleteDoc(doc(getDb(), "users", uid, "notes", n.id));
                  if (selected === n.id) setSelected(null);
                }}
                className="mt-1 h-4 w-4 shrink-0 opacity-60 hover:opacity-100"
              />
            </button>
          ))}
        </aside>

        <section className="glass p-4">
          {current ? (
            <>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="glass-input w-full text-lg font-semibold"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your private note…"
                className="glass-input mt-3 min-h-[50vh] w-full resize-y leading-relaxed"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={async () => {
                    await updateDoc(doc(getDb(), "users", uid, "notes", current.id), {
                      title,
                      body,
                      updatedAt: serverTimestamp(),
                    });
                  }}
                  className="glass glass-hover inline-flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-muted-foreground">
              Select or create a note to get started.
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
