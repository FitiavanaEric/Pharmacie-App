<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

sendCorsHeaders();

$pdo = getConnection();

$ventesJour = $pdo->query(
    "SELECT COALESCE(SUM(montant_net), 0) AS total, COUNT(*) AS nombre
     FROM vente WHERE date_vente = CURRENT_DATE"
)->fetch();

$stockCritique = $pdo->query(
    "SELECT COUNT(DISTINCT a.id_article) AS nombre
     FROM article a
     LEFT JOIN lot l ON l.id_article = a.id_article
     GROUP BY a.id_article, a.stock_minimum
     HAVING COALESCE(SUM(l.quantite_stock), 0) <= a.stock_minimum"
)->fetchAll();

$peremptionProche = $pdo->query(
    "SELECT COUNT(*) AS nombre FROM lot
     WHERE date_peremption <= DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY)"
)->fetch();

$clientsServis = $pdo->query(
    "SELECT COUNT(DISTINCT id_client) AS nombre FROM vente WHERE date_vente = CURRENT_DATE"
)->fetch();

jsonResponse([
    "ventesJour" => (float) $ventesJour['total'],
    "nombreVentesJour" => (int) $ventesJour['nombre'],
    "articlesStockCritique" => count($stockCritique),
    "lotsPeremptionProche" => (int) $peremptionProche['nombre'],
    "clientsServisJour" => (int) $clientsServis['nombre'],
]);
