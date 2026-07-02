"use client";

import { useFormState } from "react-dom";
import { uploadClientPhoto } from "./actions";

export default function PhotoUploadClient({ photoUrl, initiale }: { photoUrl: string | null; initiale: string }) {
  const [state, formAction] = useFormState(
    async (_prev: { error?: string; success?: boolean } | undefined, formData: FormData) => {
      return await uploadClientPhoto(formData);
    },
    undefined
  );

  return (
    <form action={formAction} className="flex items-center gap-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Photo de profil" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-400">
            {initiale}
          </div>
        )}
      </div>
      <div>
        <input name="photo" type="file" accept="image/*" required className="block text-sm text-gray-600" />
        {state?.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
        {state?.success && <p className="mt-1 text-xs text-green-600">Photo mise à jour.</p>}
        <button
          type="submit"
          className="mt-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400"
        >
          Changer la photo
        </button>
      </div>
    </form>
  );
}
