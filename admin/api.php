<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['error' => 'Non autorizzato']);
    exit;
}
refreshSession();

// --- Helpers ---

function loadEvents(): array {
    if (!file_exists(EVENTS_FILE)) {
        return [];
    }
    $json = file_get_contents(EVENTS_FILE);
    return json_decode($json, true) ?: [];
}

function saveEvents(array $events): bool {
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0755, true);
    }
    $json = json_encode($events, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    return file_put_contents(EVENTS_FILE, $json) !== false;
}

function generateId(): string {
    return 'evt_' . bin2hex(random_bytes(6));
}

function handleImageUpload(array $file): ?string {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    if ($file['size'] > MAX_IMAGE_SIZE) {
        throw new Exception('Immagine troppo grande (max 5MB)');
    }
    if (!in_array($file['type'], ALLOWED_IMAGE_TYPES)) {
        throw new Exception('Formato non supportato. Usa JPG, PNG o WebP');
    }
    if (!is_dir(UPLOADS_DIR)) {
        mkdir(UPLOADS_DIR, 0755, true);
    }
    $ext = match($file['type']) {
        'image/jpeg' => '.jpg',
        'image/png' => '.png',
        'image/webp' => '.webp',
        default => '.jpg'
    };
    $filename = 'event_' . bin2hex(random_bytes(8)) . $ext;
    $destination = UPLOADS_DIR . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        throw new Exception('Errore nel caricamento immagine');
    }
    return 'uploads/events/' . $filename;
}

// --- Routing ---

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {

        // GET: lista eventi
        case 'list':
            if ($method !== 'GET') break;
            echo json_encode(loadEvents());
            exit;

        // POST: crea evento
        case 'create':
            if ($method !== 'POST') break;
            if (!verifyCsrfToken($_POST['csrf_token'] ?? '')) {
                throw new Exception('Token CSRF non valido');
            }

            $imagePath = null;
            if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                $imagePath = handleImageUpload($_FILES['image']);
            }

            $event = [
                'id'          => generateId(),
                'title'       => trim($_POST['title'] ?? ''),
                'date_day'    => trim($_POST['date_day'] ?? ''),
                'date_month'  => strtoupper(trim($_POST['date_month'] ?? '')),
                'date_year'   => trim($_POST['date_year'] ?? date('Y')),
                'time'        => trim($_POST['time'] ?? ''),
                'description' => trim($_POST['description'] ?? ''),
                'price'       => trim($_POST['price'] ?? ''),
                'includes'    => trim($_POST['includes'] ?? ''),
                'image'       => $imagePath,
                'active'      => true,
                'created_at'  => date('Y-m-d H:i:s'),
            ];

            if (empty($event['title']) || empty($event['date_day']) || empty($event['date_month'])) {
                throw new Exception('Titolo, giorno e mese sono obbligatori');
            }

            $events = loadEvents();
            $events[] = $event;
            saveEvents($events);

            echo json_encode(['success' => true, 'event' => $event]);
            exit;

        // POST: aggiorna evento
        case 'update':
            if ($method !== 'POST') break;
            if (!verifyCsrfToken($_POST['csrf_token'] ?? '')) {
                throw new Exception('Token CSRF non valido');
            }

            $id = $_POST['id'] ?? '';
            $events = loadEvents();
            $index = array_search($id, array_column($events, 'id'));

            if ($index === false) {
                throw new Exception('Evento non trovato');
            }

            // Gestione immagine
            $imagePath = $events[$index]['image'];
            if (!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                // Elimina vecchia immagine
                if ($imagePath && file_exists(__DIR__ . '/../' . $imagePath)) {
                    unlink(__DIR__ . '/../' . $imagePath);
                }
                $imagePath = handleImageUpload($_FILES['image']);
            }
            // Rimozione immagine esplicita
            if (isset($_POST['remove_image']) && $_POST['remove_image'] === '1') {
                if ($imagePath && file_exists(__DIR__ . '/../' . $imagePath)) {
                    unlink(__DIR__ . '/../' . $imagePath);
                }
                $imagePath = null;
            }

            $events[$index] = array_merge($events[$index], [
                'title'       => trim($_POST['title'] ?? $events[$index]['title']),
                'date_day'    => trim($_POST['date_day'] ?? $events[$index]['date_day']),
                'date_month'  => strtoupper(trim($_POST['date_month'] ?? $events[$index]['date_month'])),
                'date_year'   => trim($_POST['date_year'] ?? $events[$index]['date_year'] ?? date('Y')),
                'time'        => trim($_POST['time'] ?? $events[$index]['time']),
                'description' => trim($_POST['description'] ?? $events[$index]['description']),
                'price'       => trim($_POST['price'] ?? $events[$index]['price']),
                'includes'    => trim($_POST['includes'] ?? $events[$index]['includes']),
                'image'       => $imagePath,
                'active'      => isset($_POST['active']) ? (bool)$_POST['active'] : $events[$index]['active'],
            ]);

            saveEvents($events);
            echo json_encode(['success' => true, 'event' => $events[$index]]);
            exit;

        // POST: elimina evento
        case 'delete':
            if ($method !== 'POST') break;
            if (!verifyCsrfToken($_POST['csrf_token'] ?? '')) {
                throw new Exception('Token CSRF non valido');
            }

            $id = $_POST['id'] ?? '';
            $events = loadEvents();
            $index = array_search($id, array_column($events, 'id'));

            if ($index === false) {
                throw new Exception('Evento non trovato');
            }

            // Elimina immagine
            $img = $events[$index]['image'] ?? null;
            if ($img && file_exists(__DIR__ . '/../' . $img)) {
                unlink(__DIR__ . '/../' . $img);
            }

            array_splice($events, $index, 1);
            saveEvents($events);

            echo json_encode(['success' => true]);
            exit;

        // POST: riordina eventi
        case 'reorder':
            if ($method !== 'POST') break;
            if (!verifyCsrfToken($_POST['csrf_token'] ?? '')) {
                throw new Exception('Token CSRF non valido');
            }

            $order = json_decode($_POST['order'] ?? '[]', true);
            if (!is_array($order)) {
                throw new Exception('Ordine non valido');
            }

            $events = loadEvents();
            $indexed = [];
            foreach ($events as $e) {
                $indexed[$e['id']] = $e;
            }

            $reordered = [];
            foreach ($order as $id) {
                if (isset($indexed[$id])) {
                    $reordered[] = $indexed[$id];
                }
            }
            // Aggiungi eventuali eventi non presenti nell'ordine
            foreach ($events as $e) {
                if (!in_array($e['id'], $order)) {
                    $reordered[] = $e;
                }
            }

            saveEvents($reordered);
            echo json_encode(['success' => true]);
            exit;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Azione non valida']);
            exit;
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo non consentito']);
