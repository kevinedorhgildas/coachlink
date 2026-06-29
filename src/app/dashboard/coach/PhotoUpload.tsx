"use client";

import { useFormState } from "react-dom";
import { uploadCoachPhoto } from "./actions";

export default function PhotoUpload({ photoUrl }: { photoUrl: string | null }) {
  const [state, formAction] = useFormState(
    async (_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await uploadCoachPhoto(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6">
      <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Photo de profil" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            Aucune photo
          </div>
        )}
      </div>

      <div className="flex-1">
        <input
          name="photo"
          type="file"
          accept="image/*"
          required
          className="block w-full text-sm text-gray-600"
        />
        {state?.error && <p className="mt-1 text-sm text-red-700">{state.error}</p>}
        {state?.success && <p className="mt-1 text-sm text-green-700">Photo mise à jour.</p>}
        <button
          type="submit"
          className="mt-2 rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-gray-400"
        >
          Changer la photo
        </button>
      </div>
    </form>
  );
}
