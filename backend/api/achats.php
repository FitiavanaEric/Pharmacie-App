<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth_guard.php";

sendCorsHeaders();
requireAuth();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {

    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("
                SELECT bc.*, f.nom AS nom_fournisseur
                FROM bon_commande bc
                LEFT JOIN fournisseur f ON f.id_fournisseur = bc.id_fournisseur
                WHERE bc.id_bon_commande = ?
            ");
            $stmt->execute([$id]);
            $bc = $stmt->fetch();
            if (!$bc) jsonError("Bon de commande introuvable", 404);

            $stmtLignes = $pdo->prepare("
                SELECT lc.*, a.nom_article
                FROM ligne_commande lc
                JOIN article a ON a.id_article = lc.id_article
                WHERE lc.id_bon_commande = ?
            ");
            $stmtLignes->execute([$id]);
            $bc['lignes'] = $stmtLignes->fetchAll();
            jsonResponse($bc);
        } else {
            $stmt = $pdo->query("
                SELECT bc.id_bon_commande, bc.date_commande, bc.date_livraison_prevue, bc.statut,
                       bc.montant_total_ht, bc.montant_total_ttc,
                       f.nom AS nom_fournisseur
                FROM bon_commande bc
                LEFT JOIN fournisseur f ON f.id_fournisseur = bc.id_fournisseur
                ORDER BY bc.date_commande DESC
            ");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        requireRole(['responsable_achats', 'admin']);
        $data = getRequestBody();
        if (empty($data['idFournisseur']) || empty($data['lignes'])) {
            jsonError("Fournisseur et au moins une ligne requis");
        }

        try {
            $pdo->beginTransaction();

            $montantHt = 0;
            foreach ($data['lignes'] as $l) {
                $montantHt += $l['quantiteCommandee'] * $l['prixAchatUnitaire'];
            }

            $stmtBc = $pdo->prepare(
                "INSERT INTO bon_commande (date_commande, date_livraison_prevue, statut, montant_total_ht, montant_total_ttc, id_fournisseur)
                 VALUES (CURRENT_DATE, ?, 'Emis', ?, ?, ?)"
            );
            $stmtBc->execute([
                $data['dateLivraisonPrevue'] ?? null,
                $montantHt,
                $montantHt, // TVA non geree pour l'instant, TTC = HT
                $data['idFournisseur'],
            ]);
            $idBc = $pdo->lastInsertId();

            $stmtLigne = $pdo->prepare(
                "INSERT INTO ligne_commande (quantite_commandee, prix_achat_unitaire, montant_ligne, id_bon_commande, id_article)
                 VALUES (?, ?, ?, ?, ?)"
            );
            foreach ($data['lignes'] as $l) {
                $stmtLigne->execute([
                    $l['quantiteCommandee'],
                    $l['prixAchatUnitaire'],
                    $l['quantiteCommandee'] * $l['prixAchatUnitaire'],
                    $idBc,
                    $l['idArticle'],
                ]);
            }

            $pdo->commit();
            jsonResponse(["success" => true, "id" => $idBc], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonError("Erreur: " . $e->getMessage(), 400);
        }
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        $stmt = $pdo->prepare("UPDATE bon_commande SET statut = ? WHERE id_bon_commande = ?");
        $stmt->execute([$data['statut'], $id]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM bon_commande WHERE id_bon_commande = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
