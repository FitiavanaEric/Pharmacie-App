import type {
  Article,
  Client,
  DashboardStats,
  Fournisseur,
  Lot,
  TypeArticle,
  Vente,
  LigneVenteInput,
} from "../types";

// Adapte cette URL a l'emplacement de ton backend PHP
export const API_URL = "http://localhost:8080/api";

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

// --- Dashboard ---
export const getDashboardStats = () => request<DashboardStats>("dashboard.php");
