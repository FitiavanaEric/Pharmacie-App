import { useEffect, useState } from "react";
import {
  createUtilisateur,
  deleteUtilisateur,
  getUtilisateurs,
  updateUtilisateur,
} from "../services/api";
import type { Role, Utilisateur } from "../types";

const ROLES: { value: Role; label: string }[] = [
  { value: "admin", label: "Administrateur" },
  { value: "pharmacien", label: "Pharmacien" },
  { value: "gestionnaire_stock", label: "Gestionnaire de stock" },
  { value: "caissier", label: "Caissier" },
  { value: "responsable_achats", label: "Responsable achats" },
];

const emptyForm = { username: "", password: "", role: "caissier" as Role };

export default function UtilisateurList() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getUtilisateurs().then(setUsers).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createUtilisateur(form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function toggleActif(u: Utilisateur) {
    await updateUtilisateur(u.id_utilisateur, { role: u.role, actif: !u.actif });
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce compte utilisateur ?")) return;
    await deleteUtilisateur(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Comptes utilisateurs</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Créer un compte"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3"
        >
          <input
            required
            placeholder="Identifiant"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="col-span-2 bg-pharma-600 text-white text-sm py-2 rounded-md hover:bg-pharma-700"
          >
            Créer le compte
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Identifiant</th>
              <th className="py-2 px-4 font-normal">Rôle</th>
              <th className="py-2 px-4 font-normal">Statut</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id_utilisateur} className="border-b border-gray-50">
                <td className="py-2 px-4">{u.username}</td>
                <td className="py-2 px-4 text-gray-500">
                  {ROLES.find((r) => r.value === u.role)?.label ?? u.role}
                </td>
                <td className="py-2 px-4">
                  {u.actif ? (
                    <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs">Actif</span>
                  ) : (
                    <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-xs">Désactivé</span>
                  )}
                </td>
                <td className="py-2 px-4 text-right space-x-3">
                  <button onClick={() => toggleActif(u)} className="text-xs text-pharma-700 hover:underline">
                    {u.actif ? "Désactiver" : "Réactiver"}
                  </button>
                  <button
                    onClick={() => handleDelete(u.id_utilisateur)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
