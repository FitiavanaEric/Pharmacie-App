<?php
/**
 * Garde-fou d'authentification par session PHP.
 * A inclure dans chaque endpoint qui doit etre protege, puis appeler
 * requireAuth() ou requireRole([...]) juste apres sendCorsHeaders().
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function requireAuth(): void
{
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(["error" => "Authentification requise. Veuillez vous connecter."]);
        exit;
    }
}

function requireRole(array $rolesAutorises): void
{
    requireAuth();
    if (!in_array($_SESSION['role'], $rolesAutorises, true)) {
        http_response_code(403);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode(["error" => "Acces refuse : votre role ne permet pas cette action."]);
        exit;
    }
}

function currentUserRole(): ?string
{
    return $_SESSION['role'] ?? null;
}
