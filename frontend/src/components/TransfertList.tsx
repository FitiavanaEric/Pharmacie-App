import { useEffect, useState } from "react";
import { createTransfert, deleteTransfert, getArticles, getMagasins, getTransferts } from "../services/api";
import type { Article, Magasin, Transfert } from "../types";

const emptyForm = { idArticle: "", quantite: "", magasinSource: "", magasinDestination: "" };

export default function TransfertList() {
  const [transferts, setTransferts] = useState<Transfert[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getTransferts(), getArticles(), getMagasins().catch(() => [])]).then(
      ([t, a, m]) => {
        setTransferts(t);
        setArticles(a);
        setMagasins(m);
      }
    );
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTransfert({
        idArticle: Number(form.idArticle),
        quantite: Number(form.quantite),
        magasinSource: form.magasinSource ? Number(form.magasinSource) : undefined,
        magasinDestination: form.magasinDestination ? Number(form.magasinDestination) : undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce transfert ?")) return;
    await deleteTransfert(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Transferts entre magasins</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Nouveau transfert"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}
      {magasins.length === 0 && (
        <div className="mb-4 p-3 rounded-md bg-amber-50 text-amber-700 text-sm">
          Aucun magasin enregistré. Ajoute un magasin directement dans la table <code>magasin</code>{" "}
          (phpMyAdmin) pour pouvoir choisir une source/destination — sinon le transfert reste possible
          sans indiquer de magasin.
        </div>
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
            <option value="">Article</option>
            {articles.map((a) => (
              <option key={a.id_article} value={a.id_article}>
                {a.nom_article}
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            min="1"
            placeholder="Quantité"
            value={form.quantite}
            onChange={(e) => setForm({ ...form, quantite: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <select
            value={form.magasinSource}
            onChange={(e) => setForm({ ...form, magasinSource: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Magasin source</option>
            {magasins.map((m) => (
              <option key={m.id_magasin} value={m.id_magasin}>
                {m.nom_magasin}
              </option>
            ))}
          </select>
          <select
            value={form.magasinDestination}
            onChange={(e) => setForm({ ...form, magasinDestination: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Magasin destination</option>
            {magasins.map((m) => (
              <option key={m.id_magasin} value={m.id_magasin}>
                {m.nom_magasin}
              </option>
            ))}
          </select>
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
              <th className="py-2 px-4 font-normal">Date</th>
              <th className="py-2 px-4 font-normal">Article</th>
              <th className="py-2 px-4 font-normal">Quantité</th>
              <th className="py-2 px-4 font-normal">Source → Destination</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {transferts.map((t) => (
              <tr key={t.id_transfert} className="border-b border-gray-50">
                <td className="py-2 px-4 text-gray-500">{t.date_transfert}</td>
                <td className="py-2 px-4">{t.nom_article}</td>
                <td className="py-2 px-4">{t.quantite}</td>
                <td className="py-2 px-4 text-gray-500">
                  {t.nom_source ?? "-"} → {t.nom_destination ?? "-"}
                </td>
                <td className="py-2 px-4 text-right">
                  <button
                    onClick={() => handleDelete(t.id_transfert)}
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
