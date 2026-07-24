"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { signup } from "@/app/auth/actions";

type Role = "coach" | "client";

const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20";
const labelClass = "mb-1.5 block text-sm font-medium text-gray-700";

export default function InscriptionForm() {
  const [role, setRole] = useState<Role>("client");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string } | undefined, formData: FormData) => {
      return await signup(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="role" value={role} />

      {/* Sélection rôle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setRole("client")}
          className="rounded-xl border px-4 py-3 text-sm font-medium transition"
          style={role === "client"
            ? { background: "linear-gradient(135deg, #C9A96E22, #E8D5A322)", borderColor: "#C9A96E", color: "#9A7A2E" }
            : { borderColor: "#e5e7eb", color: "#6b7280", background: "#fff" }
          }
        >
          🔍 Je cherche un coach
        </button>
        <button
          type="button"
          onClick={() => setRole("coach")}
          className="rounded-xl border px-4 py-3 text-sm font-medium transition"
          style={role === "coach"
            ? { background: "linear-gradient(135deg, #C9A96E22, #E8D5A322)", borderColor: "#C9A96E", color: "#9A7A2E" }
            : { borderColor: "#e5e7eb", color: "#6b7280", background: "#fff" }
          }
        >
          ✏️ Je suis coach
        </button>
      </div>

      <div>
        <label htmlFor="nom" className={labelClass}>Nom complet</label>
        <input id="nom" name="nom" type="text" required placeholder="Jean Dupont" className={inputClass} />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" required placeholder="vous@exemple.com" className={inputClass} />
      </div>

      {role === "coach" && (
        <div>
          <label htmlFor="specialite" className={labelClass}>Domaine du coach</label>
          <input
            id="specialite"
            name="specialite"
            type="text"
            required
            placeholder="Ex. Coach sportif, Coach mental..."
            list="domaines-list"
            className={inputClass}
          />
          <datalist id="domaines-list">
            <option value="Coach sportif" />
            <option value="Coach en finance" />
            <option value="Coach en développement personnel" />
            <option value="Coach marketing" />
            <option value="Coach en développement business" />
            <option value="Coach mental" />
            <option value="Coach en séduction" />
            <option value="Coach en bien être et santé" />
            <option value="Coach en langue" />
            <option value="Coach en immobilier" />
            <option value="Coach en E-commerce" />
            <option value="Nutritionniste" />
          </datalist>
        </div>
      )}

      <div>
        <label htmlFor="password" className={labelClass}>Mot de passe</label>
        <div className="relative">
          <input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={6} placeholder="Minimum 6 caractères" className={inputClass} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          id="cgu"
          name="cgu"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-gray-300"
          style={{ accentColor: "#C9A96E" }}
        />
        <label htmlFor="cgu" className="text-sm text-gray-500 leading-relaxed">
          J&apos;accepte les{" "}
          <Link href="/cgu" target="_blank" className="font-medium hover:underline" style={{ color: "#C9A96E" }}>CGU</Link>
          {" "}et la{" "}
          <Link href="/confidentialite" target="_blank" className="font-medium hover:underline" style={{ color: "#C9A96E" }}>Politique de confidentialité</Link>
        </label>
      </div>

      {state?.error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl py-3 text-sm font-semibold shadow-md transition hover:opacity-90 hover:shadow-lg"
        style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#0B1120" }}
      >
        Créer mon compte
      </button>
    </form>
  );
}
