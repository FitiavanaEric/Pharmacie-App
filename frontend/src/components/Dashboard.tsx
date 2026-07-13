import { useEffect, useState } from "react";
import { getDashboardStats, getLotsAlertes } from "../services/api";
import type { DashboardStats, Lot } from "../types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alertes, setAlertes] = useState<Lot[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDashboardStats(), getLotsAlertes()])
      .then(([s, a]) => {
        setStats(s);
        setAlertes(a);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">
        Impossible de charger le tableau de bord : {error}
      </div>
    );
  }

  if (!stats) {
    return <p className="text-gray-500 text-sm">Chargement...</p>;
  }

  const cards = [
    { label: "Ventes du jour", value: `${stats.ventesJour.toLocaleString()} Ar`, tone: "neutral" },
    { label: "Nombre de ventes", value: stats.nombreVentesJour, tone: "neutral" },
    { label: "Articles en stock critique", value: stats.articlesStockCritique, tone: "danger" },
    { label: "Lots proches de peremption", value: stats.lotsPeremptionProche, tone: "warning" },
  ];

  return (
    <div>
      <h1 className="text-lg font-medium text-gray-900 mb-4">Tableau de bord</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-lg p-4 ${
              c.tone === "danger"
                ? "bg-red-50"
                : c.tone === "warning"
                ? "bg-amber-50"
                : "bg-white border border-gray-100"
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                c.tone === "danger"
                  ? "text-red-700"
                  : c.tone === "warning"
                  ? "text-amber-700"
                  : "text-gray-500"
              }`}
            >
              {c.label}
            </p>
            <p
              className={`text-2xl font-medium ${
                c.tone === "danger"
                  ? "text-red-800"
                  : c.tone === "warning"
                  ? "text-amber-800"
                  : "text-gray-900"
              }`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-900 mb-3">Alertes stock et péremption</p>
        {alertes.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune alerte pour le moment.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-normal">Article</th>
                <th className="pb-2 font-normal">Lot</th>
                <th className="pb-2 font-normal">Stock</th>
                <th className="pb-2 font-normal">Péremption</th>
              </tr>
            </thead>
            <tbody>
              {alertes.map((l) => (
                <tr key={l.id_lot} className="border-b border-gray-50">
                  <td className="py-2">{l.nom_article}</td>
                  <td className="py-2 text-gray-500">{l.num_lot}</td>
                  <td className="py-2">{l.quantite_stock}</td>
                  <td className="py-2 text-gray-500">{l.date_peremption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
