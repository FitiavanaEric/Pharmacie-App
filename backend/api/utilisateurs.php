<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth_guard.php";

sendCorsHeaders();
requireRole(['admin']);

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

const ROLES_VALIDES = ['admin', 'pharmacien', 'gestionnaire_stock', 'caissier', 'responsable_achats'];

switch ($method) {

    case 'GET':
        $stmt = $pdo->query("
            SELECT u.id_utilisateur, u.username, u.role, u.actif, u.date_creation,
                   u.id_employe, e.nom AS nom_employe, e.prenom AS prenom_employe
            FROM utilisateur u
            LEFT JOIN employe e ON e.id_employe = u.id_employe
            ORDER BY u.username
        ");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['username']) || empty($data['password']) || empty($data['role'])) {
            jsonError("Identifiant, mot de passe et role requis");
        }
        if (!in_array($data['role'], ROLES_VALIDES, true)) {
            jsonError("Role invalide");
        }
        $hash = password_hash($data['password'], PASSWORD_DEFAULT);
        try {
            $stmt = $pdo->prepare(
                "INSERT INTO utilisateur (username, password_hash, role, id_employe) VALUES (?, ?, ?, ?)"
            );
            $stmt->execute([$data['username'], $hash, $data['role'], $data['idEmploye'] ?? null]);
            jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        } catch (PDOException $e) {
            jsonError("Cet identifiant existe deja", 409);
        }
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        if (!empty($data['password'])) {
            $hash = password_hash($data['password'], PASSWORD_DEFAULT);
            $pdo->prepare("UPDATE utilisateur SET password_hash = ? WHERE id_utilisateur = ?")
                ->execute([$hash, $id]);
        }
        $stmt = $pdo->prepare("UPDATE utilisateur SET role = ?, actif = ? WHERE id_utilisateur = ?");
        $stmt->execute([$data['role'], $data['actif'] ?? true, $id]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM utilisateur WHERE id_utilisateur = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
