import { useEffect, useState } from "react";
import { createFournisseur, deleteFournisseur, getFournisseurs } from "../services/api";
import type { Fournisseur } from "../types";

const emptyForm = { nom: "", adresse: "", telephone: "", email: "" };

export default function FournisseurList() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getFournisseurs().then(setFournisseurs).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createFournisseur(form as any);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce fournisseur ?")) return;
    await deleteFournisseur(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Fournisseurs</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Ajouter un fournisseur"}
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
            placeholder="Nom du fournisseur"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <input
            placeholder="Adresse"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <input
            placeholder="Téléphone"
            value={form.telephone}
            onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="col-span-2 bg-pharma-600 text-white text-sm py-2 rounded-md hover:bg-pharma-700"
          >
            Enregistrer
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Nom</th>
              <th className="py-2 px-4 font-normal">Téléphone</th>
              <th className="py-2 px-4 font-normal">Email</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {fournisseurs.map((f) => (
              <tr key={f.id_fournisseur} className="border-b border-gray-50">
                <td className="py-2 px-4">{f.nom}</td>
                <td className="py-2 px-4 text-gray-500">{f.telephone ?? "-"}</td>
                <td className="py-2 px-4 text-gray-500">{f.email ?? "-"}</td>
                <td className="py-2 px-4 text-right">
                  <button
                    onClick={() => handleDelete(f.id_fournisseur)}
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
