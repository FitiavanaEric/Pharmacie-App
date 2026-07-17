import { useEffect, useState } from "react";
import { createAchat, deleteAchat, getAchats, getArticles, getFournisseurs, updateAchatStatut } from "../services/api";
import type { Article, BonCommande, Fournisseur, LigneCommandeInput } from "../types";

interface CartLine extends LigneCommandeInput {
  nomArticle: string;
}

const STATUTS = ["Emis", "Approuve", "Receptionne", "Annule"];

export default function AchatList() {
  const [achats, setAchats] = useState<BonCommande[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [idFournisseur, setIdFournisseur] = useState("");
  const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedArticle, setSelectedArticle] = useState("");
  const [quantite, setQuantite] = useState("1");
  const [prixAchat, setPrixAchat] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getAchats(), getArticles(), getFournisseurs()]).then(([a, art, f]) => {
      setAchats(a);
      setArticles(art);
      setFournisseurs(f);
    });
  }

  useEffect(load, []);

  function addToCart() {
    const article = articles.find((a) => a.id_article === Number(selectedArticle));
    if (!article) return;
    setCart([
      ...cart,
      {
        idArticle: article.id_article,
        nomArticle: article.nom_article,
        quantiteCommandee: Number(quantite),
        prixAchatUnitaire: Number(prixAchat || 0),
      },
    ]);
    setSelectedArticle("");
    setQuantite("1");
    setPrixAchat("");
  }

  function removeLine(i: number) {
    setCart(cart.filter((_, idx) => idx !== i));
  }

  const total = cart.reduce((sum, l) => sum + l.quantiteCommandee * l.prixAchatUnitaire, 0);

  async function handleValidate() {
    if (!idFournisseur || cart.length === 0) return;
    try {
      await createAchat({
        idFournisseur: Number(idFournisseur),
        dateLivraisonPrevue: dateLivraisonPrevue || undefined,
        lignes: cart.map(({ idArticle, quantiteCommandee, prixAchatUnitaire }) => ({
          idArticle,
          quantiteCommandee,
          prixAchatUnitaire,
        })),
      });
      setCart([]);
      setIdFournisseur("");
      setDateLivraisonPrevue("");
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleStatutChange(id: number, statut: string) {
    await updateAchatStatut(id, statut);
    load();
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce bon de commande ?")) return;
    await deleteAchat(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Achats — Bons de commande</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Nouveau bon de commande"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <select
              value={idFournisseur}
              onChange={(e) => setIdFournisseur(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Fournisseur</option>
              {fournisseurs.map((f) => (
                <option key={f.id_fournisseur} value={f.id_fournisseur}>
                  {f.nom}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateLivraisonPrevue}
              onChange={(e) => setDateLivraisonPrevue(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              placeholder="Date livraison prévue"
            />
          </div>

          <div className="grid grid-cols-4 gap-3 mb-3">
            <select
              value={selectedArticle}
              onChange={(e) => setSelectedArticle(e.target.value)}
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
              type="number"
              min="1"
              value={quantite}
              onChange={(e) => setQuantite(e.target.value)}
              placeholder="Qté"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.01"
              value={prixAchat}
              onChange={(e) => setPrixAchat(e.target.value)}
              placeholder="Prix d'achat"
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={addToCart}
            disabled={!selectedArticle}
            className="text-sm border border-pharma-600 text-pharma-700 px-3 py-1.5 rounded-md hover:bg-pharma-50 disabled:opacity-40 mb-4"
          >
            Ajouter la ligne
          </button>

          {cart.length > 0 && (
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 font-normal">Article</th>
                  <th className="py-2 font-normal">Qté</th>
                  <th className="py-2 font-normal">Montant</th>
                  <th className="py-2 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((l, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2">{l.nomArticle}</td>
                    <td className="py-2">{l.quantiteCommandee}</td>
                    <td className="py-2">
                      {(l.quantiteCommandee * l.prixAchatUnitaire).toLocaleString()} Ar
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => removeLine(i)} className="text-xs text-red-600 hover:underline">
                        Retirer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-900">Total HT : {total.toLocaleString()} Ar</p>
            <button
              onClick={handleValidate}
              disabled={!idFournisseur || cart.length === 0}
              className="bg-pharma-600 text-white text-sm px-4 py-2 rounded-md hover:bg-pharma-700 disabled:opacity-40"
            >
              Valider le bon de commande
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Date</th>
              <th className="py-2 px-4 font-normal">Fournisseur</th>
              <th className="py-2 px-4 font-normal">Montant TTC</th>
              <th className="py-2 px-4 font-normal">Statut</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {achats.map((a) => (
              <tr key={a.id_bon_commande} className="border-b border-gray-50">
                <td className="py-2 px-4 text-gray-500">{a.date_commande}</td>
                <td className="py-2 px-4">{a.nom_fournisseur ?? "-"}</td>
                <td className="py-2 px-4">{Number(a.montant_total_ttc).toLocaleString()} Ar</td>
                <td className="py-2 px-4">
                  <select
                    value={a.statut}
                    onChange={(e) => handleStatutChange(a.id_bon_commande, e.target.value)}
                    className="border border-gray-200 rounded-md px-2 py-1 text-xs"
                  >
                    {STATUTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-right">
                  <button
                    onClick={() => handleDelete(a.id_bon_commande)}
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
