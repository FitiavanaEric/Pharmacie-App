import { useEffect, useState } from "react";
import { getRapports } from "../services/api";
import type { RapportStats } from "../types";

export default function Rapports() {
  const [data, setData] = useState<RapportStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRapports().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>;
  }
  if (!data) {
    return <p className="text-sm text-gray-500">Chargement...</p>;
  }

  const maxVente = Math.max(1, ...data.ventesParJour.map((v) => Number(v.total)));

  return (
    <div>
      <h1 className="text-lg font-medium text-gray-900 mb-4">Rapports & statistiques</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Valeur du stock actuel</p>
          <p className="text-2xl font-medium text-gray-900">
            {data.valeurStock.toLocaleString()} Ar
          </p>
        </div>
        {data.parModePaiement.map((m) => (
          <div key={m.mode_paiement} className="bg-white border border-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">{m.mode_paiement}</p>
            <p className="text-2xl font-medium text-gray-900">
              {Number(m.total).toLocaleString()} Ar
            </p>
            <p className="text-xs text-gray-400">{m.nombre} vente(s)</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-gray-900 mb-3">Ventes des 30 derniers jours</p>
        {data.ventesParJour.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune vente enregistrée sur cette période.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {data.ventesParJour.map((v) => (
              <div key={v.date_vente} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-pharma-400 rounded-t-sm"
                  style={{ height: `${(Number(v.total) / maxVente) * 100}%`, minHeight: 2 }}
                  title={`${v.date_vente} : ${Number(v.total).toLocaleString()} Ar`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <p className="text-sm font-medium text-gray-900 px-4 pt-4 pb-2">
          Top 10 articles les plus vendus
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Article</th>
              <th className="py-2 px-4 font-normal">Quantité vendue</th>
              <th className="py-2 px-4 font-normal">Montant total</th>
            </tr>
          </thead>
          <tbody>
            {data.topArticles.map((a) => (
              <tr key={a.nom_article} className="border-b border-gray-50">
                <td className="py-2 px-4">{a.nom_article}</td>
                <td className="py-2 px-4">{a.quantite_totale}</td>
                <td className="py-2 px-4">{Number(a.montant_total).toLocaleString()} Ar</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
