import { useEffect, useState } from "react";
import { createReception, getAchat, getAchats, getReceptions } from "../services/api";
import type { BonCommande, LigneReceptionInput, Reception } from "../types";

interface CartLine extends LigneReceptionInput {
  nomArticle: string;
}

export default function ReceptionList() {
  const [receptions, setReceptions] = useState<Reception[]>([]);
  const [achats, setAchats] = useState<BonCommande[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [idBonCommande, setIdBonCommande] = useState("");
  const [detail, setDetail] = useState<BonCommande | null>(null);
  const [lignes, setLignes] = useState<CartLine[]>([]);
  const [agentReceptionneur, setAgentReceptionneur] = useState("");
  const [numBl, setNumBl] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getReceptions(), getAchats()]).then(([r, a]) => {
      setReceptions(r);
      setAchats(a.filter((x) => x.statut !== "Receptionne"));
    });
  }

  useEffect(load, []);

  async function selectBonCommande(id: string) {
    setIdBonCommande(id);
    if (!id) {
      setDetail(null);
      setLignes([]);
      return;
    }
    const bc = await getAchat(Number(id));
    setDetail(bc);
    setLignes(
      (bc.lignes ?? []).map((l) => ({
        idArticle: l.idArticle,
        nomArticle: l.nom_article,
        quantiteRecue: l.quantiteCommandee,
        quantiteConforme: l.quantiteCommandee,
        quantiteDefectueuse: 0,
        prixAchatUnitaire: l.prixAchatUnitaire,
        numLot: "",
        datePeremption: "",
      }))
    );
  }

  function updateLigne(i: number, field: keyof CartLine, value: string) {
    setLignes((prev) =>
      prev.map((l, idx) =>
        idx === i
          ? {
              ...l,
              [field]:
                field === "quantiteRecue" || field === "quantiteConforme" || field === "quantiteDefectueuse"
                  ? Number(value)
                  : value,
            }
          : l
      )
    );
  }

  async function handleValidate() {
    if (!idBonCommande || lignes.length === 0) return;
    try {
      await createReception({
        idBonCommande: Number(idBonCommande),
        agentReceptionneur: agentReceptionneur || undefined,
        numBl: numBl || undefined,
        lignes,
      });
      setShowForm(false);
      setIdBonCommande("");
      setDetail(null);
      setLignes([]);
      setAgentReceptionneur("");
      setNumBl("");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Réceptions</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Nouvelle réception"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white border border-gray-100 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <select
              value={idBonCommande}
              onChange={(e) => selectBonCommande(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-3"
            >
              <option value="">Choisir un bon de commande à réceptionner</option>
              {achats.map((a) => (
                <option key={a.id_bon_commande} value={a.id_bon_commande}>
                  #{a.id_bon_commande} — {a.nom_fournisseur} — {a.date_commande}
                </option>
              ))}
            </select>
            <input
              placeholder="Agent réceptionneur"
              value={agentReceptionneur}
              onChange={(e) => setAgentReceptionneur(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm"
            />
            <input
              placeholder="Numéro de bon de livraison (BL)"
              value={numBl}
              onChange={(e) => setNumBl(e.target.value)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
            />
          </div>

          {detail && lignes.length > 0 && (
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 font-normal">Article</th>
                  <th className="py-2 font-normal">Qté reçue</th>
                  <th className="py-2 font-normal">Conforme</th>
                  <th className="py-2 font-normal">Défectueuse</th>
                  <th className="py-2 font-normal">N° lot</th>
                  <th className="py-2 font-normal">Péremption</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 pr-2">{l.nomArticle}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={l.quantiteRecue}
                        onChange={(e) => updateLigne(i, "quantiteRecue", e.target.value)}
                        className="w-20 border border-gray-200 rounded-md px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={l.quantiteConforme}
                        onChange={(e) => updateLigne(i, "quantiteConforme", e.target.value)}
                        className="w-20 border border-gray-200 rounded-md px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={l.quantiteDefectueuse}
                        onChange={(e) => updateLigne(i, "quantiteDefectueuse", e.target.value)}
                        className="w-20 border border-gray-200 rounded-md px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        placeholder="LOT-..."
                        value={l.numLot}
                        onChange={(e) => updateLigne(i, "numLot", e.target.value)}
                        className="w-28 border border-gray-200 rounded-md px-2 py-1 text-sm"
                      />
                    </td>
                    <td className="py-2">
                      <input
                        type="date"
                        value={l.datePeremption}
                        onChange={(e) => updateLigne(i, "datePeremption", e.target.value)}
                        className="border border-gray-200 rounded-md px-2 py-1 text-sm"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="text-xs text-gray-500 mb-3">
            Renseigne un numéro de lot et une date de péremption pour que le stock soit automatiquement mis à jour.
          </p>

          <button
            onClick={handleValidate}
            disabled={!idBonCommande || lignes.length === 0}
            className="bg-pharma-600 text-white text-sm px-4 py-2 rounded-md hover:bg-pharma-700 disabled:opacity-40"
          >
            Valider la réception
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Date</th>
              <th className="py-2 px-4 font-normal">Fournisseur</th>
              <th className="py-2 px-4 font-normal">N° BL</th>
              <th className="py-2 px-4 font-normal">Contrôle</th>
            </tr>
          </thead>
          <tbody>
            {receptions.map((r) => (
              <tr key={r.id_reception} className="border-b border-gray-50">
                <td className="py-2 px-4 text-gray-500">{r.date_reception}</td>
                <td className="py-2 px-4">{r.nom_fournisseur ?? "-"}</td>
                <td className="py-2 px-4 text-gray-500">{r.num_bl ?? "-"}</td>
                <td className="py-2 px-4">{r.statut_controle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
