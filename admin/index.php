<?php
require_once __DIR__ . '/config.php';

// --- LOGIN / LOGOUT ---
$loginError = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'login') {
        $user = $_POST['username'] ?? '';
        $pass = $_POST['password'] ?? '';
        if ($user === ADMIN_USERNAME && password_verify($pass, ADMIN_PASSWORD_HASH)) {
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_last_activity'] = time();
            header('Location: index.php');
            exit;
        }
        $loginError = 'Username o password non corretti.';
    }
    if ($_POST['action'] === 'logout') {
        session_destroy();
        header('Location: index.php');
        exit;
    }
}

if (isLoggedIn()) {
    refreshSession();
}

$csrf = generateCsrfToken();
$loggedIn = isLoggedIn();
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Admin — La Bulle</title>
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --black: #1e1e1e;
            --black-deep: #161616;
            --accent: #e6ccab;
            --accent-dim: rgba(230,204,171,0.15);
            --white: #f5f0eb;
            --white-muted: #b0a89e;
            --white-dim: #6e665d;
            --border: rgba(230,204,171,0.12);
            --danger: #e05555;
            --success: #55b87a;
            --font-heading: 'DM Serif Display', serif;
            --font-body: 'Roboto', sans-serif;
            --radius: 12px;
        }

        body {
            font-family: var(--font-body);
            background: var(--black-deep);
            color: var(--white);
            min-height: 100vh;
            line-height: 1.6;
            font-size: 14px;
        }

        a { color: var(--accent); text-decoration: none; }
        a:hover { text-decoration: underline; }

        /* --- LAYOUT --- */
        .admin-header {
            background: var(--black);
            border-bottom: 1px solid var(--border);
            padding: 16px 32px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .admin-header h1 {
            font-family: var(--font-heading);
            font-size: 1.2rem;
            color: var(--accent);
            font-weight: 400;
        }
        .admin-header h1 span { color: var(--white-dim); font-family: var(--font-body); font-size: 0.75rem; margin-left: 12px; letter-spacing: 1px; }
        .admin-nav { display: flex; align-items: center; gap: 16px; }

        .container { max-width: 960px; margin: 0 auto; padding: 32px 24px; }

        /* --- BUTTONS --- */
        .btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 24px;
            font-family: var(--font-body);
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
        }
        .btn--primary { background: var(--accent); color: var(--black); }
        .btn--primary:hover { background: #d4b994; text-decoration: none; }
        .btn--outline { background: none; border: 1px solid var(--border); color: var(--white); }
        .btn--outline:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }
        .btn--danger { background: none; border: 1px solid var(--danger); color: var(--danger); }
        .btn--danger:hover { background: var(--danger); color: var(--white); text-decoration: none; }
        .btn--sm { padding: 6px 16px; font-size: 0.65rem; }
        .btn--ghost { background: none; border: none; color: var(--white-dim); padding: 6px 12px; }
        .btn--ghost:hover { color: var(--accent); text-decoration: none; }

        /* --- LOGIN --- */
        .login-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
        }
        .login-card {
            background: var(--black);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 48px 40px;
            width: 100%;
            max-width: 400px;
        }
        .login-card h1 {
            font-family: var(--font-heading);
            font-size: 1.6rem;
            color: var(--accent);
            margin-bottom: 8px;
            font-weight: 400;
        }
        .login-card p { color: var(--white-dim); font-size: 0.85rem; margin-bottom: 32px; }
        .login-error {
            background: rgba(224,85,85,0.1);
            border: 1px solid var(--danger);
            border-radius: 8px;
            padding: 10px 16px;
            color: var(--danger);
            font-size: 0.8rem;
            margin-bottom: 20px;
        }

        /* --- FORMS --- */
        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: var(--white-muted);
            margin-bottom: 8px;
        }
        .form-control {
            width: 100%;
            padding: 12px 16px;
            background: var(--black-deep);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--white);
            font-family: var(--font-body);
            font-size: 0.9rem;
            transition: border-color 0.2s;
        }
        .form-control:focus { outline: none; border-color: var(--accent); }
        .form-control::placeholder { color: var(--white-dim); }
        textarea.form-control { resize: vertical; min-height: 100px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .file-upload {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px;
            background: var(--black-deep);
            border: 1px dashed var(--border);
            border-radius: 8px;
            cursor: pointer;
            transition: border-color 0.2s;
        }
        .file-upload:hover { border-color: var(--accent); }
        .file-upload input { display: none; }
        .file-upload-text { font-size: 0.8rem; color: var(--white-dim); }
        .file-upload-text strong { color: var(--accent); }
        .file-preview {
            width: 60px; height: 60px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid var(--border);
            display: none;
        }

        /* --- EVENT LIST --- */
        .section-title {
            font-family: var(--font-heading);
            font-size: 1.5rem;
            font-weight: 400;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .event-list { display: flex; flex-direction: column; gap: 8px; }
        .event-row {
            display: grid;
            grid-template-columns: 60px 1fr auto;
            gap: 20px;
            align-items: center;
            background: var(--black);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 16px 20px;
            transition: border-color 0.2s;
        }
        .event-row:hover { border-color: rgba(230,204,171,0.25); }
        .event-row-date {
            text-align: center;
            padding: 8px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--accent-dim);
        }
        .event-row-day {
            display: block;
            font-family: var(--font-heading);
            font-size: 1.2rem;
            color: var(--accent);
            line-height: 1;
        }
        .event-row-month {
            display: block;
            font-size: 0.55rem;
            font-weight: 500;
            letter-spacing: 2px;
            color: var(--white-dim);
            margin-top: 2px;
        }
        .event-row-info h3 {
            font-family: var(--font-heading);
            font-size: 1rem;
            font-weight: 400;
            color: var(--white);
            margin-bottom: 2px;
        }
        .event-row-info p { font-size: 0.75rem; color: var(--white-dim); }
        .event-row-actions { display: flex; gap: 8px; }
        .event-badge {
            display: inline-block;
            padding: 2px 8px;
            font-size: 0.6rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            border-radius: 4px;
            margin-left: 8px;
        }
        .event-badge--active { background: rgba(85,184,122,0.15); color: var(--success); }
        .event-badge--inactive { background: rgba(224,85,85,0.15); color: var(--danger); }

        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: var(--white-dim);
        }
        .empty-state p { font-size: 0.9rem; margin-bottom: 20px; }

        /* --- MODAL --- */
        .modal-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(4px);
            z-index: 200;
            align-items: flex-start;
            justify-content: center;
            padding: 40px 20px;
            overflow-y: auto;
        }
        .modal-overlay.active { display: flex; }
        .modal {
            background: var(--black);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            width: 100%;
            max-width: 600px;
            padding: 36px 32px;
        }
        .modal-title {
            font-family: var(--font-heading);
            font-size: 1.3rem;
            font-weight: 400;
            color: var(--accent);
            margin-bottom: 28px;
        }
        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 28px;
            padding-top: 20px;
            border-top: 1px solid var(--border);
        }

        /* --- TOAST --- */
        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 14px 24px;
            border-radius: var(--radius);
            font-size: 0.8rem;
            font-weight: 500;
            z-index: 300;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s;
        }
        .toast.show { transform: translateY(0); opacity: 1; }
        .toast--success { background: var(--success); color: #fff; }
        .toast--error { background: var(--danger); color: #fff; }

        /* --- RESPONSIVE --- */
        @media (max-width: 640px) {
            .admin-header { padding: 12px 16px; }
            .container { padding: 20px 16px; }
            .form-row { grid-template-columns: 1fr; }
            .form-row-2 { grid-template-columns: 1fr; }
            .event-row { grid-template-columns: 50px 1fr; }
            .event-row-actions { grid-column: 1 / -1; justify-content: flex-end; }
            .modal { padding: 24px 20px; }
        }
    </style>
</head>
<body>

<?php if (!$loggedIn): ?>
<!-- ==================== LOGIN ==================== -->
<div class="login-wrap">
    <div class="login-card">
        <h1>La Bulle</h1>
        <p>Pannello di amministrazione</p>
        <?php if ($loginError): ?>
            <div class="login-error"><?= htmlspecialchars($loginError) ?></div>
        <?php endif; ?>
        <form method="POST">
            <input type="hidden" name="action" value="login">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" class="form-control" required autocomplete="username">
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" class="form-control" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn--primary" style="width:100%; justify-content:center;">Accedi</button>
        </form>
    </div>
</div>

<?php else: ?>
<!-- ==================== DASHBOARD ==================== -->
<header class="admin-header">
    <h1>La Bulle <span>Admin</span></h1>
    <div class="admin-nav">
        <a href="../index.html" class="btn btn--ghost btn--sm" target="_blank">Vedi sito</a>
        <form method="POST" style="display:inline;">
            <input type="hidden" name="action" value="logout">
            <button type="submit" class="btn btn--outline btn--sm">Esci</button>
        </form>
    </div>
</header>

<div class="container">
    <div class="section-title">
        <span>Eventi</span>
        <button class="btn btn--primary btn--sm" onclick="openModal()">+ Nuovo Evento</button>
    </div>

    <div class="event-list" id="eventList">
        <div class="empty-state" id="emptyState">
            <p>Nessun evento presente.<br>Crea il primo evento.</p>
        </div>
    </div>
</div>

<!-- Event Modal -->
<div class="modal-overlay" id="modalOverlay">
    <div class="modal">
        <h2 class="modal-title" id="modalTitle">Nuovo Evento</h2>
        <form id="eventForm" enctype="multipart/form-data">
            <input type="hidden" name="csrf_token" value="<?= $csrf ?>">
            <input type="hidden" name="id" id="eventId">

            <div class="form-group">
                <label>Titolo evento</label>
                <input type="text" name="title" id="fTitle" class="form-control" placeholder="Es. Degustazione Guidata" required>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label>Giorno</label>
                    <input type="text" name="date_day" id="fDay" class="form-control" placeholder="13" required>
                </div>
                <div class="form-group">
                    <label>Mese</label>
                    <select name="date_month" id="fMonth" class="form-control" required>
                        <option value="">—</option>
                        <option value="GEN">Gennaio</option>
                        <option value="FEB">Febbraio</option>
                        <option value="MAR">Marzo</option>
                        <option value="APR">Aprile</option>
                        <option value="MAG">Maggio</option>
                        <option value="GIU">Giugno</option>
                        <option value="LUG">Luglio</option>
                        <option value="AGO">Agosto</option>
                        <option value="SET">Settembre</option>
                        <option value="OTT">Ottobre</option>
                        <option value="NOV">Novembre</option>
                        <option value="DIC">Dicembre</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Anno</label>
                    <input type="text" name="date_year" id="fYear" class="form-control" placeholder="2025" value="2025">
                </div>
            </div>

            <div class="form-row-2">
                <div class="form-group">
                    <label>Orario</label>
                    <input type="text" name="time" id="fTime" class="form-control" placeholder="ore 20:00">
                </div>
                <div class="form-group">
                    <label>Prezzo</label>
                    <input type="text" name="price" id="fPrice" class="form-control" placeholder="€35 / persona">
                </div>
            </div>

            <div class="form-group">
                <label>Descrizione</label>
                <textarea name="description" id="fDesc" class="form-control" placeholder="Descrizione dell'evento..."></textarea>
            </div>

            <div class="form-group">
                <label>Include (opzionale)</label>
                <input type="text" name="includes" id="fIncludes" class="form-control" placeholder="Es. 4 calici + tagliere">
            </div>

            <div class="form-group">
                <label>Locandina / Immagine</label>
                <label class="file-upload" id="fileUpload">
                    <img class="file-preview" id="filePreview">
                    <div class="file-upload-text">
                        <strong>Carica immagine</strong><br>JPG, PNG o WebP (max 5MB)
                    </div>
                    <input type="file" name="image" id="fImage" accept="image/jpeg,image/png,image/webp">
                </label>
            </div>

            <div class="form-group">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; text-transform:none; letter-spacing:0;">
                    <input type="checkbox" name="active" id="fActive" value="1" checked>
                    Evento attivo (visibile sul sito)
                </label>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn btn--outline btn--sm" onclick="closeModal()">Annulla</button>
                <button type="submit" class="btn btn--primary btn--sm" id="submitBtn">Salva Evento</button>
            </div>
        </form>
    </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
const CSRF = '<?= $csrf ?>';
const API = 'api.php';
let events = [];
let editingId = null;

// --- Toast ---
function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast toast--' + type + ' show';
    setTimeout(() => t.classList.remove('show'), 3000);
}

// --- Load Events ---
async function loadEvents() {
    try {
        const res = await fetch(API + '?action=list');
        events = await res.json();
        renderEvents();
    } catch (e) {
        showToast('Errore nel caricamento', 'error');
    }
}

// --- Render ---
function renderEvents() {
    const list = document.getElementById('eventList');
    const empty = document.getElementById('emptyState');

    if (events.length === 0) {
        list.innerHTML = '';
        list.appendChild(empty);
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    list.innerHTML = events.map(ev => `
        <div class="event-row" data-id="${ev.id}">
            <div class="event-row-date">
                <span class="event-row-day">${esc(ev.date_day)}</span>
                <span class="event-row-month">${esc(ev.date_month)}</span>
            </div>
            <div class="event-row-info">
                <h3>${esc(ev.title)}
                    <span class="event-badge ${ev.active ? 'event-badge--active' : 'event-badge--inactive'}">
                        ${ev.active ? 'Attivo' : 'Nascosto'}
                    </span>
                </h3>
                <p>${esc(ev.time)} ${ev.price ? '· ' + esc(ev.price) : ''}</p>
            </div>
            <div class="event-row-actions">
                <button class="btn btn--outline btn--sm" onclick="editEvent('${ev.id}')">Modifica</button>
                <button class="btn btn--danger btn--sm" onclick="deleteEvent('${ev.id}')">Elimina</button>
            </div>
        </div>
    `).join('');
}

function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// --- Modal ---
function openModal(id = null) {
    editingId = id;
    const form = document.getElementById('eventForm');
    form.reset();
    document.getElementById('filePreview').style.display = 'none';
    document.getElementById('eventId').value = '';

    if (id) {
        const ev = events.find(e => e.id === id);
        if (!ev) return;
        document.getElementById('modalTitle').textContent = 'Modifica Evento';
        document.getElementById('submitBtn').textContent = 'Aggiorna';
        document.getElementById('eventId').value = ev.id;
        document.getElementById('fTitle').value = ev.title || '';
        document.getElementById('fDay').value = ev.date_day || '';
        document.getElementById('fMonth').value = ev.date_month || '';
        document.getElementById('fYear').value = ev.date_year || '2025';
        document.getElementById('fTime').value = ev.time || '';
        document.getElementById('fPrice').value = ev.price || '';
        document.getElementById('fDesc').value = ev.description || '';
        document.getElementById('fIncludes').value = ev.includes || '';
        document.getElementById('fActive').checked = ev.active !== false;
        if (ev.image) {
            const preview = document.getElementById('filePreview');
            preview.src = '../' + ev.image;
            preview.style.display = 'block';
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Nuovo Evento';
        document.getElementById('submitBtn').textContent = 'Salva Evento';
    }

    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
    editingId = null;
}

function editEvent(id) {
    openModal(id);
}

// --- Delete ---
async function deleteEvent(id) {
    const ev = events.find(e => e.id === id);
    if (!confirm('Eliminare "' + (ev?.title || '') + '"?')) return;

    const fd = new FormData();
    fd.append('csrf_token', CSRF);
    fd.append('id', id);

    try {
        const res = await fetch(API + '?action=delete', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            showToast('Evento eliminato');
            loadEvents();
        } else {
            showToast(data.error || 'Errore', 'error');
        }
    } catch (e) {
        showToast('Errore di rete', 'error');
    }
}

// --- Submit Form ---
document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    fd.append('csrf_token', CSRF);

    if (!fd.get('active')) fd.append('active', '0');

    const action = editingId ? 'update' : 'create';

    try {
        const res = await fetch(API + '?action=' + action, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
            showToast(editingId ? 'Evento aggiornato' : 'Evento creato');
            closeModal();
            loadEvents();
        } else {
            showToast(data.error || 'Errore nel salvataggio', 'error');
        }
    } catch (e) {
        showToast('Errore di rete', 'error');
    }
});

// --- Image Preview ---
document.getElementById('fImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('filePreview');
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            preview.src = ev.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
    }
});

// --- Close modal on overlay click ---
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// --- Escape key ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// --- Init ---
loadEvents();
</script>

<?php endif; ?>
</body>
</html>
