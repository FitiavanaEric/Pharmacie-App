import { useEffect, useState } from "react";
import { createLot, getArticles, getLots, getMagasins, updateLot } from "../services/api";
import type { Article, Lot, Magasin } from "../types";

const emptyForm = {
  numLot: "",
  idArticle: "",
  datePeremption: "",
  quantiteStock: "",
  emplacement: "",
  idMagasin: "",
};

function isPerimeSoon(date: string) {
  const diffDays = (new Date(date).getTime() - Date.now()) / 86400000;
  return diffDays <= 90;
}

export default function LotList() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getLots(), getArticles(), getMagasins()])
      .then(([l, a, m]) => {
        setLots(l);
        setArticles(a);
        setMagasins(m);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(l: Lot) {
    setEditingId(l.id_lot);
    setForm({
      numLot: l.num_lot,
      idArticle: String(l.id_article),
      datePeremption: l.date_peremption,
      quantiteStock: String(l.quantite_stock),
      emplacement: l.emplacement ?? "",
      idMagasin: l.id_magasin ? String(l.id_magasin) : "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        // Seuls quantite et emplacement sont modifiables pour un lot existant
        await updateLot(editingId, {
          quantiteStock: Number(form.quantiteStock),
          emplacement: form.emplacement || undefined,
        } as any);
      } else {
        await createLot({
          numLot: form.numLot,
          idArticle: Number(form.idArticle),
          datePeremption: form.datePeremption,
          quantiteStock: Number(form.quantiteStock),
          emplacement: form.emplacement || undefined,
          idMagasin: form.idMagasin ? Number(form.idMagasin) : undefined,
        } as any);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Stock par lot</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : startCreate())}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Ajouter un lot"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3"
        >
          <p className="col-span-2 text-sm font-medium text-gray-900 -mb-1">
            {editingId ? "Modifier le lot (quantité / emplacement)" : "Nouveau lot"}
          </p>
          <select
            required
            disabled={!!editingId}
            value={form.idArticle}
            onChange={(e) => setForm({ ...form, idArticle: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2 disabled:bg-gray-50"
          >
            <option value="">Article concerné</option>
            {articles.map((a) => (
              <option key={a.id_article} value={a.id_article}>
                {a.nom_article}
              </option>
            ))}
          </select>
          <input
            required
            disabled={!!editingId}
            placeholder="Numéro de lot"
            value={form.numLot}
            onChange={(e) => setForm({ ...form, numLot: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
          />
          <input
            required
            type="number"
            placeholder="Quantité en stock"
            value={form.quantiteStock}
            onChange={(e) => setForm({ ...form, quantiteStock: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <select
            required
            disabled={!!editingId}
            value={form.idMagasin}
            onChange={(e) => setForm({ ...form, idMagasin: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
          >
            <option value="">Magasin</option>
            {magasins.map((m) => (
              <option key={m.id_magasin} value={m.id_magasin}>
                {m.nom_magasin}
              </option>
            ))}
          </select>
          <label className="text-xs text-gray-500 col-span-2 -mb-2">Date de péremption</label>
          <input
            required
            disabled={!!editingId}
            type="date"
            value={form.datePeremption}
            onChange={(e) => setForm({ ...form, datePeremption: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm disabled:bg-gray-50"
          />
          <input
            placeholder="Emplacement (ex: Rayon A1)"
            value={form.emplacement}
            onChange={(e) => setForm({ ...form, emplacement: e.target.value })}
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
              <th className="py-2 px-4 font-normal">Article</th>
              <th className="py-2 px-4 font-normal">Lot</th>
              <th className="py-2 px-4 font-normal">Magasin</th>
              <th className="py-2 px-4 font-normal">Emplacement</th>
              <th className="py-2 px-4 font-normal">Quantité</th>
              <th className="py-2 px-4 font-normal">Péremption</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {lots.map((l) => (
              <tr key={l.id_lot} className="border-b border-gray-50">
                <td className="py-2 px-4">{l.nom_article}</td>
                <td className="py-2 px-4 text-gray-500">{l.num_lot}</td>
                <td className="py-2 px-4 text-gray-500">{l.nom_magasin ?? "-"}</td>
                <td className="py-2 px-4 text-gray-500">{l.emplacement ?? "-"}</td>
                <td className="py-2 px-4">{l.quantite_stock}</td>
                <td
                  className={`py-2 px-4 ${
                    isPerimeSoon(l.date_peremption) ? "text-amber-700 font-medium" : "text-gray-500"
                  }`}
                >
                  {l.date_peremption}
                </td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => startEdit(l)} className="text-xs text-pharma-700 hover:underline">
                    Modifier
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
