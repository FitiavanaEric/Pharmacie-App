<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

sendCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {

    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("
                SELECT r.*, bc.id_fournisseur, f.nom AS nom_fournisseur
                FROM reception r
                LEFT JOIN bon_commande bc ON bc.id_bon_commande = r.id_bon_commande
                LEFT JOIN fournisseur f ON f.id_fournisseur = bc.id_fournisseur
                WHERE r.id_reception = ?
            ");
            $stmt->execute([$id]);
            $rec = $stmt->fetch();
            if (!$rec) jsonError("Reception introuvable", 404);

            $stmtLignes = $pdo->prepare("
                SELECT lr.*, a.nom_article
                FROM ligne_reception lr
                JOIN article a ON a.id_article = lr.id_article
                WHERE lr.id_reception = ?
            ");
            $stmtLignes->execute([$id]);
            $rec['lignes'] = $stmtLignes->fetchAll();
            jsonResponse($rec);
        } else {
            $stmt = $pdo->query("
                SELECT r.id_reception, r.date_reception, r.agent_receptionneur,
                       r.statut_controle, r.num_bl,
                       f.nom AS nom_fournisseur
                FROM reception r
                LEFT JOIN bon_commande bc ON bc.id_bon_commande = r.id_bon_commande
                LEFT JOIN fournisseur f ON f.id_fournisseur = bc.id_fournisseur
                ORDER BY r.date_reception DESC
            ");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        // Enregistre la reception, ses lignes, et cree automatiquement les lots en stock
        $data = getRequestBody();
        if (empty($data['idBonCommande']) || empty($data['lignes'])) {
            jsonError("Bon de commande et au moins une ligne requis");
        }

        try {
            $pdo->beginTransaction();

            $stmtRec = $pdo->prepare(
                "INSERT INTO reception (date_reception, agent_receptionneur, statut_controle, num_bl, observation, id_bon_commande)
                 VALUES (CURRENT_DATE, ?, ?, ?, ?, ?)"
            );
            $stmtRec->execute([
                $data['agentReceptionneur'] ?? null,
                $data['statutControle'] ?? 'Conforme',
                $data['numBl'] ?? null,
                $data['observation'] ?? null,
                $data['idBonCommande'],
            ]);
            $idReception = $pdo->lastInsertId();

            $stmtLigne = $pdo->prepare(
                "INSERT INTO ligne_reception
                 (quantite_recue, quantite_conforme, quantite_defectueuse, prix_achat_unitaire, montant_ligne, id_reception, id_article)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            $stmtLot = $pdo->prepare(
                "INSERT INTO lot (num_lot, date_peremption, quantite_stock, id_article)
                 VALUES (?, ?, ?, ?)"
            );

            foreach ($data['lignes'] as $l) {
                $conforme = $l['quantiteConforme'] ?? $l['quantiteRecue'];
                $stmtLigne->execute([
                    $l['quantiteRecue'],
                    $conforme,
                    $l['quantiteDefectueuse'] ?? 0,
                    $l['prixAchatUnitaire'],
                    $l['quantiteRecue'] * $l['prixAchatUnitaire'],
                    $idReception,
                    $l['idArticle'],
                ]);

                // Cree automatiquement un lot pour la quantite conforme recue
                if ($conforme > 0 && !empty($l['numLot']) && !empty($l['datePeremption'])) {
                    $stmtLot->execute([
                        $l['numLot'],
                        $l['datePeremption'],
                        $conforme,
                        $l['idArticle'],
                    ]);
                }
            }

            // Met a jour le statut du bon de commande
            $pdo->prepare("UPDATE bon_commande SET statut = 'Receptionne' WHERE id_bon_commande = ?")
                ->execute([$data['idBonCommande']]);

            $pdo->commit();
            jsonResponse(["success" => true, "id" => $idReception], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonError("Erreur: " . $e->getMessage(), 400);
        }
        break;

    default:
        jsonError("Methode non supportee", 405);
}
