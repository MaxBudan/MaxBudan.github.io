// ---------- MODO OSCURO ----------
function applyTheme(theme) {
  const body = document.body;
  if (theme === 'dark') {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
}

function initThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;

  // Cargar preferencia guardada
  const stored = localStorage.getItem('iiisi-theme');
  const prefersDark = window.matchMedia &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);
  btn.innerText = theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro';

  btn.addEventListener('click', () => {
    const current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    btn.innerText = next === 'dark' ? '☀️ Claro' : '🌙 Oscuro';
    localStorage.setItem('iiisi-theme', next);
  });
}

// ---------- RESALTAR MENÚ ACTUAL ----------
function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.navbar .nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === path || (path === 'index.html' && href === '#')) {
      link.classList.add('active');
    }
  });
}

// ---------- NOTICIAS DESDE GOOGLE SHEETS ----------
async function loadNewsFromSheet() {
  const container = document.getElementById('news-container');
  if (!container) return;

  // 1) Creás un Google Sheet con columnas: Fecha | Título | Descripción | Enlace
  // 2) Lo hacés público de solo lectura: "Cualquier usuario con el enlace -> Lector"
  // 3) Copiás el ID de la URL (entre /d/ y /edit)
  // 4) Reemplazás SHEET_ID y SHEET_NAME abajo

  const SHEET_ID = 'PON_AQUI_TU_SHEET_ID';
  const SHEET_NAME = 'Noticias'; // nombre de la pestaña (hoja)

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

  container.innerHTML = '<p>Cargando noticias...</p>';

  try {
    const resp = await fetch(url);
    const text = await resp.text();

    const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const rows = json.table.rows || [];

    if (!rows.length) {
      container.innerHTML = '<p>No hay noticias disponibles por el momento.</p>';
      return;
    }

    const cards = rows.map(row => {
      const c = row.c;
      const fecha = c[0]?.v || '';
      const titulo = c[1]?.v || '';
      const descripcion = c[2]?.v || '';
      const enlace = c[3]?.v || '';

      return `
        <div class="col-md-6 mb-4">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <p class="text-muted mb-1">${fecha}</p>
              <h5 class="card-title text-primary">${titulo}</h5>
              <p class="card-text">${descripcion}</p>
              ${enlace ? `<a href="${enlace}" target="_blank" class="btn btn-sm btn-outline-primary">Más información</a>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `<div class="row g-4">${cards}</div>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>No se pudieron cargar las noticias. Verifique el Google Sheet.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  highlightActiveNav();
  loadNewsFromSheet();
});

