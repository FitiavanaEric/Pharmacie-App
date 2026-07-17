<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";

sendCorsHeaders();

$pdo = getConnection();

// Ventes par jour sur les 30 derniers jours
$ventesParJour = $pdo->query("
    SELECT date_vente, SUM(montant_net) AS total, COUNT(*) AS nombre
    FROM vente
    WHERE date_vente >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    GROUP BY date_vente
    ORDER BY date_vente ASC
")->fetchAll();

// Articles les plus vendus (top 10, en quantite)
$topArticles = $pdo->query("
    SELECT a.nom_article, SUM(lv.quantite_vendue) AS quantite_totale,
           SUM(lv.montant_ligne) AS montant_total
    FROM ligne_vente lv
    JOIN article a ON a.id_article = lv.id_article
    GROUP BY a.id_article, a.nom_article
    ORDER BY quantite_totale DESC
    LIMIT 10
")->fetchAll();

// Valeur totale du stock actuel (au prix de vente)
$valeurStock = $pdo->query("
    SELECT COALESCE(SUM(l.quantite_stock * a.prix_vente), 0) AS valeur
    FROM lot l
    JOIN article a ON a.id_article = l.id_article
")->fetch();

// Repartition des ventes par mode de paiement
$parModePaiement = $pdo->query("
    SELECT mode_paiement, COUNT(*) AS nombre, SUM(montant_net) AS total
    FROM vente
    GROUP BY mode_paiement
")->fetchAll();

jsonResponse([
    "ventesParJour" => $ventesParJour,
    "topArticles" => $topArticles,
    "valeurStock" => (float) $valeurStock['valeur'],
    "parModePaiement" => $parModePaiement,
]);
