import { useEffect, useState } from "react";
import {
  createArticle,
  deleteArticle,
  getArticles,
  getTypesArticle,
  getFournisseurs,
} from "../services/api";
import type { Article, Fournisseur, TypeArticle } from "../types";

const emptyForm = {
  nomArticle: "",
  codeBarre: "",
  prixVente: "",
  stockMinimum: "",
  idType: "",
  idFournisseur: "",
};

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [types, setTypes] = useState<TypeArticle[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([getArticles(), getTypesArticle(), getFournisseurs()])
      .then(([a, t, f]) => {
        setArticles(a);
        setTypes(t);
        setFournisseurs(f);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createArticle({
        nomArticle: form.nomArticle,
        codeBarre: form.codeBarre || undefined,
        prixVente: Number(form.prixVente),
        stockMinimum: Number(form.stockMinimum || 0),
        idType: form.idType ? Number(form.idType) : undefined,
        idFournisseur: form.idFournisseur ? Number(form.idFournisseur) : undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet article ?")) return;
    await deleteArticle(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Articles</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Ajouter un article"}
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
          <input
            required
            placeholder="Nom de l'article"
            value={form.nomArticle}
            onChange={(e) => setForm({ ...form, nomArticle: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <input
            placeholder="Code barre"
            value={form.codeBarre}
            onChange={(e) => setForm({ ...form, codeBarre: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            required
            type="number"
            step="0.01"
            placeholder="Prix de vente (Ar)"
            value={form.prixVente}
            onChange={(e) => setForm({ ...form, prixVente: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Seuil de stock minimum"
            value={form.stockMinimum}
            onChange={(e) => setForm({ ...form, stockMinimum: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <select
            value={form.idType}
            onChange={(e) => setForm({ ...form, idType: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Type d'article</option>
            {types.map((t) => (
              <option key={t.id_type} value={t.id_type}>
                {t.libelle_type}
              </option>
            ))}
          </select>
          <select
            value={form.idFournisseur}
            onChange={(e) => setForm({ ...form, idFournisseur: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          >
            <option value="">Fournisseur</option>
            {fournisseurs.map((f) => (
              <option key={f.id_fournisseur} value={f.id_fournisseur}>
                {f.nom}
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
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Chargement...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 px-4 font-normal">Nom</th>
                <th className="py-2 px-4 font-normal">Type</th>
                <th className="py-2 px-4 font-normal">Fournisseur</th>
                <th className="py-2 px-4 font-normal">Prix</th>
                <th className="py-2 px-4 font-normal">Stock</th>
                <th className="py-2 px-4 font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id_article} className="border-b border-gray-50">
                  <td className="py-2 px-4">{a.nom_article}</td>
                  <td className="py-2 px-4 text-gray-500">{a.libelle_type ?? "-"}</td>
                  <td className="py-2 px-4 text-gray-500">{a.nom_fournisseur ?? "-"}</td>
                  <td className="py-2 px-4">{Number(a.prix_vente).toLocaleString()} Ar</td>
                  <td className="py-2 px-4">
                    <span
                      className={
                        (a.stock_actuel ?? 0) <= a.stock_minimum
                          ? "text-red-600 font-medium"
                          : "text-gray-700"
                      }
                    >
                      {a.stock_actuel ?? 0}
                    </span>
                    <span className="text-gray-400"> / seuil {a.stock_minimum}</span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button
                      onClick={() => handleDelete(a.id_article)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
