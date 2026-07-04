"use client";

import { useRef } from "react";
import { envoyerMessage } from "@/app/dashboard/messages/actions";

export default function MessageForm({ receiverId }: { receiverId: string }) {
  const ref = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await envoyerMessage(formData);
    ref.current?.reset();
  }

  return (
    <form ref={ref} action={handleSubmit} className="flex gap-2 border-t border-gray-200 bg-white p-4">
      <input type="hidden" name="receiver_id" value={receiverId} />
      <input
        name="contenu"
        type="text"
        placeholder="Écrire un message..."
        required
        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#C9A96E] focus:bg-white transition"
      />
      <button
        type="submit"
        style={{ background: "linear-gradient(135deg, #C9A96E, #E8D5A3)", color: "#0B1120" }}
        className="rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
      >
        Envoyer
      </button>
    </form>
  );
}
