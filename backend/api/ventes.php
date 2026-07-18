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
                SELECT v.*, c.nom AS nom_client, c.prenom AS prenom_client
                FROM vente v
                LEFT JOIN client c ON c.id_client = v.id_client
                WHERE v.id_vente = ?
            ");
            $stmt->execute([$id]);
            $vente = $stmt->fetch();
            if (!$vente) jsonError("Vente introuvable", 404);

            $stmtLignes = $pdo->prepare("
                SELECT lv.*, a.nom_article
                FROM ligne_vente lv
                JOIN article a ON a.id_article = lv.id_article
                WHERE lv.id_vente = ?
            ");
            $stmtLignes->execute([$id]);
            $vente['lignes'] = $stmtLignes->fetchAll();
            jsonResponse($vente);
        } else {
            $stmt = $pdo->query("
                SELECT v.id_vente, v.date_vente, v.heure_vente, v.mode_paiement,
                       v.montant_total, v.remise, v.montant_net,
                       c.nom AS nom_client, c.prenom AS prenom_client
                FROM vente v
                LEFT JOIN client c ON c.id_client = v.id_client
                ORDER BY v.date_vente DESC, v.heure_vente DESC
            ");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['lignes']) || !is_array($data['lignes'])) {
            jsonError("Au moins une ligne de vente est requise");
        }

        try {
            $pdo->beginTransaction();

            // Controle : un article necessitant une ordonnance exige une ordonnance validee
            // pour le client de cette vente
            $stmtCheck = $pdo->prepare(
                "SELECT a.nom_article, t.necessite_ordonnance
                 FROM article a
                 JOIN type_article t ON t.id_type = a.id_type
                 WHERE a.id_article = ?"
            );
            $articlesSousOrdonnance = [];
            foreach ($data['lignes'] as $ligne) {
                $stmtCheck->execute([$ligne['idArticle']]);
                $infoArticle = $stmtCheck->fetch();
                if ($infoArticle && $infoArticle['necessite_ordonnance']) {
                    $articlesSousOrdonnance[] = $infoArticle['nom_article'];
                }
            }

            if (!empty($articlesSousOrdonnance)) {
                if (empty($data['idClient'])) {
                    throw new Exception(
                        "Un client doit etre selectionne pour vendre : " . implode(", ", $articlesSousOrdonnance)
                    );
                }
                $stmtOrdo = $pdo->prepare(
                    "SELECT COUNT(*) FROM ordonnance
                     WHERE id_client = ? AND statut_validation = 'Validee'
                     AND date_ordonnance >= DATE_SUB(CURRENT_DATE, INTERVAL 90 DAY)"
                );
                $stmtOrdo->execute([$data['idClient']]);
                if ($stmtOrdo->fetchColumn() == 0) {
                    throw new Exception(
                        "Ordonnance validee requise pour : " . implode(", ", $articlesSousOrdonnance)
                    );
                }
            }

            $montantTotal = 0;
            foreach ($data['lignes'] as $ligne) {
                $montantTotal += $ligne['quantiteVendue'] * $ligne['prixUnitaireVente'] - ($ligne['remiseLigne'] ?? 0);
            }
            $remise = $data['remise'] ?? 0;
            $montantNet = $montantTotal - $remise;

            $stmtVente = $pdo->prepare(
                "INSERT INTO vente (date_vente, heure_vente, mode_paiement, montant_total, remise, montant_net, id_client)
                 VALUES (CURRENT_DATE, CURRENT_TIME, ?, ?, ?, ?, ?)"
            );
            $stmtVente->execute([
                $data['modePaiement'] ?? 'Especes',
                $montantTotal,
                $remise,
                $montantNet,
                $data['idClient'] ?? null,
            ]);
            $idVente = $pdo->lastInsertId();

            $stmtLigne = $pdo->prepare(
                "INSERT INTO ligne_vente (quantite_vendue, prix_unitaire_vente, remise_ligne, montant_ligne, id_vente, id_article, id_lot)
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            $stmtStock = $pdo->prepare(
                "UPDATE lot SET quantite_stock = quantite_stock - ? WHERE id_lot = ? AND quantite_stock >= ?"
            );

            foreach ($data['lignes'] as $ligne) {
                $montantLigne = $ligne['quantiteVendue'] * $ligne['prixUnitaireVente'] - ($ligne['remiseLigne'] ?? 0);
                $stmtLigne->execute([
                    $ligne['quantiteVendue'],
                    $ligne['prixUnitaireVente'],
                    $ligne['remiseLigne'] ?? 0,
                    $montantLigne,
                    $idVente,
                    $ligne['idArticle'],
                    $ligne['idLot'] ?? null,
                ]);

                if (!empty($ligne['idLot'])) {
                    $stmtStock->execute([$ligne['quantiteVendue'], $ligne['idLot'], $ligne['quantiteVendue']]);
                    if ($stmtStock->rowCount() === 0) {
                        throw new Exception("Stock insuffisant pour le lot #{$ligne['idLot']}");
                    }
                }
            }

            $pdo->commit();
            jsonResponse(["success" => true, "id" => $idVente], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonError("Vente annulee: " . $e->getMessage(), 400);
        }
        break;

    default:
        jsonError("Methode non supportee", 405);
}
