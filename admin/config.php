<?php
/**
 * La Bulle — Admin Configuration
 *
 * Per cambiare la password:
 * 1. Vai su https://www.php.net/manual/en/function.password-hash.php
 * 2. Oppure esegui: php -r "echo password_hash('LA_TUA_PASSWORD', PASSWORD_DEFAULT);"
 * 3. Sostituisci il valore di ADMIN_PASSWORD_HASH qui sotto
 */

// --- CREDENZIALI ---
define('ADMIN_USERNAME', 'admin');
// Password di default: "labulle2025" — CAMBIALA subito dopo il primo accesso
define('ADMIN_PASSWORD_HASH', password_hash('labulle2025', PASSWORD_DEFAULT));

// --- PERCORSI ---
define('DATA_DIR', __DIR__ . '/../data/');
define('EVENTS_FILE', DATA_DIR . 'events.json');
define('UPLOADS_DIR', __DIR__ . '/../uploads/events/');
define('UPLOADS_URL', '../uploads/events/');

// --- SICUREZZA ---
define('SESSION_LIFETIME', 3600); // 1 ora
define('MAX_IMAGE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/webp']);

// --- AVVIO SESSIONE ---
session_start();

function isLoggedIn(): bool {
    return isset($_SESSION['admin_logged_in'])
        && $_SESSION['admin_logged_in'] === true
        && (time() - ($_SESSION['admin_last_activity'] ?? 0)) < SESSION_LIFETIME;
}

function refreshSession(): void {
    $_SESSION['admin_last_activity'] = time();
}

function generateCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(string $token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}
