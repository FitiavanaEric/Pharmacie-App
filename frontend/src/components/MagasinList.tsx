import { useEffect, useState } from "react";
import { createMagasin, deleteMagasin, getMagasins } from "../services/api";
import type { Magasin } from "../types";

const emptyForm = { nomMagasin: "", adresse: "" };

export default function MagasinList() {
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getMagasins().then(setMagasins).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createMagasin(form as any);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce magasin ?")) return;
    await deleteMagasin(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Magasins</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Ajouter un magasin"}
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
            placeholder="Nom du magasin"
            value={form.nomMagasin}
            onChange={(e) => setForm({ ...form, nomMagasin: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <input
            placeholder="Adresse"
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
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
              <th className="py-2 px-4 font-normal">Adresse</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {magasins.map((m) => (
              <tr key={m.id_magasin} className="border-b border-gray-50">
                <td className="py-2 px-4">{m.nom_magasin}</td>
                <td className="py-2 px-4 text-gray-500">{m.adresse ?? "-"}</td>
                <td className="py-2 px-4 text-right">
                  <button
                    onClick={() => handleDelete(m.id_magasin)}
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
