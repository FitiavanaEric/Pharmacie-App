import { useEffect, useState } from "react";
import { createEmploye, deleteEmploye, getEmployes, updateEmploye } from "../services/api";
import type { Employe } from "../types";

const emptyForm = { nom: "", prenom: "", fonction: "", numOrdrePharmacien: "" };

const FONCTIONS = ["Pharmacien titulaire", "Pharmacien assistant", "Gestionnaire de stock", "Caissier", "Vendeur"];

export default function EmployeList() {
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function load() {
    getEmployes().then(setEmployes).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(e: Employe) {
    setEditingId(e.id_employe);
    setForm({
      nom: e.nom,
      prenom: e.prenom ?? "",
      fonction: e.fonction,
      numOrdrePharmacien: e.num_ordre_pharmacien ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEmploye(editingId, form as any);
      } else {
        await createEmploye(form as any);
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
    if (!confirm("Supprimer cet employé ?")) return;
    await deleteEmploye(id);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Employés</h1>
        <button
          onClick={() => (showForm ? setShowForm(false) : startCreate())}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Ajouter un employé"}
        </button>
      </div>

      {error && <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-100 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3"
        >
          <p className="col-span-2 text-sm font-medium text-gray-900 -mb-1">
            {editingId ? "Modifier l'employé" : "Nouvel employé"}
          </p>
          <input
            required
            placeholder="Nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <input
            placeholder="Prénom"
            value={form.prenom}
            onChange={(e) => setForm({ ...form, prenom: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
          <select
            required
            value={form.fonction}
            onChange={(e) => setForm({ ...form, fonction: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Fonction</option>
            {FONCTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <input
            placeholder="N° ordre pharmacien (si applicable)"
            value={form.numOrdrePharmacien}
            onChange={(e) => setForm({ ...form, numOrdrePharmacien: e.target.value })}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          />
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
              <th className="py-2 px-4 font-normal">Nom</th>
              <th className="py-2 px-4 font-normal">Fonction</th>
              <th className="py-2 px-4 font-normal">N° ordre</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {employes.map((e) => (
              <tr key={e.id_employe} className="border-b border-gray-50">
                <td className="py-2 px-4">{e.nom} {e.prenom}</td>
                <td className="py-2 px-4 text-gray-500">{e.fonction}</td>
                <td className="py-2 px-4 text-gray-500">{e.num_ordre_pharmacien ?? "-"}</td>
                <td className="py-2 px-4 text-right space-x-3">
                  <button onClick={() => startEdit(e)} className="text-xs text-pharma-700 hover:underline">
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(e.id_employe)}
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
