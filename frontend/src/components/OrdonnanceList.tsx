import { useEffect, useState } from "react";
import {
  createOrdonnance,
  deleteOrdonnance,
  getClients,
  getOrdonnances,
  updateOrdonnance,
} from "../services/api";
import type { Client, Ordonnance } from "../types";

const emptyForm = { idClient: "", medecinPrescripteur: "", dureeTraitement: "", statutValidation: "En attente" };

const STATUTS = ["En attente", "Validee", "Refusee"];

function statutColor(s: string) {
  if (s === "Validee") return "bg-green-50 text-green-700";
  if (s === "Refusee") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

export default function OrdonnanceList() {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getOrdonnances(), getClients()])
      .then(([o, c]) => {
        setOrdonnances(o);
        setClients(c);
      })
      .catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(o: Ordonnance) {
    setEditingId(o.id_ordonnance);
    setForm({
      idClient: String(o.id_client),
      medecinPrescripteur: o.medecin_prescripteur,
      dureeTraitement: o.duree_traitement ?? "",
      statutValidation: o.statut_validation,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateOrdonnance(editingId, {
          medecinPrescripteur: form.medecinPrescripteur,
          dureeTraitement: form.dureeTraitement || undefined,
          statutValidation: form.statutValidation,
        });
      } else {
        await createOrdonnance({
          idClient: Number(form.idClient),
          medecinPrescripteur: form.medecinPrescripteur,
          dureeTraitement: form.dureeTraitement || undefined,
          statutValidation: form.statutValidation,
        });
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette ordonnance ?")) return;
    await deleteOrdonnance(id);
    load();
  }

  async function quickValidate(o: Ordonnance, statut: string) {
    await updateOrdonnance(o.id_ordonnance, {
      medecinPrescripteur: o.medecin_prescripteur,
      dureeTraitement: o.duree_traitement,
      statutValidation: statut,
    });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Ordonnances</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : startCreate())}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Ajouter une ordonnance"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3"
        >
          <p className="col-span-2 text-sm font-medium text-gray-900 -mb-1">
            {editingId ? "Modifier l'ordonnance" : "Nouvelle ordonnance"}
          </p>
          <select
            required
            disabled={!!editingId}
            value={form.idClient}
            onChange={(e) => setForm({ ...form, idClient: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2 disabled:bg-gray-50"
          >
            <option value="">Client</option>
            {clients.map((c) => (
              <option key={c.id_client} value={c.id_client}>
                {c.nom} {c.prenom}
              </option>
            ))}
          </select>
          <input
            required
            placeholder="Médecin prescripteur"
            value={form.medecinPrescripteur}
            onChange={(e) => setForm({ ...form, medecinPrescripteur: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm col-span-2"
          />
          <input
            placeholder="Durée de traitement (ex: 7 jours)"
            value={form.dureeTraitement}
            onChange={(e) => setForm({ ...form, dureeTraitement: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <select
            value={form.statutValidation}
            onChange={(e) => setForm({ ...form, statutValidation: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {s === "Validee" ? "Validée" : s === "Refusee" ? "Refusée" : s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="col-span-2 bg-pharma-600 text-white text-sm py-2 rounded-md hover:bg-pharma-700"
          >
            {editingId ? "Enregistrer les modifications" : "Enregistrer"}
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Date</th>
              <th className="py-2 px-4 font-normal">Client</th>
              <th className="py-2 px-4 font-normal">Médecin</th>
              <th className="py-2 px-4 font-normal">Statut</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {ordonnances.map((o) => (
              <tr key={o.id_ordonnance} className="border-b border-gray-50">
                <td className="py-2 px-4 text-gray-500">{o.date_ordonnance}</td>
                <td className="py-2 px-4">{o.nom_client} {o.prenom_client}</td>
                <td className="py-2 px-4 text-gray-500">{o.medecin_prescripteur}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statutColor(o.statut_validation)}`}>
                    {o.statut_validation}
                  </span>
                </td>
                <td className="py-2 px-4 text-right space-x-3">
                  {o.statut_validation === "En attente" && (
                    <>
                      <button
                        onClick={() => quickValidate(o, "Validee")}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Valider
                      </button>
                      <button
                        onClick={() => quickValidate(o, "Refusee")}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                  <button onClick={() => startEdit(o)} className="text-xs text-pharma-700 hover:underline">
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(o.id_ordonnance)}
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
