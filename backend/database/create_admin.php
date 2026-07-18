<?php
/**
 * Script d'initialisation : cree le compte administrateur par defaut.
 * A executer UNE SEULE FOIS, en ouvrant cette URL dans le navigateur :
 *   http://127.0.0.1:8080/database/create_admin.php
 * Supprime ce fichier (ou renomme-le) une fois le compte cree, pour eviter
 * qu'il ne soit ré-exécuté par erreur.
 */

require_once __DIR__ . "/../config/database.php";

$pdo = getConnection();

$username = "admin";
$password = "admin123"; 
$role = "admin";

$stmt = $pdo->prepare("SELECT COUNT(*) FROM utilisateur WHERE username = ?");
$stmt->execute([$username]);

if ($stmt->fetchColumn() > 0) {
    echo "Le compte '$username' existe deja. Rien a faire.";
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO utilisateur (username, password_hash, role) VALUES (?, ?, ?)");
$stmt->execute([$username, $hash, $role]);

echo "Compte administrateur cree avec succes.<br>";
echo "Identifiant : <b>$username</b><br>";
echo "Mot de passe : <b>$password</b><br><br>";
echo "Pense a changer ce mot de passe et a supprimer ce fichier.";
