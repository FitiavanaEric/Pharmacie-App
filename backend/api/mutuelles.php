<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

sendCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {

    case 'GET':
        $stmt = $pdo->query("SELECT * FROM mutuelle ORDER BY nom_mutuelle");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['nomMutuelle'])) {
            jsonError("Le nom de la mutuelle est requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO mutuelle (nom_mutuelle, taux_remboursement, contact) VALUES (?, ?, ?)"
        );
        $stmt->execute([
            $data['nomMutuelle'],
            $data['tauxRemboursement'] ?? 0,
            $data['contact'] ?? null,
        ]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        $stmt = $pdo->prepare(
            "UPDATE mutuelle SET nom_mutuelle = ?, taux_remboursement = ?, contact = ? WHERE id_mutuelle = ?"
        );
        $stmt->execute([$data['nomMutuelle'], $data['tauxRemboursement'] ?? 0, $data['contact'] ?? null, $id]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM mutuelle WHERE id_mutuelle = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
