<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

session_start();
sendCorsHeaders();
header("Access-Control-Allow-Credentials: true");

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ("$method:$action") {

    case 'POST:login':
        $data = getRequestBody();
        if (empty($data['username']) || empty($data['password'])) {
            jsonError("Identifiant et mot de passe requis");
        }
        $stmt = $pdo->prepare("SELECT * FROM utilisateur WHERE username = ? AND actif = TRUE");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            jsonError("Identifiant ou mot de passe incorrect", 401);
        }

        $_SESSION['user_id'] = $user['id_utilisateur'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        jsonResponse([
            "success" => true,
            "user" => ["username" => $user['username'], "role" => $user['role']],
        ]);
        break;

    case 'POST:logout':
        $_SESSION = [];
        session_destroy();
        jsonResponse(["success" => true]);
        break;

    case 'GET:me':
        if (empty($_SESSION['user_id'])) {
            jsonError("Non connecte", 401);
        }
        jsonResponse([
            "username" => $_SESSION['username'],
            "role" => $_SESSION['role'],
        ]);
        break;

    default:
        jsonError("Action inconnue", 404);
}
