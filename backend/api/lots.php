<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

sendCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

const SELECT_BASE = "
    SELECT l.id_lot, l.num_lot, l.date_fabrication, l.date_peremption,
           l.quantite_stock, l.emplacement,
           l.id_article, a.nom_article
    FROM lot l
    JOIN article a ON a.id_article = l.id_article
";

switch ($method) {

    case 'GET':
        if (isset($_GET['alertes'])) {
            // Lots en stock critique ou proches de la peremption (< 90 jours)
            $stmt = $pdo->query(SELECT_BASE . "
                JOIN article art ON art.id_article = l.id_article
                WHERE l.date_peremption <= DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY)
                   OR l.quantite_stock <= art.stock_minimum
                ORDER BY l.date_peremption ASC
            ");
            jsonResponse($stmt->fetchAll());
        } elseif ($id) {
            $stmt = $pdo->prepare(SELECT_BASE . " WHERE l.id_lot = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            $row ? jsonResponse($row) : jsonError("Lot introuvable", 404);
        } else {
            $stmt = $pdo->query(SELECT_BASE . " ORDER BY l.date_peremption ASC");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['numLot']) || empty($data['idArticle'])) {
            jsonError("Numero de lot et article requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO lot (num_lot, date_fabrication, date_peremption, quantite_stock, emplacement, id_article)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['numLot'],
            $data['dateFabrication'] ?? null,
            $data['datePeremption'],
            $data['quantiteStock'] ?? 0,
            $data['emplacement'] ?? null,
            $data['idArticle'],
        ]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        $stmt = $pdo->prepare("UPDATE lot SET quantite_stock = ?, emplacement = ? WHERE id_lot = ?");
        $stmt->execute([$data['quantiteStock'], $data['emplacement'] ?? null, $id]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM lot WHERE id_lot = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}