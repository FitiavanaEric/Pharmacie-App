<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth_guard.php";

sendCorsHeaders();
requireAuth();

$pdo = getConnection();

// Ventes par jour sur les 30 derniers jours
$ventesParJour = $pdo->query("
    SELECT date_vente, SUM(montant_net) AS total, COUNT(*) AS nombre
    FROM vente
    WHERE date_vente >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
    GROUP BY date_vente
    ORDER BY date_vente ASC
")->fetchAll();

// Articles les plus vendus (top 10, en quantite), avec marge estimee
// (prix de vente moyen encaisse - cout d'achat moyen constate en reception)
$topArticles = $pdo->query("
    SELECT a.nom_article,
           SUM(lv.quantite_vendue) AS quantite_totale,
           SUM(lv.montant_ligne) AS montant_total,
           COALESCE(cout.prix_achat_moyen, 0) AS cout_achat_moyen,
           ROUND(SUM(lv.montant_ligne) - (SUM(lv.quantite_vendue) * COALESCE(cout.prix_achat_moyen, 0)), 2) AS marge_estimee
    FROM ligne_vente lv
    JOIN article a ON a.id_article = lv.id_article
    LEFT JOIN (
        SELECT id_article, AVG(prix_achat_unitaire) AS prix_achat_moyen
        FROM ligne_reception
        GROUP BY id_article
    ) cout ON cout.id_article = a.id_article
    GROUP BY a.id_article, a.nom_article, cout.prix_achat_moyen
    ORDER BY quantite_totale DESC
    LIMIT 10
")->fetchAll();

// Marge globale sur toutes les ventes (meme methode, agregee)
$margeGlobale = $pdo->query("
    SELECT
        SUM(lv.montant_ligne) AS chiffre_affaires,
        SUM(lv.quantite_vendue * COALESCE(cout.prix_achat_moyen, 0)) AS cout_total,
        ROUND(SUM(lv.montant_ligne) - SUM(lv.quantite_vendue * COALESCE(cout.prix_achat_moyen, 0)), 2) AS marge_totale
    FROM ligne_vente lv
    LEFT JOIN (
        SELECT id_article, AVG(prix_achat_unitaire) AS prix_achat_moyen
        FROM ligne_reception
        GROUP BY id_article
    ) cout ON cout.id_article = lv.id_article
")->fetch();

// Rotation de stock : quantite vendue sur 30 jours / stock actuel moyen
$rotationStock = $pdo->query("
    SELECT a.nom_article,
           COALESCE(SUM(l.quantite_stock), 0) AS stock_actuel,
           COALESCE(vendu.quantite_30j, 0) AS quantite_vendue_30j,
           CASE WHEN COALESCE(SUM(l.quantite_stock), 0) > 0
                THEN ROUND(COALESCE(vendu.quantite_30j, 0) / SUM(l.quantite_stock), 2)
                ELSE 0
           END AS taux_rotation
    FROM article a
    LEFT JOIN lot l ON l.id_article = a.id_article
    LEFT JOIN (
        SELECT lv.id_article, SUM(lv.quantite_vendue) AS quantite_30j
        FROM ligne_vente lv
        JOIN vente v ON v.id_vente = lv.id_vente
        WHERE v.date_vente >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
        GROUP BY lv.id_article
    ) vendu ON vendu.id_article = a.id_article
    GROUP BY a.id_article, a.nom_article, vendu.quantite_30j
    ORDER BY taux_rotation DESC
    LIMIT 10
")->fetchAll();

// Comparaison de periodes : 30 derniers jours vs 30 jours precedents
$periodeActuelle = $pdo->query("
    SELECT COALESCE(SUM(montant_net), 0) AS total, COUNT(*) AS nombre
    FROM vente
    WHERE date_vente >= DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
")->fetch();

$periodePrecedente = $pdo->query("
    SELECT COALESCE(SUM(montant_net), 0) AS total, COUNT(*) AS nombre
    FROM vente
    WHERE date_vente >= DATE_SUB(CURRENT_DATE, INTERVAL 60 DAY)
      AND date_vente < DATE_SUB(CURRENT_DATE, INTERVAL 30 DAY)
")->fetch();

$evolutionPct = $periodePrecedente['total'] > 0
    ? round((($periodeActuelle['total'] - $periodePrecedente['total']) / $periodePrecedente['total']) * 100, 1)
    : null;

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
    "margeGlobale" => [
        "chiffreAffaires" => (float) $margeGlobale['chiffre_affaires'],
        "coutTotal" => (float) $margeGlobale['cout_total'],
        "margeTotale" => (float) $margeGlobale['marge_totale'],
    ],
    "rotationStock" => $rotationStock,
    "comparaisonPeriodes" => [
        "periodeActuelle" => [
            "total" => (float) $periodeActuelle['total'],
            "nombre" => (int) $periodeActuelle['nombre'],
        ],
        "periodePrecedente" => [
            "total" => (float) $periodePrecedente['total'],
            "nombre" => (int) $periodePrecedente['nombre'],
        ],
        "evolutionPourcent" => $evolutionPct,
    ],
]);
