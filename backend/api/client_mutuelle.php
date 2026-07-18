<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth_guard.php";

sendCorsHeaders();
requireAuth();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        // Liste toutes les associations client-mutuelle avec noms lisibles
        $stmt = $pdo->query("
            SELECT cm.id_client, c.nom AS nom_client, c.prenom AS prenom_client,
                   cm.id_mutuelle, m.nom_mutuelle, m.taux_remboursement,
                   cm.date_adhesion
            FROM client_mutuelle cm
            JOIN client c ON c.id_client = cm.id_client
            JOIN mutuelle m ON m.id_mutuelle = cm.id_mutuelle
            ORDER BY c.nom
        ");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['idClient']) || empty($data['idMutuelle'])) {
            jsonError("Client et mutuelle requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO client_mutuelle (id_client, id_mutuelle, date_adhesion) VALUES (?, ?, CURRENT_DATE)"
        );
        $stmt->execute([$data['idClient'], $data['idMutuelle']]);
        jsonResponse(["success" => true], 201);
        break;

    case 'DELETE':
        $idClient = $_GET['idClient'] ?? null;
        $idMutuelle = $_GET['idMutuelle'] ?? null;
        if (!$idClient || !$idMutuelle) jsonError("Client et mutuelle requis");
        $stmt = $pdo->prepare("DELETE FROM client_mutuelle WHERE id_client = ? AND id_mutuelle = ?");
        $stmt->execute([$idClient, $idMutuelle]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
