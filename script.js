// -------------------- MODO OSCURO --------------------

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



// -------------------- RESALTAR MENÚ ACTIVO --------------------

function highlightActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.navbar .nav-link');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Resalta el link correcto
    if (href === path) {
      link.classList.add('active');
    }
  });
}



// -------------------- CARGAR NOTICIAS DESDE GOOGLE SHEETS --------------------

async function loadNewsFromSheet() {
  const container = document.getElementById('news-container');
  if (!container) return; // no está en esta página

  // ⚠️ IMPORTANTE:
  // Cuando tengas el Google Sheet creado, reemplazá estos dos valores:
  const SHEET_ID = "PON_AQUÍ_TU_ID_DE_SHEET";
  const SHEET_NAME = "Noticias"; // nombre de la pestaña

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

  container.innerHTML = "<p>Cargando noticias...</p>";

  try {
    const resp = await fetch(url);
    const text = await resp.text();

    // Google devuelve un JSON "envuelto"; extraemos la parte válida
    const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const rows = json.table.rows || [];

    if (!rows.length) {
      container.innerHTML = "<p>No hay noticias disponibles en este momento.</p>";
      return;
    }

    const html = rows
      .map(row => {
        const c = row.c;
        const fecha = c[0]?.v || "";
        const titulo = c[1]?.v || "";
        const descripcion = c[2]?.v || "";
        const enlace = c[3]?.v || "";

        return `
          <div class="col-md-6">
            <div class="card shadow-sm border-0 mb-4 h-100">
              <div class="card-body">
                <p class="text-muted mb-1">${fecha}</p>
                <h5 class="card-title text-primary">${titulo}</h5>
                <p>${descripcion}</p>
                ${enlace ? `<a href="${enlace}" class="btn btn-sm btn-outline-primary" target="_blank">Más información</a>` : ""}
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = `<div class="row g-4">${html}</div>`;
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p>No se pudo cargar las noticias. Revisá la configuración del Sheet.</p>`;
  }
}



// -------------------- INICIALIZACIÓN GENERAL --------------------

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  highlightActiveNav();
  loadNewsFromSheet();
});

