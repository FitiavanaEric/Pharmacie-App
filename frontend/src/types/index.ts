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

export interface Ordonnance {
  id_ordonnance: number;
  date_ordonnance: string;
  medecin_prescripteur: string;
  duree_traitement?: string;
  statut_validation: "En attente" | "Validee" | "Refusee" | string;
  id_client: number;
  nom_client?: string;
  prenom_client?: string;
}

export interface LigneCommandeInput {
  idArticle: number;
  quantiteCommandee: number;
  prixAchatUnitaire: number;
}

export interface BonCommande {
  id_bon_commande: number;
  date_commande: string;
  date_livraison_prevue?: string;
  statut: string;
  montant_total_ht: number;
  montant_total_ttc: number;
  id_fournisseur?: number;
  nom_fournisseur?: string;
  lignes?: (LigneCommandeInput & { nom_article: string; montant_ligne: number })[];
}

export interface LigneReceptionInput {
  idArticle: number;
  quantiteRecue: number;
  quantiteConforme?: number;
  quantiteDefectueuse?: number;
  prixAchatUnitaire: number;
  numLot?: string;
  datePeremption?: string;
}

export interface Reception {
  id_reception: number;
  date_reception: string;
  agent_receptionneur?: string;
  statut_controle: string;
  num_bl?: string;
  nom_fournisseur?: string;
}

export interface Transfert {
  id_transfert: number;
  date_transfert: string;
  quantite: number;
  magasin_source?: number;
  nom_source?: string;
  magasin_destination?: number;
  nom_destination?: string;
  id_article: number;
  nom_article?: string;
}

export interface Reforme {
  id_reforme: number;
  date_reforme: string;
  quantite: number;
  motif?: string;
  valeur: number;
  id_article: number;
  nom_article?: string;
}

export interface Mutuelle {
  id_mutuelle: number;
  nom_mutuelle: string;
  taux_remboursement: number;
  contact?: string;
}

export interface Magasin {
  id_magasin: number;
  nom_magasin: string;
  adresse?: string;
}

export interface RapportStats {
  ventesParJour: { date_vente: string; total: number; nombre: number }[];
  topArticles: { nom_article: string; quantite_totale: number; montant_total: number }[];
  valeurStock: number;
  parModePaiement: { mode_paiement: string; nombre: number; total: number }[];
}
