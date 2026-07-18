<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth_guard.php";

sendCorsHeaders();
requireRole(['admin']);

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {

    case 'GET':
        $stmt = $pdo->query("SELECT * FROM employe ORDER BY nom, prenom");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['nom']) || empty($data['fonction'])) {
            jsonError("Nom et fonction requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO employe (nom, prenom, fonction, num_ordre_pharmacien) VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['nom'],
            $data['prenom'] ?? null,
            $data['fonction'],
            $data['numOrdrePharmacien'] ?? null,
        ]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        $stmt = $pdo->prepare(
            "UPDATE employe SET nom = ?, prenom = ?, fonction = ?, num_ordre_pharmacien = ? WHERE id_employe = ?"
        );
        $stmt->execute([
            $data['nom'],
            $data['prenom'] ?? null,
            $data['fonction'],
            $data['numOrdrePharmacien'] ?? null,
            $id,
        ]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM employe WHERE id_employe = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
