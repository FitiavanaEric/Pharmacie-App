<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

sendCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM magasin ORDER BY nom_magasin");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['nomMagasin'])) {
            jsonError("Le nom du magasin est requis");
        }
        $stmt = $pdo->prepare("INSERT INTO magasin (nom_magasin, adresse) VALUES (?, ?)");
        $stmt->execute([$data['nomMagasin'], $data['adresse'] ?? null]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
