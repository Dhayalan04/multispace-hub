import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calculator } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/calculator")({
  ssr: false,
  head: () => ({ meta: [{ title: "Calculator — MultiSpace" }] }),
  component: CalcPage,
});

const keys = [
  ["C", "(", ")", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "−"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

function CalcPage() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");

  const press = (k: string) => {
    if (k === "C") {
      setExpr("");
      setResult("");
      return;
    }
    if (k === "=") {
      try {
        const safe = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
        if (!/^[\d+\-*/().\s]*$/.test(safe)) throw new Error("Invalid");
        // eslint-disable-next-line no-new-func
        const v = Function(`"use strict"; return (${safe})`)();
        setResult(String(v));
      } catch {
        setResult("Error");
      }
      return;
    }
    if (k === "±") {
      setExpr((e) => (e.startsWith("-") ? e.slice(1) : "-" + e));
      return;
    }
    setExpr((e) => e + k);
  };

  return (
    <AppShell title="Calculator" icon={<Calculator className="h-5 w-5" />}>
      <div className="mx-auto max-w-md">
        <div className="glass p-5">
          <div className="min-h-[2.5rem] break-all text-right text-xl text-muted-foreground">
            {expr || "0"}
          </div>
          <div className="min-h-[3rem] break-all text-right text-4xl font-semibold">
            {result || " "}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {keys.flat().map((k) => {
            const isOp = ["÷", "×", "−", "+", "="].includes(k);
            const isClear = k === "C";
            return (
              <button
                key={k}
                onClick={() => press(k)}
                className={`glass glass-hover aspect-square text-xl font-semibold ${
                  isOp ? "bg-primary/30" : ""
                } ${isClear ? "bg-destructive/30" : ""}`}
              >
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
