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
  const { comparaisonPeriodes: comp } = data;
  const evolution = comp.evolutionPourcent;

  return (
    <div>
      <h1 className="text-lg font-medium text-gray-900 mb-4">Rapports & statistiques</h1>

      {/* Comparaison de periodes */}
      <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-gray-900 mb-3">
          Comparaison : 30 derniers jours vs 30 jours précédents
        </p>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Période actuelle</p>
            <p className="text-xl font-medium text-gray-900">
              {comp.periodeActuelle.total.toLocaleString()} Ar
            </p>
            <p className="text-xs text-gray-400">{comp.periodeActuelle.nombre} vente(s)</p>
          </div>
          <div className="text-gray-300">vs</div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Période précédente</p>
            <p className="text-xl font-medium text-gray-500">
              {comp.periodePrecedente.total.toLocaleString()} Ar
            </p>
            <p className="text-xs text-gray-400">{comp.periodePrecedente.nombre} vente(s)</p>
          </div>
          {evolution !== null && (
            <div
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                evolution >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
            >
              {evolution >= 0 ? "+" : ""}
              {evolution}%
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Valeur du stock actuel</p>
          <p className="text-2xl font-medium text-gray-900">
            {data.valeurStock.toLocaleString()} Ar
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Chiffre d'affaires total</p>
          <p className="text-2xl font-medium text-gray-900">
            {data.margeGlobale.chiffreAffaires.toLocaleString()} Ar
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1">Coût d'achat estimé</p>
          <p className="text-2xl font-medium text-gray-900">
            {data.margeGlobale.coutTotal.toLocaleString()} Ar
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-green-700 mb-1">Marge estimée</p>
          <p className="text-2xl font-medium text-green-800">
            {data.margeGlobale.margeTotale.toLocaleString()} Ar
          </p>
        </div>
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

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
          <p className="text-sm font-medium text-gray-900 px-4 pt-4 pb-2">
            Top articles vendus (avec marge)
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 px-4 font-normal">Article</th>
                <th className="py-2 px-4 font-normal">Qté</th>
                <th className="py-2 px-4 font-normal">Marge</th>
              </tr>
            </thead>
            <tbody>
              {data.topArticles.map((a) => (
                <tr key={a.nom_article} className="border-b border-gray-50">
                  <td className="py-2 px-4">{a.nom_article}</td>
                  <td className="py-2 px-4">{a.quantite_totale}</td>
                  <td
                    className={`py-2 px-4 ${
                      a.marge_estimee >= 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {a.marge_estimee.toLocaleString()} Ar
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
          <p className="text-sm font-medium text-gray-900 px-4 pt-4 pb-2">
            Rotation de stock (30 jours)
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-2 px-4 font-normal">Article</th>
                <th className="py-2 px-4 font-normal">Stock</th>
                <th className="py-2 px-4 font-normal">Rotation</th>
              </tr>
            </thead>
            <tbody>
              {data.rotationStock.map((r) => (
                <tr key={r.nom_article} className="border-b border-gray-50">
                  <td className="py-2 px-4">{r.nom_article}</td>
                  <td className="py-2 px-4">{r.stock_actuel}</td>
                  <td className="py-2 px-4">{r.taux_rotation}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 px-4 pb-3">
            Rotation = quantité vendue sur 30 jours ÷ stock actuel. Plus c'est élevé, plus l'article tourne vite.
          </p>
        </div>
      </div>
    </div>
  );
}
