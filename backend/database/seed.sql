-- Donnees de demonstration

INSERT INTO fournisseur (nom, adresse, telephone, email, num_rcm) VALUES
('Pharma Distrib SARL', 'Antananarivo, Analamanga', '020 22 123 45', 'contact@pharmadistrib.mg', 'RCM-001'),
('MediSupply Madagascar', 'Antananarivo, Ankorondrano', '020 22 987 65', 'ventes@medisupply.mg', 'RCM-002');

INSERT INTO type_article (libelle_type, description, necessite_ordonnance) VALUES
('Antibiotique', 'Medicaments antibacteriens', TRUE),
('Antalgique', 'Medicaments contre la douleur', FALSE),
('Antiseptique', 'Produits de desinfection', FALSE),
('Vitamines', 'Complements vitaminiques', FALSE);

INSERT INTO magasin (nom_magasin, adresse) VALUES
('Pharmacie Centrale', 'Analakely, Antananarivo'),
('Depot Ankorondrano', 'Ankorondrano, Antananarivo');

INSERT INTO article (code_barre, nom_article, designation, unite, prix_vente, stock_minimum, id_type, id_fournisseur) VALUES
('3400001', 'Paracetamol 500mg', 'Boite de 16 comprimes', 'boite', 2500, 30, 2, 1),
('3400002', 'Amoxicilline 1g', 'Boite de 12 comprimes', 'boite', 6500, 40, 1, 1),
('3400003', 'Serum physiologique', 'Flacon 500ml', 'flacon', 4000, 20, 3, 2),
('3400004', 'Vitamine C 1000mg', 'Boite de 20 comprimes effervescents', 'boite', 8000, 25, 4, 2);

INSERT INTO lot (num_lot, date_fabrication, date_peremption, quantite_stock, emplacement, id_article, id_magasin) VALUES
('LOT-2025-001', '2025-01-10', '2027-01-10', 12, 'Rayon A1', 1, 1),
('LOT-2025-002', '2025-02-15', '2026-12-01', 25, 'Rayon B2', 2, 1),
('LOT-2025-003', '2025-03-01', '2027-06-01', 5, 'Rayon C1', 3, 1),
('LOT-2025-004', '2025-04-20', '2026-09-15', 40, 'Rayon D3', 4, 1);

INSERT INTO client (nom, prenom, date_naissance, telephone, num_assure) VALUES
('Rakoto', 'Jean', '1985-04-12', '034 12 345 67', 'ASS-1001'),
('Rasoa', 'Marie', '1990-08-22', '033 98 765 43', 'ASS-1002');
