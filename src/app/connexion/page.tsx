import Link from "next/link";
import ConnexionForm from "./ConnexionForm";

export default function ConnexionPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Connexion</h1>
      <p className="mb-8 text-sm text-gray-500">
        Connectez-vous à votre compte CoachLink.
      </p>

      <ConnexionForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="font-medium text-blue-600 hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </main>
  );
}
