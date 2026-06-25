import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "./firebase";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signInGoogle: async () => {},
  signOutUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        signInGoogle: async () => {
          await signInWithPopup(getFirebaseAuth(), googleProvider);
        },
        signOutUser: async () => {
          await signOut(getFirebaseAuth());
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
