import { useState } from "react";
import { login } from "../services/api";
import type { CurrentUser } from "../types";

export default function Login({ onLogin }: { onLogin: (user: CurrentUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username, password);
      onLogin(res.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-pharma-600" />
          <span className="font-medium text-gray-900">PharmaGest</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">Connectez-vous pour accéder à l'application.</p>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            required
            placeholder="Identifiant"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-pharma-600 text-white text-sm py-2 rounded-md hover:bg-pharma-700 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4">
          Compte par défaut créé via <code>backend/database/create_admin.php</code> :
          identifiant <code>admin</code>, mot de passe <code>admin123</code>.
        </p>
      </div>
    </div>
  );
}
