-- ============================================================
-- SCHEMA MYSQL - GESTION DE PHARMACIE
-- Genere a partir du MLD (TD MERISE - City University)
-- ============================================================

CREATE TABLE fournisseur (
    id_fournisseur      INT AUTO_INCREMENT PRIMARY KEY,
    nom                 VARCHAR(100) NOT NULL,
    adresse             VARCHAR(200),
    telephone           VARCHAR(20),
    email               VARCHAR(100),
    num_rcm             VARCHAR(50),
    date_enregistrement DATE DEFAULT (CURRENT_DATE)
) ENGINE=InnoDB;

CREATE TABLE type_article (
    id_type               INT AUTO_INCREMENT PRIMARY KEY,
    libelle_type          VARCHAR(50) NOT NULL,
    description           TEXT,
    necessite_ordonnance  BOOLEAN NOT NULL DEFAULT FALSE
) ENGINE=InnoDB;

CREATE TABLE magasin (
    id_magasin   INT AUTO_INCREMENT PRIMARY KEY,
    nom_magasin  VARCHAR(100) NOT NULL,
    adresse      VARCHAR(200)
) ENGINE=InnoDB;

CREATE TABLE article (
    id_article      INT AUTO_INCREMENT PRIMARY KEY,
    code_barre      VARCHAR(50) UNIQUE,
    nom_article     VARCHAR(150) NOT NULL,
    designation     TEXT,
    unite           VARCHAR(20),
    prix_vente      DECIMAL(10,2) NOT NULL CHECK (prix_vente >= 0),
    stock_minimum   INT NOT NULL DEFAULT 0 CHECK (stock_minimum >= 0),
    id_type         INT,
    id_fournisseur  INT,
    FOREIGN KEY (id_type) REFERENCES type_article(id_type),
    FOREIGN KEY (id_fournisseur) REFERENCES fournisseur(id_fournisseur)
) ENGINE=InnoDB;

CREATE TABLE lot (
    id_lot            INT AUTO_INCREMENT PRIMARY KEY,
    num_lot           VARCHAR(50) UNIQUE NOT NULL,
    date_fabrication  DATE,
    date_peremption   DATE NOT NULL,
    quantite_stock    INT NOT NULL DEFAULT 0 CHECK (quantite_stock >= 0),
    emplacement       VARCHAR(100),
    id_article        INT NOT NULL,
    FOREIGN KEY (id_article) REFERENCES article(id_article) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE client (
    id_client       INT AUTO_INCREMENT PRIMARY KEY,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100),
    date_naissance  DATE,
    telephone       VARCHAR(20),
    num_assure      VARCHAR(50)
) ENGINE=InnoDB;

CREATE TABLE mutuelle (
    id_mutuelle        INT AUTO_INCREMENT PRIMARY KEY,
    nom_mutuelle       VARCHAR(100) NOT NULL,
    taux_remboursement DECIMAL(5,2) DEFAULT 0,
    contact            VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE client_mutuelle (
    id_client   INT NOT NULL,
    id_mutuelle INT NOT NULL,
    date_adhesion DATE DEFAULT (CURRENT_DATE),
    PRIMARY KEY (id_client, id_mutuelle),
    FOREIGN KEY (id_client) REFERENCES client(id_client) ON DELETE CASCADE,
    FOREIGN KEY (id_mutuelle) REFERENCES mutuelle(id_mutuelle) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE employe (
    id_employe           INT AUTO_INCREMENT PRIMARY KEY,
    nom                  VARCHAR(100) NOT NULL,
    prenom               VARCHAR(100),
    fonction             VARCHAR(50),
    num_ordre_pharmacien VARCHAR(50)
) ENGINE=InnoDB;

CREATE TABLE ordonnance (
    id_ordonnance        INT AUTO_INCREMENT PRIMARY KEY,
    date_ordonnance      DATE NOT NULL DEFAULT (CURRENT_DATE),
    medecin_prescripteur VARCHAR(150),
    duree_traitement     VARCHAR(50),
    statut_validation    VARCHAR(20) DEFAULT 'En attente',
    id_client            INT,
    FOREIGN KEY (id_client) REFERENCES client(id_client)
) ENGINE=InnoDB;

CREATE TABLE bon_commande (
    id_bon_commande        INT AUTO_INCREMENT PRIMARY KEY,
    date_commande          DATE NOT NULL DEFAULT (CURRENT_DATE),
    date_livraison_prevue  DATE,
    statut                 VARCHAR(20) DEFAULT 'Emis',
    montant_total_ht       DECIMAL(12,2) DEFAULT 0,
    montant_total_ttc      DECIMAL(12,2) DEFAULT 0,
    id_fournisseur         INT,
    FOREIGN KEY (id_fournisseur) REFERENCES fournisseur(id_fournisseur)
) ENGINE=InnoDB;

CREATE TABLE ligne_commande (
    id_ligne_commande   INT AUTO_INCREMENT PRIMARY KEY,
    quantite_commandee  INT NOT NULL CHECK (quantite_commandee > 0),
    prix_achat_unitaire DECIMAL(10,2) NOT NULL,
    montant_ligne        DECIMAL(12,2),
    id_bon_commande      INT,
    id_article           INT,
    FOREIGN KEY (id_bon_commande) REFERENCES bon_commande(id_bon_commande) ON DELETE CASCADE,
    FOREIGN KEY (id_article) REFERENCES article(id_article)
) ENGINE=InnoDB;

CREATE TABLE reception (
    id_reception         INT AUTO_INCREMENT PRIMARY KEY,
    date_reception        DATE NOT NULL DEFAULT (CURRENT_DATE),
    agent_receptionneur   VARCHAR(100),
    statut_controle        VARCHAR(20) DEFAULT 'En attente',
    num_bl                 VARCHAR(50),
    observation             TEXT,
    id_bon_commande         INT,
    FOREIGN KEY (id_bon_commande) REFERENCES bon_commande(id_bon_commande)
) ENGINE=InnoDB;

CREATE TABLE ligne_reception (
    id_ligne_reception    INT AUTO_INCREMENT PRIMARY KEY,
    quantite_recue         INT NOT NULL DEFAULT 0,
    quantite_conforme      INT NOT NULL DEFAULT 0,
    quantite_defectueuse   INT NOT NULL DEFAULT 0,
    prix_achat_unitaire    DECIMAL(10,2),
    montant_ligne           DECIMAL(12,2),
    id_reception             INT,
    id_article                INT,
    FOREIGN KEY (id_reception) REFERENCES reception(id_reception) ON DELETE CASCADE,
    FOREIGN KEY (id_article) REFERENCES article(id_article)
) ENGINE=InnoDB;

CREATE TABLE vente (
    id_vente        INT AUTO_INCREMENT PRIMARY KEY,
    date_vente      DATE NOT NULL DEFAULT (CURRENT_DATE),
    heure_vente     TIME NOT NULL DEFAULT (CURRENT_TIME),
    mode_paiement   VARCHAR(30),
    montant_total   DECIMAL(12,2) DEFAULT 0,
    remise          DECIMAL(10,2) DEFAULT 0,
    montant_net     DECIMAL(12,2) DEFAULT 0,
    id_client       INT,
    FOREIGN KEY (id_client) REFERENCES client(id_client)
) ENGINE=InnoDB;

CREATE TABLE ligne_vente (
    id_ligne_vente       INT AUTO_INCREMENT PRIMARY KEY,
    quantite_vendue       INT NOT NULL CHECK (quantite_vendue > 0),
    prix_unitaire_vente    DECIMAL(10,2) NOT NULL,
    remise_ligne             DECIMAL(10,2) DEFAULT 0,
    montant_ligne             DECIMAL(12,2),
    id_vente                  INT,
    id_article                 INT,
    id_lot                      INT,
    FOREIGN KEY (id_vente) REFERENCES vente(id_vente) ON DELETE CASCADE,
    FOREIGN KEY (id_article) REFERENCES article(id_article),
    FOREIGN KEY (id_lot) REFERENCES lot(id_lot)
) ENGINE=InnoDB;

CREATE TABLE facture_client (
    id_facture     INT AUTO_INCREMENT PRIMARY KEY,
    date_facture   DATE NOT NULL DEFAULT (CURRENT_DATE),
    montant_ht     DECIMAL(12,2) DEFAULT 0,
    tva            DECIMAL(10,2) DEFAULT 0,
    montant_ttc    DECIMAL(12,2) DEFAULT 0,
    id_vente       INT,
    FOREIGN KEY (id_vente) REFERENCES vente(id_vente)
) ENGINE=InnoDB;

CREATE TABLE caisse (
    id_caisse    INT AUTO_INCREMENT PRIMARY KEY,
    nom_caissier VARCHAR(100),
    telephone    VARCHAR(20)
) ENGINE=InnoDB;

CREATE TABLE transfert (
    id_transfert         INT AUTO_INCREMENT PRIMARY KEY,
    date_transfert        DATE NOT NULL DEFAULT (CURRENT_DATE),
    quantite               INT NOT NULL CHECK (quantite > 0),
    magasin_source          INT,
    magasin_destination      INT,
    id_article                INT,
    FOREIGN KEY (magasin_source) REFERENCES magasin(id_magasin),
    FOREIGN KEY (magasin_destination) REFERENCES magasin(id_magasin),
    FOREIGN KEY (id_article) REFERENCES article(id_article)
) ENGINE=InnoDB;

CREATE TABLE reforme (
    id_reforme    INT AUTO_INCREMENT PRIMARY KEY,
    date_reforme  DATE NOT NULL DEFAULT (CURRENT_DATE),
    quantite      INT NOT NULL CHECK (quantite > 0),
    motif         VARCHAR(200),
    valeur        DECIMAL(12,2) DEFAULT 0,
    id_article    INT,
    FOREIGN KEY (id_article) REFERENCES article(id_article)
) ENGINE=InnoDB;

CREATE INDEX idx_article_fournisseur ON article(id_fournisseur);
CREATE INDEX idx_lot_article ON lot(id_article);
CREATE INDEX idx_lot_peremption ON lot(date_peremption);
CREATE INDEX idx_vente_client ON vente(id_client);
CREATE INDEX idx_ligne_vente_vente ON ligne_vente(id_vente);
