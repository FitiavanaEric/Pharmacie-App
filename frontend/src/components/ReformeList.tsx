import { useEffect, useState } from "react";
import { createReforme, deleteReforme, getLots, getReformes } from "../services/api";
import type { Lot, Reforme } from "../types";

const emptyForm = { idLot: "", quantite: "", motif: "", valeur: "" };

export default function ReformeList() {
  const [reformes, setReformes] = useState<Reforme[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getReformes(), getLots()]).then(([r, l]) => {
      setReformes(r);
      setLots(l.filter((x) => x.quantite_stock > 0));
    });
  }

  useEffect(load, []);

  const lotChoisi = lots.find((l) => l.id_lot === Number(form.idLot));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lotChoisi) return;
    try {
      await createReforme({
        idArticle: lotChoisi.id_article,
        idLot: lotChoisi.id_lot,
        quantite: Number(form.quantite),
        motif: form.motif || undefined,
        valeur: form.valeur ? Number(form.valeur) : undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette réforme ? (le stock ne sera pas restauré automatiquement)")) return;
    await deleteReforme(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Réformes / Destructions</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Déclarer une réforme"}
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
            value={form.idLot}
            onChange={(e) => setForm({ ...form, idLot: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          >
            <option value="">Lot concerné (le stock réel sera décrémenté)</option>
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
            value={form.quantite}
            onChange={(e) => setForm({ ...form, quantite: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Valeur perdue (Ar)"
            value={form.valeur}
            onChange={(e) => setForm({ ...form, valeur: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Motif (péremption, casse...)"
            value={form.motif}
            onChange={(e) => setForm({ ...form, motif: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
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
              <th className="py-2 px-4 font-normal">Date</th>
              <th className="py-2 px-4 font-normal">Article</th>
              <th className="py-2 px-4 font-normal">Quantité</th>
              <th className="py-2 px-4 font-normal">Motif</th>
              <th className="py-2 px-4 font-normal">Valeur perdue</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {reformes.map((r) => (
              <tr key={r.id_reforme} className="border-b border-gray-50">
                <td className="py-2 px-4 text-gray-500">{r.date_reforme}</td>
                <td className="py-2 px-4">{r.nom_article}</td>
                <td className="py-2 px-4">{r.quantite}</td>
                <td className="py-2 px-4 text-gray-500">{r.motif ?? "-"}</td>
                <td className="py-2 px-4 text-red-600">{Number(r.valeur).toLocaleString()} Ar</td>
                <td className="py-2 px-4 text-right">
                  <button
                    onClick={() => handleDelete(r.id_reforme)}
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
