<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

sendCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

const SELECT_BASE = "
    SELECT o.id_ordonnance, o.date_ordonnance, o.medecin_prescripteur,
           o.duree_traitement, o.statut_validation,
           o.id_client, c.nom AS nom_client, c.prenom AS prenom_client
    FROM ordonnance o
    LEFT JOIN client c ON c.id_client = o.id_client
";

switch ($method) {

    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare(SELECT_BASE . " WHERE o.id_ordonnance = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            $row ? jsonResponse($row) : jsonError("Ordonnance introuvable", 404);
        } else {
            $stmt = $pdo->query(SELECT_BASE . " ORDER BY o.date_ordonnance DESC");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['idClient']) || empty($data['medecinPrescripteur'])) {
            jsonError("Client et medecin prescripteur requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO ordonnance (date_ordonnance, medecin_prescripteur, duree_traitement, statut_validation, id_client)
             VALUES (CURRENT_DATE, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['medecinPrescripteur'],
            $data['dureeTraitement'] ?? null,
            $data['statutValidation'] ?? 'En attente',
            $data['idClient'],
        ]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        $stmt = $pdo->prepare(
            "UPDATE ordonnance SET medecin_prescripteur = ?, duree_traitement = ?, statut_validation = ?
             WHERE id_ordonnance = ?"
        );
        $stmt->execute([
            $data['medecinPrescripteur'],
            $data['dureeTraitement'] ?? null,
            $data['statutValidation'],
            $id,
        ]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM ordonnance WHERE id_ordonnance = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
