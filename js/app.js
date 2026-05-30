// ============================================================
//  Dairy Pro — App Core (auth, routing, UI helpers)
// ============================================================

window._dpSession = null;

// ── Toast ────────────────────────────────────────────────────
function toast(msg, type='success') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i class="ti ti-${type==='success'?'check':'alert-circle'}"></i>${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ── Modal ────────────────────────────────────────────────────
function showModal(html, onOpen) {
  const existing = document.getElementById('modal-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay'; overlay.id = 'modal-overlay';
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  if (onOpen) onOpen(overlay.querySelector('.modal'));
}
function closeModal() {
  const m = document.getElementById('modal-overlay');
  if (m) m.remove();
}

// ── Confirm Dialog ───────────────────────────────────────────
function confirmDialog(msg, onYes) {
  showModal(`
    <div class="modal-header"><h3>Confirm</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <p>${msg}</p>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn btn-danger" id="confirm-yes-btn">Yes, proceed</button>
    </div>
  `);
  document.getElementById('confirm-yes-btn').onclick = () => { closeModal(); onYes(); };
}

// ── Auth ─────────────────────────────────────────────────────
function doLogin(e) {
  e.preventDefault();
  const activeTab = document.querySelector('.login-tab.active').dataset.role;
  const name = document.getElementById('login-name').value.trim();
  const pass = document.getElementById('login-pass').value;
  const user = DB.authenticate(name, pass);
  if (!user || user.role !== activeTab) {
    document.getElementById('login-error').classList.remove('hidden');
    return;
  }
  document.getElementById('login-error').classList.add('hidden');
  window._dpSession = user;
  sessionStorage.setItem('dp_session', user.id);
  mountApp(user);
}

function doLogout() {
  window._dpSession = null;
  sessionStorage.removeItem('dp_session');
  document.getElementById('page-app').style.display = 'none';
  document.getElementById('page-login').style.display = 'flex';
}

function fillDemo(name, pass) {
  document.getElementById('login-name').value = name;
  document.getElementById('login-pass').value = pass;
}

// ── Login tab switching ───────────────────────────────────────
function switchLoginTab(role) {
  document.querySelectorAll('.login-tab').forEach(t => t.classList.toggle('active', t.dataset.role === role));
  const demos = {
    admin:    [['Admin','admin123']],
    seller:   [['Ravi Kumar','ravi123'],['Suresh Reddy','suresh123'],['Lakshmi Devi','lakshmi123']],
    customer: [['Anand Rao','anand123'],['Priya Sharma','priya123'],['Vijay Singh','vijay123']],
  };
  const rows = (demos[role]||[]).map(([n,p]) =>
    `<div class="demo-row" onclick="fillDemo('${n}','${p}')"><i class="ti ti-user" style="font-size:.9rem"></i> ${n} — <code>${p}</code></div>`
  ).join('');
  document.getElementById('demo-list').innerHTML = rows;
}

// ── Mount App ─────────────────────────────────────────────────
function mountApp(user) {
  document.getElementById('page-login').style.display = 'none';
  document.getElementById('page-app').style.display = 'block';

  // Topbar
  document.getElementById('tb-user-name').textContent = user.name;
  document.getElementById('tb-user-role').textContent =
    { admin:'Administrator', middle:'Middle Person', seller:'Milk Seller', customer:'Customer' }[user.role];
  const avClasses = { admin:'av-blue', middle:'av-green', seller:'av-amber', customer:'av-coral' };
  document.getElementById('tb-avatar').className = `avatar ${avClasses[user.role]}`;
  document.getElementById('tb-avatar').textContent = user.avatar;

  // Sidebar
  const avClasses2 = avClasses;
  const sd = document.getElementById('sidebar-user-block');
  sd.innerHTML = `
    <div class="avatar ${avClasses2[user.role]}">${user.avatar}</div>
    <div><div class="su-name">${user.name}</div><div class="su-role">${
      {admin:'Administrator',middle:'Middle Person',seller:'Milk Seller',customer:'Customer'}[user.role]
    }</div></div>
  `;

  buildNav(user);
  const firstPage = { admin:'admin-dash', middle:'mp-dash', seller:'sel-dash', customer:'cust-dash' }[user.role];
  navigateTo(firstPage);
}

// ── Navigation ────────────────────────────────────────────────
const NAV = {
  admin: [
    { group: 'Overview' },
    { id:'admin-dash',    icon:'ti-layout-dashboard', label:'Dashboard' },
    { group: 'Management' },
    { id:'admin-users',   icon:'ti-users',            label:'Manage Users' },
    { id:'admin-rates',   icon:'ti-settings',         label:'Rate Settings' },
    { group: 'Records' },
    { id:'admin-colls',  icon:'ti-droplet',           label:'All Collections' },
    { id:'admin-sales',  icon:'ti-shopping-cart',     label:'All Sales' },
    { group: 'Reports' },
    { id:'admin-reports',icon:'ti-chart-bar',         label:'Reports' },
    { id:'admin-audit',  icon:'ti-clipboard-list',    label:'Audit Log' },
  ],
  middle: [
    { group: 'Overview' },
    { id:'mp-dash',      icon:'ti-layout-dashboard',  label:'Dashboard' },
    { group: 'Data Entry' },
    { id:'mp-add-coll',  icon:'ti-droplet-plus',      label:'Add Collection' },
    { id:'mp-add-sale',  icon:'ti-shopping-cart-plus',label:'Add Sale' },
    { group: 'Records' },
    { id:'mp-colls',     icon:'ti-table',             label:'Collections' },
    { id:'mp-sales',     icon:'ti-basket',            label:'Sales' },
    { group: 'Summaries' },
    { id:'mp-sellers',   icon:'ti-cow',               label:'Seller Overview' },
    { id:'mp-customers', icon:'ti-user-check',        label:'Customer Overview' },
    { id:'mp-monthly',   icon:'ti-calendar-month',    label:'Monthly Summary' },
  ],
  seller: [
    { group: 'My Account' },
    { id:'sel-dash',     icon:'ti-layout-dashboard',  label:'Dashboard' },
    { id:'sel-supply',   icon:'ti-calendar',          label:'Day-wise Supply' },
    { id:'sel-monthly',  icon:'ti-calendar-month',    label:'Monthly Total' },
    { id:'sel-payments', icon:'ti-wallet',            label:'My Payments' },
  ],
  customer: [
    { group: 'My Account' },
    { id:'cust-dash',    icon:'ti-layout-dashboard',  label:'Dashboard' },
    { id:'cust-daywise', icon:'ti-calendar',          label:'Day-wise Purchase' },
    { id:'cust-monthly', icon:'ti-calendar-month',    label:'Monthly Bill' },
    { id:'cust-payments',icon:'ti-receipt',           label:'Payment History' },
  ],
};

function buildNav(user) {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  for (const item of NAV[user.role]) {
    if (item.group) {
      nav.innerHTML += `<div class="nav-group-label">${item.group}</div>`;
    } else {
      nav.innerHTML += `<div class="nav-item" data-page="${item.id}" onclick="navigateTo('${item.id}')"><i class="ti ${item.icon}"></i>${item.label}</div>`;
    }
  }
}

function navigateTo(pageId) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === pageId));
  const area = document.getElementById('content-area');
  const pageRenderer = PAGES[pageId];
  if (pageRenderer) {
    area.innerHTML = pageRenderer();
    const initFn = window['init_' + pageId.replace(/-/g,'_')];
    if (initFn) initFn();
  } else {
    area.innerHTML = `<div class="page-header"><h2>Page not found</h2></div>`;
  }
  const nav = NAV[window._dpSession.role].find(n => n.id === pageId);
  document.getElementById('topbar-title').textContent = nav ? nav.label : '';
  // close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

// ── Helpers ───────────────────────────────────────────────────
function avatarClass(role) {
  return { admin:'av-blue', middle:'av-green', seller:'av-amber', customer:'av-coral' }[role] || 'av-gray';
}
function roleLabel(role) {
  return { admin:'Admin', middle:'Middle Person', seller:'Seller', customer:'Customer' }[role] || role;
}
function statusBadge(paid) {
  return paid ? '<span class="badge badge-green">Paid</span>' : '<span class="badge badge-amber">Pending</span>';
}
function fmtDate(d) {
  if (!d) return '—';
  const [y,m,day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
}
function currentMonth() { return '2026-05'; }

// ── Print / Export ────────────────────────────────────────────
function printTable(title, html) {
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>${title}</title>
    <style>body{font-family:sans-serif;padding:20px}h2{margin-bottom:12px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{background:#f3f4f6;padding:8px;text-align:left;border:1px solid #e5e7eb}
    td{padding:8px;border:1px solid #e5e7eb}
    .total{font-weight:bold;background:#e8f5ee}</style></head>
    <body><h2>${title}</h2>${html}</body></html>
  `);
  w.document.close(); w.print();
}

function exportCSV(filename, headers, rows) {
  const lines = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  DB.init();
  // Auto-login from session
  const sid = sessionStorage.getItem('dp_session');
  if (sid) {
    const u = DB.getUserById(sid);
    if (u) { window._dpSession = u; mountApp(u); return; }
  }
  // Login tab setup
  switchLoginTab('middle');
  document.getElementById('login-form').addEventListener('submit', doLogin);
  document.getElementById('hamburger-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
});
