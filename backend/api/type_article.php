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
        $stmt = $pdo->query("SELECT * FROM type_article ORDER BY libelle_type");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['libelleType'])) {
            jsonError("Le libelle du type est requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO type_article (libelle_type, description, necessite_ordonnance)
             VALUES (?, ?, ?)"
        );
        $stmt->execute([
            $data['libelleType'],
            $data['description'] ?? null,
            $data['necessiteOrdonnance'] ?? false,
        ]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        $stmt = $pdo->prepare(
            "UPDATE type_article SET libelle_type = ?, description = ?, necessite_ordonnance = ? WHERE id_type = ?"
        );
        $stmt->execute([
            $data['libelleType'],
            $data['description'] ?? null,
            $data['necessiteOrdonnance'] ?? false,
            $id,
        ]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM type_article WHERE id_type = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
