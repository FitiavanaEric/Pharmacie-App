import { useEffect, useState } from "react";
import { createVente, getArticles, getClients, getVentes } from "../services/api";
import type { Article, Client, LigneVenteInput, Vente } from "../types";

interface CartLine extends LigneVenteInput {
  nomArticle: string;
}

export default function VenteList() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedArticle, setSelectedArticle] = useState("");
  const [quantite, setQuantite] = useState("1");
  const [idClient, setIdClient] = useState("");
  const [modePaiement, setModePaiement] = useState("Especes");
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getVentes(), getArticles(), getClients()]).then(([v, a, c]) => {
      setVentes(v);
      setArticles(a);
      setClients(c);
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
        quantiteVendue: Number(quantite),
        prixUnitaireVente: Number(article.prix_vente),
      },
    ]);
    setSelectedArticle("");
    setQuantite("1");
  }

  function removeLine(index: number) {
    setCart(cart.filter((_, i) => i !== index));
  }

  const total = cart.reduce((sum, l) => sum + l.quantiteVendue * l.prixUnitaireVente, 0);

  async function handleValidate() {
    if (cart.length === 0) return;
    try {
      await createVente({
        idClient: idClient ? Number(idClient) : undefined,
        modePaiement,
        lignes: cart.map(({ idArticle, quantiteVendue, prixUnitaireVente }) => ({
          idArticle,
          quantiteVendue,
          prixUnitaireVente,
        })),
      });
      setCart([]);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-lg font-medium text-gray-900 mb-4">Ventes</h1>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-gray-900 mb-3">Nouvelle vente</p>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <select
            value={selectedArticle}
            onChange={(e) => setSelectedArticle(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          >
            <option value="">Choisir un article</option>
            {articles.map((a) => (
              <option key={a.id_article} value={a.id_article}>
                {a.nom_article} — {Number(a.prix_vente).toLocaleString()} Ar
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={addToCart}
          disabled={!selectedArticle}
          className="text-sm border border-pharma-600 text-pharma-700 px-3 py-1.5 rounded-md hover:bg-pharma-50 disabled:opacity-40 mb-4"
        >
          Ajouter au panier
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
                  <td className="py-2">{l.quantiteVendue}</td>
                  <td className="py-2">
                    {(l.quantiteVendue * l.prixUnitaireVente).toLocaleString()} Ar
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

        <div className="grid grid-cols-3 gap-3 mb-3">
          <select
            value={idClient}
            onChange={(e) => setIdClient(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Client (optionnel)</option>
            {clients.map((c) => (
              <option key={c.id_client} value={c.id_client}>
                {c.nom} {c.prenom}
              </option>
            ))}
          </select>
          <select
            value={modePaiement}
            onChange={(e) => setModePaiement(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="Especes">Espèces</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Carte">Carte bancaire</option>
          </select>
          <div className="flex items-center justify-end font-medium text-gray-900">
            Total : {total.toLocaleString()} Ar
          </div>
        </div>

        <button
          onClick={handleValidate}
          disabled={cart.length === 0}
          className="w-full bg-pharma-600 text-white text-sm py-2 rounded-md hover:bg-pharma-700 disabled:opacity-40"
        >
          Valider la vente
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <p className="text-sm font-medium text-gray-900 px-4 pt-4 pb-2">Historique des ventes</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Date</th>
              <th className="py-2 px-4 font-normal">Client</th>
              <th className="py-2 px-4 font-normal">Paiement</th>
              <th className="py-2 px-4 font-normal">Montant net</th>
            </tr>
          </thead>
          <tbody>
            {ventes.map((v) => (
              <tr key={v.id_vente} className="border-b border-gray-50">
                <td className="py-2 px-4">{v.date_vente} {v.heure_vente}</td>
                <td className="py-2 px-4 text-gray-500">
                  {v.nom_client ? `${v.nom_client} ${v.prenom_client ?? ""}` : "Anonyme"}
                </td>
                <td className="py-2 px-4 text-gray-500">{v.mode_paiement}</td>
                <td className="py-2 px-4">{Number(v.montant_net).toLocaleString()} Ar</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
