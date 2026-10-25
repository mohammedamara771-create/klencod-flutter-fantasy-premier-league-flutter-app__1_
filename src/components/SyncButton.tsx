"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SyncButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sync() {
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const payload = (await response.json()) as { ok: boolean; players?: number; message?: string };
      if (!payload.ok) throw new Error(payload.message ?? "فشلت المزامنة");
      setState("done");
      setMessage(`تم تحديث ${payload.players ?? 0} لاعباً من الواجهة الرسمية`);
      startTransition(() => router.refresh());
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "فشلت المزامنة");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={sync}
        disabled={state === "loading" || pending}
        className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 font-bold text-white/80 transition hover:border-lime/40 hover:text-lime disabled:opacity-60 ${
          compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`h-3.5 w-3.5 ${state === "loading" ? "animate-spin" : ""}`}
        >
          <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
        </svg>
        {state === "loading" ? "جارٍ التحديث" : "تحديث رسمي"}
      </button>
      {message ? (
        <span className={`max-w-[190px] text-[9px] leading-3 ${state === "error" ? "text-rose-300" : "text-mint"}`}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
