import { useEffect, useState } from "react";
import {
  createTypeArticle,
  deleteTypeArticle,
  getTypesArticle,
  updateTypeArticle,
} from "../services/api";
import type { TypeArticle } from "../types";

const emptyForm = { libelleType: "", description: "", necessiteOrdonnance: false };

export default function TypeArticleList() {
  const [types, setTypes] = useState<TypeArticle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getTypesArticle().then(setTypes).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(t: TypeArticle) {
    setEditingId(t.id_type);
    setForm({
      libelleType: t.libelle_type,
      description: t.description ?? "",
      necessiteOrdonnance: t.necessite_ordonnance,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTypeArticle(editingId, form as any);
      } else {
        await createTypeArticle(form as any);
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
    if (!confirm("Supprimer ce type d'article ?")) return;
    try {
      await deleteTypeArticle(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Types d'article</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : startCreate())}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Ajouter un type"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3"
        >
          <p className="col-span-2 text-sm font-medium text-gray-900 -mb-1">
            {editingId ? "Modifier le type" : "Nouveau type d'article"}
          </p>
          <input
            required
            placeholder="Libellé (ex: Antibiotique)"
            value={form.libelleType}
            onChange={(e) => setForm({ ...form, libelleType: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 col-span-2">
            <input
              type="checkbox"
              checked={form.necessiteOrdonnance}
              onChange={(e) => setForm({ ...form, necessiteOrdonnance: e.target.checked })}
            />
            Nécessite une ordonnance
          </label>
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
              <th className="py-2 px-4 font-normal">Libellé</th>
              <th className="py-2 px-4 font-normal">Description</th>
              <th className="py-2 px-4 font-normal">Ordonnance requise</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t.id_type} className="border-b border-gray-50">
                <td className="py-2 px-4">{t.libelle_type}</td>
                <td className="py-2 px-4 text-gray-500">{t.description ?? "-"}</td>
                <td className="py-2 px-4">
                  {t.necessite_ordonnance ? (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-xs">Oui</span>
                  ) : (
                    <span className="text-gray-500">Non</span>
                  )}
                </td>
                <td className="py-2 px-4 text-right space-x-3">
                  <button onClick={() => startEdit(t)} className="text-xs text-pharma-700 hover:underline">
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(t.id_type)}
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