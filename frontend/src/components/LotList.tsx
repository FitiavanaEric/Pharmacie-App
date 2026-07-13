import { useEffect, useState } from "react";
import { createLot, getArticles, getLots } from "../services/api";
import type { Article, Lot } from "../types";

const emptyForm = {
  numLot: "",
  idArticle: "",
  datePeremption: "",
  quantiteStock: "",
  emplacement: "",
};

function isPerimeSoon(date: string) {
  const diffDays = (new Date(date).getTime() - Date.now()) / 86400000;
  return diffDays <= 90;
}

export default function LotList() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getLots(), getArticles()])
      .then(([l, a]) => {
        setLots(l);
        setArticles(a);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createLot({
        numLot: form.numLot,
        idArticle: Number(form.idArticle),
        datePeremption: form.datePeremption,
        quantiteStock: Number(form.quantiteStock),
        emplacement: form.emplacement || undefined,
      } as any);
      setForm(emptyForm);
      setShowForm(false);
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
          onClick={() => setShowForm((v) => !v)}
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
          <select
            required
            value={form.idArticle}
            onChange={(e) => setForm({ ...form, idArticle: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
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
            placeholder="Numéro de lot"
            value={form.numLot}
            onChange={(e) => setForm({ ...form, numLot: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            placeholder="Quantité en stock"
            value={form.quantiteStock}
            onChange={(e) => setForm({ ...form, quantiteStock: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <label className="text-xs text-gray-500 col-span-2 -mb-2">Date de péremption</label>
          <input
            required
            type="date"
            value={form.datePeremption}
            onChange={(e) => setForm({ ...form, datePeremption: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
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
            Enregistrer
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Article</th>
              <th className="py-2 px-4 font-normal">Lot</th>
              <th className="py-2 px-4 font-normal">Emplacement</th>
              <th className="py-2 px-4 font-normal">Quantité</th>
              <th className="py-2 px-4 font-normal">Péremption</th>
            </tr>
          </thead>
          <tbody>
            {lots.map((l) => (
              <tr key={l.id_lot} className="border-b border-gray-50">
                <td className="py-2 px-4">{l.nom_article}</td>
                <td className="py-2 px-4 text-gray-500">{l.num_lot}</td>
                <td className="py-2 px-4 text-gray-500">{l.emplacement ?? "-"}</td>
                <td className="py-2 px-4">{l.quantite_stock}</td>
                <td
                  className={`py-2 px-4 ${
                    isPerimeSoon(l.date_peremption) ? "text-amber-700 font-medium" : "text-gray-500"
                  }`}
                >
                  {l.date_peremption}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
