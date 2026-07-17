import type {
  Article,
  BonCommande,
  Client,
  DashboardStats,
  Fournisseur,
  LigneCommandeInput,
  LigneReceptionInput,
  LigneVenteInput,
  Lot,
  Magasin,
  Mutuelle,
  Ordonnance,
  RapportStats,
  Reception,
  Reforme,
  Transfert,
  TypeArticle,
  Vente,
} from "../types";

// Adapte cette URL a l'emplacement de ton backend PHP
export const API_URL = "http://127.0.0.1:8080/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

// --- Fournisseurs ---
export const getFournisseurs = () => request<Fournisseur[]>("fournisseurs.php");
export const createFournisseur = (data: Partial<Fournisseur>) =>
  request("fournisseurs.php", { method: "POST", body: JSON.stringify(data) });
export const updateFournisseur = (id: number, data: Partial<Fournisseur>) =>
  request(`fournisseurs.php?id=${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteFournisseur = (id: number) =>
  request(`fournisseurs.php?id=${id}`, { method: "DELETE" });

// --- Types d'article ---
export const getTypesArticle = () => request<TypeArticle[]>("type_article.php");
export const createTypeArticle = (data: Partial<TypeArticle>) =>
  request("type_article.php", { method: "POST", body: JSON.stringify(data) });
export const updateTypeArticle = (id: number, data: Partial<TypeArticle>) =>
  request(`type_article.php?id=${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTypeArticle = (id: number) =>
  request(`type_article.php?id=${id}`, { method: "DELETE" });

// --- Articles ---
export const getArticles = () => request<Article[]>("articles.php");
export const createArticle = (data: Partial<Article>) =>
  request("articles.php", { method: "POST", body: JSON.stringify(data) });
export const updateArticle = (id: number, data: Partial<Article>) =>
  request(`articles.php?id=${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteArticle = (id: number) =>
  request(`articles.php?id=${id}`, { method: "DELETE" });

// --- Lots ---
export const getLots = () => request<Lot[]>("lots.php");
export const getLotsAlertes = () => request<Lot[]>("lots.php?alertes=1");
export const createLot = (data: Partial<Lot>) =>
  request("lots.php", { method: "POST", body: JSON.stringify(data) });
export const updateLot = (id: number, data: Partial<Lot>) =>
  request(`lots.php?id=${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteLot = (id: number) =>
  request(`lots.php?id=${id}`, { method: "DELETE" });

// --- Clients ---
export const getClients = () => request<Client[]>("clients.php");
export const createClient = (data: Partial<Client>) =>
  request("clients.php", { method: "POST", body: JSON.stringify(data) });
export const updateClient = (id: number, data: Partial<Client>) =>
  request(`clients.php?id=${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteClient = (id: number) =>
  request(`clients.php?id=${id}`, { method: "DELETE" });

// --- Ventes ---
export const getVentes = () => request<Vente[]>("ventes.php");
export const createVente = (data: {
  idClient?: number;
  modePaiement: string;
  remise?: number;
  lignes: LigneVenteInput[];
}) => request("ventes.php", { method: "POST", body: JSON.stringify(data) });

// --- Ordonnances ---
export const getOrdonnances = () => request<Ordonnance[]>("ordonnances.php");
export const createOrdonnance = (data: {
  idClient: number;
  medecinPrescripteur: string;
  dureeTraitement?: string;
  statutValidation?: string;
}) => request("ordonnances.php", { method: "POST", body: JSON.stringify(data) });
export const updateOrdonnance = (
  id: number,
  data: { medecinPrescripteur: string; dureeTraitement?: string; statutValidation: string }
) => request(`ordonnances.php?id=${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteOrdonnance = (id: number) =>
  request(`ordonnances.php?id=${id}`, { method: "DELETE" });

// --- Achats (bons de commande) ---
export const getAchats = () => request<BonCommande[]>("achats.php");
export const getAchat = (id: number) => request<BonCommande>(`achats.php?id=${id}`);
export const createAchat = (data: {
  idFournisseur: number;
  dateLivraisonPrevue?: string;
  lignes: LigneCommandeInput[];
}) => request("achats.php", { method: "POST", body: JSON.stringify(data) });
export const updateAchatStatut = (id: number, statut: string) =>
  request(`achats.php?id=${id}`, { method: "PUT", body: JSON.stringify({ statut }) });
export const deleteAchat = (id: number) =>
  request(`achats.php?id=${id}`, { method: "DELETE" });

// --- Receptions ---
export const getReceptions = () => request<Reception[]>("receptions.php");
export const createReception = (data: {
  idBonCommande: number;
  agentReceptionneur?: string;
  statutControle?: string;
  numBl?: string;
  observation?: string;
  lignes: LigneReceptionInput[];
}) => request("receptions.php", { method: "POST", body: JSON.stringify(data) });

// --- Transferts ---
export const getTransferts = () => request<Transfert[]>("transferts.php");
export const createTransfert = (data: {
  idArticle: number;
  quantite: number;
  magasinSource?: number;
  magasinDestination?: number;
}) => request("transferts.php", { method: "POST", body: JSON.stringify(data) });
export const deleteTransfert = (id: number) =>
  request(`transferts.php?id=${id}`, { method: "DELETE" });

// --- Reformes ---
export const getReformes = () => request<Reforme[]>("reformes.php");
export const createReforme = (data: {
  idArticle: number;
  quantite: number;
  motif?: string;
  valeur?: number;
  idLot?: number;
}) => request("reformes.php", { method: "POST", body: JSON.stringify(data) });
export const deleteReforme = (id: number) =>
  request(`reformes.php?id=${id}`, { method: "DELETE" });

// --- Mutuelles ---
export const getMutuelles = () => request<Mutuelle[]>("mutuelles.php");
export const createMutuelle = (data: Partial<Mutuelle>) =>
  request("mutuelles.php", { method: "POST", body: JSON.stringify(data) });
export const updateMutuelle = (id: number, data: Partial<Mutuelle>) =>
  request(`mutuelles.php?id=${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteMutuelle = (id: number) =>
  request(`mutuelles.php?id=${id}`, { method: "DELETE" });

// --- Magasins (utilise pour les transferts) ---
export const getMagasins = () => request<Magasin[]>("magasins.php");

// --- Rapports ---
export const getRapports = () => request<RapportStats>("rapports.php");

// --- Dashboard ---
export const getDashboardStats = () => request<DashboardStats>("dashboard.php");
