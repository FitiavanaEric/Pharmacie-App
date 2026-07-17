import { useEffect, useState } from "react";
import { createMutuelle, deleteMutuelle, getMutuelles, updateMutuelle } from "../services/api";
import type { Mutuelle } from "../types";

const emptyForm = { nomMutuelle: "", tauxRemboursement: "", contact: "" };

export default function MutuelleList() {
  const [mutuelles, setMutuelles] = useState<Mutuelle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getMutuelles().then(setMutuelles).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(m: Mutuelle) {
    setEditingId(m.id_mutuelle);
    setForm({
      nomMutuelle: m.nom_mutuelle,
      tauxRemboursement: String(m.taux_remboursement),
      contact: m.contact ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      nomMutuelle: form.nomMutuelle,
      tauxRemboursement: Number(form.tauxRemboursement || 0),
      contact: form.contact || undefined,
    };
    try {
      if (editingId) {
        await updateMutuelle(editingId, payload);
      } else {
        await createMutuelle(payload);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette mutuelle ?")) return;
    await deleteMutuelle(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Mutuelles</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : startCreate())}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Ajouter une mutuelle"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3"
        >
          <p className="col-span-2 text-sm font-medium text-gray-900 -mb-1">
            {editingId ? "Modifier la mutuelle" : "Nouvelle mutuelle"}
          </p>
          <input
            required
            placeholder="Nom de la mutuelle"
            value={form.nomMutuelle}
            onChange={(e) => setForm({ ...form, nomMutuelle: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Taux de remboursement (%)"
            value={form.tauxRemboursement}
            onChange={(e) => setForm({ ...form, tauxRemboursement: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="col-span-2 bg-pharma-600 text-white text-sm py-2 rounded-md hover:bg-pharma-700"
          >
            {editingId ? "Enregistrer les modifications" : "Enregistrer"}
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Nom</th>
              <th className="py-2 px-4 font-normal">Taux</th>
              <th className="py-2 px-4 font-normal">Contact</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {mutuelles.map((m) => (
              <tr key={m.id_mutuelle} className="border-b border-gray-50">
                <td className="py-2 px-4">{m.nom_mutuelle}</td>
                <td className="py-2 px-4">{m.taux_remboursement}%</td>
                <td className="py-2 px-4 text-gray-500">{m.contact ?? "-"}</td>
                <td className="py-2 px-4 text-right space-x-3">
                  <button onClick={() => startEdit(m)} className="text-xs text-pharma-700 hover:underline">
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(m.id_mutuelle)}
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
