import Link from "next/link";
import InscriptionForm from "./InscriptionForm";

export default function InscriptionPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Créer un compte</h1>
      <p className="mb-8 text-sm text-gray-500">
        Rejoignez CoachLink en tant que coach ou client.
      </p>

      <InscriptionForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-medium text-blue-600 hover:underline">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
