<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth_guard.php";

sendCorsHeaders();
requireAuth();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

const SELECT_BASE = "
    SELECT r.id_reforme, r.date_reforme, r.quantite, r.motif, r.valeur,
           r.id_article, a.nom_article
    FROM reforme r
    LEFT JOIN article a ON a.id_article = r.id_article
";

switch ($method) {

    case 'GET':
        $stmt = $pdo->query(SELECT_BASE . " ORDER BY r.date_reforme DESC");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['idArticle']) || empty($data['quantite']) || empty($data['idLot'])) {
            jsonError("Article, lot precis et quantite requis pour decrementer le stock");
        }

        try {
            $pdo->beginTransaction();

            // Verifie et decremente le stock du lot AVANT d'enregistrer la reforme
            $stmtStock = $pdo->prepare(
                "UPDATE lot SET quantite_stock = quantite_stock - ? WHERE id_lot = ? AND quantite_stock >= ?"
            );
            $stmtStock->execute([$data['quantite'], $data['idLot'], $data['quantite']]);
            if ($stmtStock->rowCount() === 0) {
                throw new Exception("Stock insuffisant sur ce lot pour cette quantite");
            }

            $stmt = $pdo->prepare(
                "INSERT INTO reforme (date_reforme, quantite, motif, valeur, id_article)
                 VALUES (CURRENT_DATE, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $data['quantite'],
                $data['motif'] ?? null,
                $data['valeur'] ?? 0,
                $data['idArticle'],
            ]);
            $idReforme = $pdo->lastInsertId();

            $pdo->commit();
            jsonResponse(["success" => true, "id" => $idReforme], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonError("Erreur: " . $e->getMessage(), 400);
        }
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM reforme WHERE id_reforme = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
