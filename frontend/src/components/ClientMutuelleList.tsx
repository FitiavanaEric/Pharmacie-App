import { useEffect, useState } from "react";
import {
  getClientMutuelles,
  getClients,
  getMutuelles,
  linkClientMutuelle,
  unlinkClientMutuelle,
} from "../services/api";
import type { Client, ClientMutuelleLink, Mutuelle } from "../types";

export default function ClientMutuelleList() {
  const [links, setLinks] = useState<ClientMutuelleLink[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [mutuelles, setMutuelles] = useState<Mutuelle[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [idClient, setIdClient] = useState("");
  const [idMutuelle, setIdMutuelle] = useState("");
  const [error, setError] = useState<string | null>(null);

  function load() {
    Promise.all([getClientMutuelles(), getClients(), getMutuelles()]).then(([l, c, m]) => {
      setLinks(l);
      setClients(c);
      setMutuelles(m);
    });
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await linkClientMutuelle(Number(idClient), Number(idMutuelle));
      setIdClient("");
      setIdMutuelle("");
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleUnlink(idC: number, idM: number) {
    if (!confirm("Retirer cette mutuelle du client ?")) return;
    await unlinkClientMutuelle(idC, idM);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-medium text-gray-900">Clients ↔ Mutuelles</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm bg-pharma-600 text-white px-3 py-1.5 rounded-md hover:bg-pharma-700"
        >
          {showForm ? "Annuler" : "Associer un client à une mutuelle"}
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
            value={idClient}
            onChange={(e) => setIdClient(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Client</option>
            {clients.map((c) => (
              <option key={c.id_client} value={c.id_client}>
                {c.nom} {c.prenom}
              </option>
            ))}
          </select>
          <select
            required
            value={idMutuelle}
            onChange={(e) => setIdMutuelle(e.target.value)}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="">Mutuelle</option>
            {mutuelles.map((m) => (
              <option key={m.id_mutuelle} value={m.id_mutuelle}>
                {m.nom_mutuelle} ({m.taux_remboursement}%)
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="col-span-2 bg-pharma-600 text-white text-sm py-2 rounded-md hover:bg-pharma-700"
          >
            Associer
          </button>
        </form>
      )}

      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="py-2 px-4 font-normal">Client</th>
              <th className="py-2 px-4 font-normal">Mutuelle</th>
              <th className="py-2 px-4 font-normal">Taux</th>
              <th className="py-2 px-4 font-normal">Adhésion</th>
              <th className="py-2 px-4 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={`${l.id_client}-${l.id_mutuelle}`} className="border-b border-gray-50">
                <td className="py-2 px-4">{l.nom_client} {l.prenom_client}</td>
                <td className="py-2 px-4">{l.nom_mutuelle}</td>
                <td className="py-2 px-4">{l.taux_remboursement}%</td>
                <td className="py-2 px-4 text-gray-500">{l.date_adhesion}</td>
                <td className="py-2 px-4 text-right">
                  <button
                    onClick={() => handleUnlink(l.id_client, l.id_mutuelle)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Retirer
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
