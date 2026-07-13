<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

sendCorsHeaders();

$pdo = getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

const SELECT_BASE = "
    SELECT a.id_article, a.code_barre, a.nom_article, a.designation, a.unite,
           a.prix_vente, a.stock_minimum,
           a.id_type, t.libelle_type,
           a.id_fournisseur, f.nom AS nom_fournisseur,
           COALESCE(SUM(l.quantite_stock), 0) AS stock_actuel
    FROM article a
    LEFT JOIN type_article t ON t.id_type = a.id_type
    LEFT JOIN fournisseur f ON f.id_fournisseur = a.id_fournisseur
    LEFT JOIN lot l ON l.id_article = a.id_article
";

switch ($method) {

    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare(SELECT_BASE . " WHERE a.id_article = ? GROUP BY a.id_article, t.libelle_type, f.nom");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            $row ? jsonResponse($row) : jsonError("Article introuvable", 404);
        } else {
            $stmt = $pdo->query(SELECT_BASE . " GROUP BY a.id_article, t.libelle_type, f.nom ORDER BY a.nom_article");
            jsonResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = getRequestBody();
        if (empty($data['nomArticle']) || !isset($data['prixVente'])) {
            jsonError("Nom et prix de vente requis");
        }
        $stmt = $pdo->prepare(
            "INSERT INTO article (code_barre, nom_article, designation, unite, prix_vente, stock_minimum, id_type, id_fournisseur)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $data['codeBarre'] ?? null,
            $data['nomArticle'],
            $data['designation'] ?? null,
            $data['unite'] ?? null,
            $data['prixVente'],
            $data['stockMinimum'] ?? 0,
            $data['idType'] ?? null,
            $data['idFournisseur'] ?? null,
        ]);
        jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        break;

    case 'PUT':
        if (!$id) jsonError("Identifiant manquant");
        $data = getRequestBody();
        $stmt = $pdo->prepare(
            "UPDATE article SET code_barre = ?, nom_article = ?, designation = ?, unite = ?,
             prix_vente = ?, stock_minimum = ?, id_type = ?, id_fournisseur = ?
             WHERE id_article = ?"
        );
        $stmt->execute([
            $data['codeBarre'] ?? null,
            $data['nomArticle'],
            $data['designation'] ?? null,
            $data['unite'] ?? null,
            $data['prixVente'],
            $data['stockMinimum'] ?? 0,
            $data['idType'] ?? null,
            $data['idFournisseur'] ?? null,
            $id,
        ]);
        jsonResponse(["success" => true]);
        break;

    case 'DELETE':
        if (!$id) jsonError("Identifiant manquant");
        $stmt = $pdo->prepare("DELETE FROM article WHERE id_article = ?");
        $stmt->execute([$id]);
        jsonResponse(["success" => true]);
        break;

    default:
        jsonError("Methode non supportee", 405);
}