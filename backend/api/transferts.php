<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

sendCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

const SELECT_BASE = "
    SELECT t.id_transfert, t.date_transfert, t.quantite,
           t.magasin_source, ms.nom_magasin AS nom_source,
           t.magasin_destination, md.nom_magasin AS nom_destination,
           t.id_article, a.nom_article
    FROM transfert t
    LEFT JOIN magasin ms ON ms.id_magasin = t.magasin_source
    LEFT JOIN magasin md ON md.id_magasin = t.magasin_destination
    LEFT JOIN article a ON a.id_article = t.id_article
";

switch ($method) {

    case 'GET':
        $stmt = $pdo->query(SELECT_BASE . " ORDER BY t.date_transfert DESC");
        jsonResponse($stmt->fetchAll());
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['idArticle']) || empty($data['quantite'])) {
            jsonError("Article et quantite requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO transfert (date_transfert, quantite, magasin_source, magasin_destination, id_article)
             VALUES (CURRENT_DATE, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['quantite'],
            $data['magasinSource'] ?? null,
            $data['magasinDestination'] ?? null,
            $data['idArticle'],
        ]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM transfert WHERE id_transfert = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}
