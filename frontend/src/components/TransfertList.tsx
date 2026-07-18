import { useEffect, useState } from "react";
import { createTransfert, deleteTransfert, getLots, getMagasins, getTransferts } from "../services/api";
import type { Lot, Magasin, Transfert } from "../types";

export default function TransfertList() {
  const [transferts, setTransferts] = useState<Transfert[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [idLot, setIdLot] = useState("");
  const [quantite, setQuantite] = useState("");
  const [magasinDestination, setMagasinDestination] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getTransferts(), getLots(), getMagasins()]).then(([t, l, m]) => {
      setTransferts(t);
      setLots(l.filter((x) => x.quantite_stock > 0));
      setMagasins(m);
    });
  }

  useEffect(load, []);

  const lotChoisi = lots.find((l) => l.id_lot === Number(idLot));
  const magasinsDisponibles = magasins.filter((m) => m.id_magasin !== lotChoisi?.id_magasin);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTransfert({
        idLot: Number(idLot),
        quantite: Number(quantite),
        magasinDestination: Number(magasinDestination),
      } as any);
      setIdLot("");
      setQuantite("");
      setMagasinDestination("");
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce transfert ? (le stock ne sera pas remis en place automatiquement)")) return;
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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3"
        >
          <select
            required
            value={idLot}
            onChange={(e) => setIdLot(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          >
            <option value="">Lot source (article + magasin actuel)</option>
            {lots.map((l) => (
              <option key={l.id_lot} value={l.id_lot}>
                {l.nom_article} — {l.num_lot} — {l.nom_magasin ?? "sans magasin"} (stock : {l.quantite_stock})
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            min="1"
            max={lotChoisi?.quantite_stock ?? undefined}
            placeholder={`Quantité${lotChoisi ? ` (max ${lotChoisi.quantite_stock})` : ""}`}
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <select
            required
            value={magasinDestination}
            onChange={(e) => setMagasinDestination(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Magasin destination</option>
            {magasinsDisponibles.map((m) => (
              <option key={m.id_magasin} value={m.id_magasin}>
                {m.nom_magasin}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="col-span-2 bg-pharma-600 text-white text-sm py-2 rounded-md hover:bg-pharma-700"
          >
            Transférer
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
