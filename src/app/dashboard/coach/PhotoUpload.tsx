"use client";

import { useFormState } from "react-dom";
import { uploadCoachPhoto } from "./actions";

const GOLD = "#C9A96E";

export default function PhotoUpload({ photoUrl }: { photoUrl: string | null }) {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await uploadCoachPhoto(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="flex items-center gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full" style={{ outline: `2px solid ${GOLD}44` }}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Photo de profil" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400" style={{ background: `${GOLD}11` }}>
            +
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Photo de profil</p>
        <input
          name="photo"
          type="file"
          accept="image/*"
          required
          className="block w-full text-sm text-gray-600"
        />
        {state?.error && <p className="mt-1 text-sm text-red-700">{state.error}</p>}
        {state?.success && <p className="mt-1 text-sm font-medium" style={{ color: "#9A7A2E" }}>✓ Photo mise à jour.</p>}
        <button
          type="submit"
          className="mt-3 rounded-full border px-4 py-1.5 text-sm font-semibold transition hover:opacity-80"
          style={{ borderColor: `${GOLD}66`, color: "#9A7A2E", background: `${GOLD}11` }}
        >
          Changer la photo
        </button>
      </div>
    </form>
  );
}
