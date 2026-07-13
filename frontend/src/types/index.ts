export interface Fournisseur {
  id_fournisseur: number;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  num_rcm?: string;
}

export interface TypeArticle {
  id_type: number;
  libelle_type: string;
  description?: string;
  necessite_ordonnance: boolean;
}

export interface Article {
  id_article: number;
  code_barre?: string;
  nom_article: string;
  designation?: string;
  unite?: string;
  prix_vente: number;
  stock_minimum: number;
  id_type?: number;
  libelle_type?: string;
  id_fournisseur?: number;
  nom_fournisseur?: string;
  stock_actuel?: number;
}

export interface Lot {
  id_lot: number;
  num_lot: string;
  date_fabrication?: string;
  date_peremption: string;
  quantite_stock: number;
  emplacement?: string;
  id_article: number;
  nom_article?: string;
}

export interface Client {
  id_client: number;
  nom: string;
  prenom?: string;
  date_naissance?: string;
  telephone?: string;
  num_assure?: string;
}

export interface LigneVenteInput {
  idArticle: number;
  idLot?: number;
  quantiteVendue: number;
  prixUnitaireVente: number;
  remiseLigne?: number;
}

export interface Vente {
  id_vente: number;
  date_vente: string;
  heure_vente: string;
  mode_paiement: string;
  montant_total: number;
  remise: number;
  montant_net: number;
  nom_client?: string;
  prenom_client?: string;
}

export interface DashboardStats {
  ventesJour: number;
  nombreVentesJour: number;
  articlesStockCritique: number;
  lotsPeremptionProche: number;
  clientsServisJour: number;
}
