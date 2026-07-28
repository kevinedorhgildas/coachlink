"use client";

import { useState, useTransition } from "react";
import { toggleAbonnement } from "./actions";

const GOLD = "#C9A96E";

export default function AbonnementButton({
  coachId,
  initialAbonne,
  nbAbonnes,
}: {
  coachId: string;
  initialAbonne: boolean;
  nbAbonnes: number;
}) {
  const [abonne, setAbonne] = useState(initialAbonne);
  const [count, setCount] = useState(nbAbonnes);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const res = await toggleAbonnement(coachId);
      if (res?.abonne !== undefined) {
        setAbonne(res.abonne);
        setCount((c) => res.abonne ? c + 1 : c - 1);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
      style={abonne
        ? { background: `${GOLD}22`, border: `1px solid ${GOLD}66`, color: GOLD }
        : { background: `linear-gradient(135deg, ${GOLD}, #E8D5A3)`, color: "#0B1120" }
      }
    >
      <span>{abonne ? "✓ Abonné" : "S'abonner"}</span>
      {count > 0 && (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold"
          style={abonne
            ? { background: `${GOLD}33`, color: GOLD }
            : { background: "rgba(0,0,0,0.15)", color: "#0B1120" }
          }
        >
          {count}
        </span>
      )}
    </button>
  );
}
