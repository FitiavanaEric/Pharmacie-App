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
            $stmt = $pdo->prepare("SELECT * FROM fournisseur WHERE id_fournisseur = ?");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            $row ? jsonResponse($row) : jsonError("Fournisseur introuvable", 404);
        } else {
            $stmt = $pdo->query("SELECT * FROM fournisseur ORDER BY nom");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['nom'])) {
            jsonError("Le nom du fournisseur est requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO fournisseur (nom, adresse, telephone, email, num_rcm)
             VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['nom'],
            $data['adresse'] ?? null,
            $data['telephone'] ?? null,
            $data['email'] ?? null,
            $data['numRcm'] ?? null,
        ]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        $stmt = $pdo->prepare(
            "UPDATE fournisseur SET nom = ?, adresse = ?, telephone = ?, email = ?, num_rcm = ?
             WHERE id_fournisseur = ?"
        );
        $stmt->execute([
            $data['nom'],
            $data['adresse'] ?? null,
            $data['telephone'] ?? null,
            $data['email'] ?? null,
            $data['numRcm'] ?? null,
            $id,
        ]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM fournisseur WHERE id_fournisseur = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}