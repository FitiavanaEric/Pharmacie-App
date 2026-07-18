<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../config/helpers.php";
require_once __DIR__ . "/../config/auth_guard.php";

sendCorsHeaders();
requireAuth();

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
        // Transfert reel : decremente le lot source, incremente (ou cree) un lot
        // au meme article/peremption dans le magasin de destination.
        $data = getRequestBody();
        if (empty($data['idLot']) || empty($data['quantite']) || empty($data['magasinDestination'])) {
            jsonError("Lot source, quantite et magasin de destination requis");
        }

        try {
            $pdo->beginTransaction();

            $stmtLot = $pdo->prepare("SELECT * FROM lot WHERE id_lot = ?");
            $stmtLot->execute([$data['idLot']]);
            $lotSource = $stmtLot->fetch();
            if (!$lotSource) throw new Exception("Lot source introuvable");
            if ($lotSource['quantite_stock'] < $data['quantite']) {
                throw new Exception("Stock insuffisant sur le lot source");
            }
            if ((int) $lotSource['id_magasin'] === (int) $data['magasinDestination']) {
                throw new Exception("Le magasin de destination doit etre different du magasin source");
            }

            // Decremente le lot source
            $pdo->prepare("UPDATE lot SET quantite_stock = quantite_stock - ? WHERE id_lot = ?")
                ->execute([$data['quantite'], $data['idLot']]);

            // Cherche un lot existant du meme article/numero dans le magasin destination
            $stmtExist = $pdo->prepare(
                "SELECT id_lot FROM lot WHERE num_lot = ? AND id_magasin = ?"
            );
            $numLotDestination = $lotSource['num_lot'] . "-T" . $data['magasinDestination'];
            $stmtExist->execute([$numLotDestination, $data['magasinDestination']]);
            $lotExistant = $stmtExist->fetch();

            if ($lotExistant) {
                $pdo->prepare("UPDATE lot SET quantite_stock = quantite_stock + ? WHERE id_lot = ?")
                    ->execute([$data['quantite'], $lotExistant['id_lot']]);
            } else {
                $pdo->prepare(
                    "INSERT INTO lot (num_lot, date_fabrication, date_peremption, quantite_stock, emplacement, id_article, id_magasin)
                     VALUES (?, ?, ?, ?, ?, ?, ?)"
                )->execute([
                    $numLotDestination,
                    $lotSource['date_fabrication'],
                    $lotSource['date_peremption'],
                    $data['quantite'],
                    $data['emplacement'] ?? null,
                    $lotSource['id_article'],
                    $data['magasinDestination'],
                ]);
            }

            $stmtTransfert = $pdo->prepare(
                "INSERT INTO transfert (date_transfert, quantite, magasin_source, magasin_destination, id_article)
                 VALUES (CURRENT_DATE, ?, ?, ?, ?)"
            );
            $stmtTransfert->execute([
                $data['quantite'],
                $lotSource['id_magasin'],
                $data['magasinDestination'],
                $lotSource['id_article'],
            ]);

            $pdo->commit();
            jsonResponse(["success" => true, "id" => $pdo->lastInsertId()], 201);
        } catch (Exception $e) {
            $pdo->rollBack();
            jsonError("Transfert annule: " . $e->getMessage(), 400);
        }
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
