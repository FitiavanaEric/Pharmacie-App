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
            $stmt = $pdo->prepare("SELECT * FROM client WHERE id_client = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            $row ? jsonResponse($row) : jsonError("Client introuvable", 404);
        } else {
            $stmt = $pdo->query("SELECT * FROM client ORDER BY nom, prenom");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['nom'])) {
            jsonError("Le nom du client est requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO client (nom, prenom, date_naissance, telephone, num_assure)
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['nom'],
            $data['prenom'] ?? null,
            $data['dateNaissance'] ?? null,
            $data['telephone'] ?? null,
            $data['numAssure'] ?? null,
        ]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        $stmt = $pdo->prepare(
            "UPDATE client SET nom = ?, prenom = ?, date_naissance = ?, telephone = ?, num_assure = ?
             WHERE id_client = ?"
        );
        $stmt->execute([
            $data['nom'],
            $data['prenom'] ?? null,
            $data['dateNaissance'] ?? null,
            $data['telephone'] ?? null,
            $data['numAssure'] ?? null,
            $id,
        ]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM client WHERE id_client = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}