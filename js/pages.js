// ============================================================
//  Dairy Pro — Page Renderers
// ============================================================

const PAGES = {};

// ════════════════════════════════════════════════════════════
//  SHARED: Fat Selector
// ════════════════════════════════════════════════════════════
function fatGrid(inputId, rateInputId) {
  const rates = DB.getRates();
  const keys = Object.keys(rates).map(Number).sort((a,b)=>a-b);
  return `<div class="fat-grid" id="fat-grid-${inputId}">
    ${keys.map(f=>`<div class="fat-cell" data-fat="${f}" onclick="pickFat(${f},'${inputId}','${rateInputId}')">
      <div class="fc-pct">${f}%</div><div class="fc-rate">₹${rates[f]}/L</div>
    </div>`).join('')}
  </div>`;
}
function pickFat(fat, fatInputId, rateInputId) {
  document.querySelectorAll(`#fat-grid-${fatInputId} .fat-cell`).forEach(c => c.classList.toggle('selected', parseFloat(c.dataset.fat) === fat));
  const fi = document.getElementById(fatInputId); if(fi) fi.value = fat;
  const ri = document.getElementById(rateInputId); if(ri) ri.value = DB.getRates()[fat] || '';
  calcCollection();
}
window.pickFat = pickFat;

function fatAutoRate(fatInputId, rateInputId) {
  const fat = parseFloat(document.getElementById(fatInputId)?.value);
  if (isNaN(fat)) return;
  const r = DB.getRateForFat(fat);
  const ri = document.getElementById(rateInputId); if(ri) ri.value = r;
  const rates = DB.getRates();
  const keys = Object.keys(rates).map(Number).sort((a,b)=>a-b);
  let best = keys[0];
  for (const k of keys) { if (k <= fat) best = k; }
  document.querySelectorAll(`#fat-grid-${fatInputId} .fat-cell`).forEach(c => c.classList.toggle('selected', parseFloat(c.dataset.fat) === best));
}
window.fatAutoRate = fatAutoRate;

// ════════════════════════════════════════════════════════════
//  ADMIN PAGES
// ════════════════════════════════════════════════════════════

// ── Admin Dashboard ──────────────────────────────────────────
PAGES['admin-dash'] = () => {
  const colls = DB.getCollections();
  const sales = DB.getSales();
  const totCL = colls.reduce((a,b)=>a+b.liters,0);
  const totCA = colls.reduce((a,b)=>a+b.amount,0);
  const totSL = sales.reduce((a,b)=>a+b.qty,0);
  const totSA = sales.reduce((a,b)=>a+b.amount,0);
  const profit = totSA - totCA;
  const pendColl = colls.filter(c=>!c.paid).reduce((a,b)=>a+b.amount,0);
  const pendSales = sales.filter(s=>!s.paid).reduce((a,b)=>a+b.amount,0);
  const sellers = DB.getUsers().filter(u=>u.role==='seller');
  const customers = DB.getUsers().filter(u=>u.role==='customer');

  return `<div class="page-header"><h2><i class="ti ti-layout-dashboard"></i>Admin Dashboard</h2><p>Full overview of all operations</p></div>
  <div class="metrics-grid">
    <div class="metric-card mc-blue"><div class="mc-label">Total Collected</div><div class="mc-value">${totCL}L</div><div class="mc-sub">All sellers combined</div></div>
    <div class="metric-card mc-green"><div class="mc-label">Total Sold</div><div class="mc-value">${totSL}L</div><div class="mc-sub">To all customers</div></div>
    <div class="metric-card mc-amber"><div class="mc-label">Buy Cost</div><div class="mc-value">₹${DB.fmtInt(totCA)}</div></div>
    <div class="metric-card mc-teal"><div class="mc-label">Sale Revenue</div><div class="mc-value">₹${DB.fmtInt(totSA)}</div></div>
    <div class="metric-card ${profit>=0?'mc-green':'mc-red'}"><div class="mc-label">Net Profit</div><div class="mc-value">₹${DB.fmtInt(profit)}</div></div>
    <div class="metric-card mc-red"><div class="mc-label">Pending Payouts</div><div class="mc-value">₹${DB.fmtInt(pendColl)}</div><div class="mc-sub">To sellers</div></div>
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><h3><i class="ti ti-users"></i>Users</h3></div>
      <div class="metrics-grid" style="grid-template-columns:1fr 1fr 1fr;gap:8px">
        <div class="metric-card mc-amber"><div class="mc-label">Sellers</div><div class="mc-value" style="font-size:1.4rem">${sellers.length}</div></div>
        <div class="metric-card mc-coral"><div class="mc-label">Customers</div><div class="mc-value" style="font-size:1.4rem">${customers.length}</div></div>
        <div class="metric-card mc-green"><div class="mc-label">Staff</div><div class="mc-value" style="font-size:1.4rem">${DB.getUsers().filter(u=>u.role==='middle').length}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3><i class="ti ti-chart-bar"></i>This Month at a Glance</h3></div>
      <table><tbody>
        <tr><td style="color:var(--gray-500)">Records entered</td><td><strong>${colls.length + sales.length}</strong></td></tr>
        <tr><td style="color:var(--gray-500)">Avg fat %</td><td><strong>${(colls.reduce((a,b)=>a+b.fat,0)/colls.length||0).toFixed(1)}%</strong></td></tr>
        <tr><td style="color:var(--gray-500)">Seller due</td><td><strong style="color:var(--red)">₹${DB.fmtInt(pendColl)}</strong></td></tr>
        <tr><td style="color:var(--gray-500)">Customer due</td><td><strong style="color:var(--amber)">₹${DB.fmtInt(pendSales)}</strong></td></tr>
      </tbody></table>
    </div>
  </div>
  <div class="card mt-2">
    <div class="card-header"><h3><i class="ti ti-cow"></i>Seller-wise Summary</h3></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Seller</th><th>Total Liters</th><th>Avg Fat %</th><th>Total Amount</th><th>Paid</th><th>Pending</th></tr></thead>
      <tbody>${sellers.map(u=>{
        const uc=DB.getCollectionsBySeller(u.id);
        const tot=uc.reduce((a,b)=>a+b.amount,0);
        const paid=uc.filter(c=>c.paid).reduce((a,b)=>a+b.amount,0);
        const avgFat=uc.length?(uc.reduce((a,b)=>a+b.fat,0)/uc.length).toFixed(1):0;
        return `<tr><td><div class="flex-center gap-1"><div class="avatar av-amber" style="width:28px;height:28px;font-size:.7rem">${u.avatar}</div>${u.name}</div></td>
          <td>${uc.reduce((a,b)=>a+b.liters,0)}L</td><td>${avgFat}%</td>
          <td>₹${DB.fmtInt(tot)}</td><td style="color:var(--green)">₹${DB.fmtInt(paid)}</td>
          <td style="color:var(--red)">₹${DB.fmtInt(tot-paid)}</td></tr>`;
      }).join('')}</tbody>
    </table></div>
  </div>`;
};

// ── Admin: Manage Users ──────────────────────────────────────
PAGES['admin-users'] = () => {
  const users = DB.getUsers().filter(u => u.role !== 'admin');
  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-users"></i>Manage Users</h2><p>Add, edit or deactivate sellers, middle persons and customers</p></div>
    <button class="btn btn-primary" onclick="openAddUser()"><i class="ti ti-plus"></i>Add User</button>
  </div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${users.map(u=>`<tr>
        <td><div class="flex-center gap-1"><div class="avatar ${avatarClass(u.role)}" style="width:30px;height:30px;font-size:.75rem">${u.avatar}</div><strong>${u.name}</strong></div></td>
        <td><span class="badge ${u.role==='seller'?'badge-amber':u.role==='customer'?'badge-red':'badge-green'}">${roleLabel(u.role)}</span></td>
        <td>${u.phone||'—'}</td>
        <td><span class="badge ${u.active?'badge-green':'badge-gray'}">${u.active?'Active':'Inactive'}</span></td>
        <td class="no-print">
          <button class="btn btn-sm btn-secondary" onclick="openEditUser('${u.id}')"><i class="ti ti-edit"></i>Edit</button>
          <button class="btn btn-sm btn-danger" onclick="toggleUser('${u.id}',${u.active})" style="margin-left:4px">${u.active?'Deactivate':'Activate'}</button>
        </td>
      </tr>`).join('')}</tbody>
    </table></div>
  </div>`;
};
window.openAddUser = () => {
  showModal(`<div class="modal-header"><h3>Add New User</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>
  <div class="form-group mb-1"><label>Full Name</label><input type="text" id="nu-name" placeholder="e.g. Suresh Reddy"></div>
  <div class="form-group mb-1"><label>Role</label><select id="nu-role"><option value="seller">Seller</option><option value="customer">Customer</option><option value="middle">Middle Person</option></select></div>
  <div class="form-group mb-1"><label>Phone</label><input type="tel" id="nu-phone" placeholder="10-digit number"></div>
  <div class="form-group mb-1"><label>Password</label><input type="text" id="nu-pass" placeholder="Set a password"></div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveNewUser()">Save</button></div>`);
};
window.saveNewUser = () => {
  const name = document.getElementById('nu-name').value.trim();
  const role = document.getElementById('nu-role').value;
  const phone = document.getElementById('nu-phone').value.trim();
  const pass = document.getElementById('nu-pass').value;
  if (!name||!pass) { toast('Name and password required','error'); return; }
  const initials = name.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2);
  const user = { id: DB.nextId('usr'), name, role, pass, phone, avatar: initials, active: true };
  DB.saveUser(user);
  closeModal(); toast('User added successfully');
  navigateTo('admin-users');
};
window.openEditUser = (id) => {
  const u = DB.getUserById(id);
  if (!u) return;
  showModal(`<div class="modal-header"><h3>Edit User — ${u.name}</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>
  <div class="form-group mb-1"><label>Full Name</label><input type="text" id="eu-name" value="${u.name}"></div>
  <div class="form-group mb-1"><label>Phone</label><input type="tel" id="eu-phone" value="${u.phone||''}"></div>
  <div class="form-group mb-1"><label>New Password (leave blank to keep)</label><input type="text" id="eu-pass" placeholder="New password"></div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="saveEditUser('${id}')">Save Changes</button></div>`);
};
window.saveEditUser = (id) => {
  const u = DB.getUserById(id);
  u.name = document.getElementById('eu-name').value.trim() || u.name;
  u.phone = document.getElementById('eu-phone').value.trim();
  const np = document.getElementById('eu-pass').value;
  if (np) u.pass = np;
  DB.saveUser(u); closeModal(); toast('User updated'); navigateTo('admin-users');
};
window.toggleUser = (id, active) => {
  confirmDialog(`${active?'Deactivate':'Activate'} this user?`, () => {
    const u = DB.getUserById(id); u.active = !active; DB.saveUser(u);
    toast('User status updated'); navigateTo('admin-users');
  });
};

// ── Admin: Rate Settings ─────────────────────────────────────
PAGES['admin-rates'] = () => {
  const rates = DB.getRates();
  const keys = Object.keys(rates).map(Number).sort((a,b)=>a-b);
  return `<div class="page-header"><h2><i class="ti ti-settings"></i>Fat Rate Settings</h2><p>Set the rate per litre for each fat % level. Changes affect new entries.</p></div>
  <div class="card" style="max-width:520px">
    <div class="card-header"><h3><i class="ti ti-table"></i>Fat % → Rate Table</h3></div>
    <div class="fat-grid" style="grid-template-columns:repeat(3,1fr)">
      ${keys.map(f=>`<div style="background:var(--gray-50);border:1px solid var(--gray-200);border-radius:8px;padding:10px;text-align:center">
        <div style="font-weight:600;color:var(--green-dark);font-size:.9rem">${f}%</div>
        <input type="number" id="rate-${f.toString().replace('.','_')}" value="${rates[f]}" style="margin-top:6px;width:100%;text-align:center;font-weight:600" min="0" step="0.5">
      </div>`).join('')}
    </div>
    <div class="form-actions" style="margin-top:16px">
      <button class="btn btn-primary" onclick="saveRates()"><i class="ti ti-check"></i>Save All Rates</button>
      <button class="btn btn-secondary" onclick="addFatLevel()"><i class="ti ti-plus"></i>Add Fat Level</button>
    </div>
  </div>`;
};
window.saveRates = () => {
  const rates = DB.getRates();
  Object.keys(rates).forEach(f => {
    const el = document.getElementById('rate-' + f.toString().replace('.','_'));
    if (el) rates[f] = parseFloat(el.value) || rates[f];
  });
  DB.saveRates(rates); toast('Rates saved successfully');
};
window.addFatLevel = () => {
  showModal(`<div class="modal-header"><h3>Add Fat Level</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>
  <div class="grid-2">
    <div class="form-group"><label>Fat %</label><input type="number" id="nf-fat" placeholder="e.g. 9.0" step="0.5"></div>
    <div class="form-group"><label>Rate ₹/L</label><input type="number" id="nf-rate" placeholder="e.g. 65"></div>
  </div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="doAddFat()">Add</button></div>`);
};
window.doAddFat = () => {
  const fat = parseFloat(document.getElementById('nf-fat').value);
  const rate = parseFloat(document.getElementById('nf-rate').value);
  if (!fat||!rate) { toast('Enter valid values','error'); return; }
  const rates = DB.getRates(); rates[fat] = rate; DB.saveRates(rates);
  closeModal(); toast('Fat level added'); navigateTo('admin-rates');
};

// ── Admin: All Collections ───────────────────────────────────
PAGES['admin-colls'] = () => {
  const colls = DB.getCollections().slice().sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-droplet"></i>All Collections</h2><p>Every milk collection entry</p></div>
    <div class="flex gap-1 no-print">
      <button class="btn btn-sm btn-secondary" onclick="exportCollsCSV()"><i class="ti ti-file-spreadsheet"></i>CSV</button>
      <button class="btn btn-sm btn-secondary" onclick="printColls()"><i class="ti ti-printer"></i>Print</button>
    </div>
  </div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Seller</th><th>Liters</th><th>Fat %</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th><th class="no-print">Actions</th></tr></thead>
      <tbody>${colls.map(c=>`<tr>
        <td>${fmtDate(c.date)}</td><td>${DB.userName(c.seller)}</td>
        <td>${c.liters}L</td><td>${c.fat}%</td><td>₹${c.rate}/L</td><td><strong>₹${DB.fmtInt(c.amount)}</strong></td>
        <td>${statusBadge(c.paid)}</td><td class="note-cell">${c.note||'—'}</td>
        <td class="no-print"><button class="btn btn-xs btn-amber" onclick="openEditColl('${c.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-xs btn-danger" onclick="deleteColl('${c.id}')" style="margin-left:3px"><i class="ti ti-trash"></i></button></td>
      </tr>`).join('')}
      <tr class="tfoot-total"><td colspan="2">Total</td><td>${colls.reduce((a,b)=>a+b.liters,0)}L</td><td>—</td><td>—</td><td>₹${DB.fmtInt(colls.reduce((a,b)=>a+b.amount,0))}</td><td colspan="3"></td></tr>
      </tbody>
    </table></div>
  </div>`;
};

// ── Admin: All Sales ─────────────────────────────────────────
PAGES['admin-sales'] = () => {
  const sales = DB.getSales().slice().sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-shopping-cart"></i>All Sales</h2><p>Every sale entry to customers</p></div>
    <div class="flex gap-1 no-print">
      <button class="btn btn-sm btn-secondary" onclick="exportSalesCSV()"><i class="ti ti-file-spreadsheet"></i>CSV</button>
      <button class="btn btn-sm btn-secondary" onclick="printSales()"><i class="ti ti-printer"></i>Print</button>
    </div>
  </div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Customer</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th><th class="no-print">Actions</th></tr></thead>
      <tbody>${sales.map(s=>`<tr>
        <td>${fmtDate(s.date)}</td><td>${DB.userName(s.customer)}</td>
        <td>${s.qty}L</td><td>₹${s.rate}/L</td><td><strong>₹${DB.fmtInt(s.amount)}</strong></td>
        <td>${statusBadge(s.paid)}</td><td class="note-cell">${s.note||'—'}</td>
        <td class="no-print"><button class="btn btn-xs btn-amber" onclick="openEditSale('${s.id}')"><i class="ti ti-edit"></i></button>
        <button class="btn btn-xs btn-danger" onclick="deleteSale('${s.id}')" style="margin-left:3px"><i class="ti ti-trash"></i></button></td>
      </tr>`).join('')}
      <tr class="tfoot-total"><td colspan="2">Total</td><td>${sales.reduce((a,b)=>a+b.qty,0)}L</td><td>—</td><td>₹${DB.fmtInt(sales.reduce((a,b)=>a+b.amount,0))}</td><td colspan="3"></td></tr>
      </tbody>
    </table></div>
  </div>`;
};

// ── Admin: Reports ───────────────────────────────────────────
PAGES['admin-reports'] = () => {
  return `<div class="page-header"><h2><i class="ti ti-chart-bar"></i>Reports</h2><p>Generate and export all report types</p></div>
  <div class="grid-2">
    ${[
      {icon:'ti-calendar',label:'Daily Report',sub:'Today\'s collections & sales',fn:'reportDaily'},
      {icon:'ti-calendar-week',label:'Weekly Report',sub:'Last 7 days summary',fn:'reportWeekly'},
      {icon:'ti-calendar-month',label:'Monthly Report',sub:'Full month breakdown',fn:'reportMonthly'},
      {icon:'ti-cow',label:'Seller Statement',sub:'Per-seller totals & dues',fn:'reportSellers'},
      {icon:'ti-users',label:'Customer Bills',sub:'All customer-wise bills',fn:'reportCustomers'},
      {icon:'ti-file-spreadsheet',label:'Export All CSV',sub:'Full data export',fn:'exportAll'},
    ].map(r=>`<div class="card" style="cursor:pointer" onclick="${r.fn}()">
      <div class="flex-center gap-1">
        <i class="ti ${r.icon}" style="font-size:1.8rem;color:var(--green)"></i>
        <div><strong>${r.label}</strong><br><span style="font-size:.8rem;color:var(--gray-400)">${r.sub}</span></div>
        <i class="ti ti-arrow-right" style="margin-left:auto;color:var(--gray-300)"></i>
      </div>
    </div>`).join('')}
  </div>`;
};

// ── Admin: Audit Log ─────────────────────────────────────────
PAGES['admin-audit'] = () => {
  const logs = DB.getAudit();
  return `<div class="page-header"><h2><i class="ti ti-clipboard-list"></i>Audit Log</h2><p>Every edit is recorded with old and new values</p></div>
  <div class="card">
    ${logs.length === 0 ? '<p>No audit entries yet. All edits will appear here automatically.</p>' :
      logs.map(l => `<div class="audit-item">
        <div class="flex-between">
          <div>
            <strong>${l.byName}</strong> edited ${l.type} record
            ${l.changes.map(ch=>`<span style="margin-left:8px"><span class="diff-old">${ch.old}</span> → <span class="diff-new">${ch.new}</span> <span style="font-size:.75rem;color:var(--gray-400)">(${ch.field})</span></span>`).join('')}
          </div>
          <div class="audit-meta">${new Date(l.at).toLocaleString('en-IN')}</div>
        </div>
      </div>`).join('')
    }
  </div>`;
};

// ════════════════════════════════════════════════════════════
//  MIDDLE PERSON PAGES
// ════════════════════════════════════════════════════════════

// ── MP Dashboard ─────────────────────────────────────────────
PAGES['mp-dash'] = () => {
  const colls = DB.getCollections();
  const sales = DB.getSales();
  const totCL = colls.reduce((a,b)=>a+b.liters,0);
  const totCA = colls.reduce((a,b)=>a+b.amount,0);
  const totSL = sales.reduce((a,b)=>a+b.qty,0);
  const totSA = sales.reduce((a,b)=>a+b.amount,0);
  const profit = totSA - totCA;
  const pendColl = colls.filter(c=>!c.paid).reduce((a,b)=>a+b.amount,0);
  const pendSale = sales.filter(s=>!s.paid).reduce((a,b)=>a+b.amount,0);

  const recentColls = colls.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  const recentSales = sales.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);

  return `<div class="page-header"><h2><i class="ti ti-layout-dashboard"></i>Dashboard</h2><p>Your complete operational overview</p></div>
  <div class="metrics-grid">
    <div class="metric-card mc-blue"><div class="mc-label">Milk Collected</div><div class="mc-value">${totCL}L</div><div class="mc-sub">${colls.length} entries</div></div>
    <div class="metric-card mc-green"><div class="mc-label">Milk Sold</div><div class="mc-value">${totSL}L</div><div class="mc-sub">${sales.length} entries</div></div>
    <div class="metric-card mc-amber"><div class="mc-label">Buy Cost</div><div class="mc-value">₹${DB.fmtInt(totCA)}</div></div>
    <div class="metric-card mc-teal"><div class="mc-label">Sale Revenue</div><div class="mc-value">₹${DB.fmtInt(totSA)}</div></div>
    <div class="metric-card ${profit>=0?'mc-green':'mc-red'}"><div class="mc-label">Net Profit</div><div class="mc-value">₹${DB.fmtInt(profit)}</div></div>
    <div class="metric-card mc-red"><div class="mc-label">Pending to Sellers</div><div class="mc-value">₹${DB.fmtInt(pendColl)}</div></div>
  </div>
  <div class="grid-2">
    <div class="card">
      <div class="card-header"><h3><i class="ti ti-droplet"></i>Recent Collections</h3><button class="btn btn-sm btn-secondary" onclick="navigateTo('mp-add-coll')"><i class="ti ti-plus"></i>Add</button></div>
      <div class="table-wrap"><table style="min-width:0">
        <thead><tr><th>Date</th><th>Seller</th><th>Liters</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>${recentColls.map(c=>`<tr><td>${fmtDate(c.date)}</td><td>${DB.userName(c.seller).split(' ')[0]}</td><td>${c.liters}L</td><td>₹${DB.fmtInt(c.amount)}</td><td>${statusBadge(c.paid)}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>
    <div class="card">
      <div class="card-header"><h3><i class="ti ti-shopping-cart"></i>Recent Sales</h3><button class="btn btn-sm btn-secondary" onclick="navigateTo('mp-add-sale')"><i class="ti ti-plus"></i>Add</button></div>
      <div class="table-wrap"><table style="min-width:0">
        <thead><tr><th>Date</th><th>Customer</th><th>Qty</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>${recentSales.map(s=>`<tr><td>${fmtDate(s.date)}</td><td>${DB.userName(s.customer).split(' ')[0]}</td><td>${s.qty}L</td><td>₹${DB.fmtInt(s.amount)}</td><td>${statusBadge(s.paid)}</td></tr>`).join('')}</tbody>
      </table></div>
    </div>
  </div>`;
};

// ── MP: Add Collection ───────────────────────────────────────
PAGES['mp-add-coll'] = () => {
  const sellers = DB.getUsers().filter(u=>u.role==='seller'&&u.active);
  const today = new Date().toISOString().slice(0,10);
  return `<div class="page-header"><h2><i class="ti ti-droplet-plus"></i>Add Collection</h2><p>Record milk bought from a seller</p></div>
  <div class="card" style="max-width:640px">
    <div class="form-row">
      <div class="form-group"><label>Date</label><input type="date" id="cc-date" value="${today}"></div>
      <div class="form-group"><label>Seller</label><select id="cc-seller">${sellers.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Liters</label><input type="number" id="cc-liters" placeholder="e.g. 10" step="0.5" min="0" oninput="calcCollection()"></div>
      <div class="form-group"><label>Fat % <small style="font-weight:400;color:var(--gray-400)">(or click below)</small></label>
        <input type="number" id="cc-fat" placeholder="e.g. 6.5" step="0.1" min="0" max="15" oninput="fatAutoRate('cc-fat','cc-rate')">
      </div>
      <div class="form-group"><label>Rate ₹/L <small style="font-weight:400;color:var(--gray-400)">(auto-filled)</small></label>
        <input type="number" id="cc-rate" placeholder="₹/L" step="0.5" min="0" oninput="calcCollection()">
      </div>
    </div>
    <div class="section-label">Fat rate table — click to select</div>
    ${fatGrid('cc-fat','cc-rate')}
    <div class="form-group mt-1"><label>Payment Status</label>
      <select id="cc-paid"><option value="false">Pending</option><option value="true">Paid</option></select>
    </div>
    <div class="form-group mt-1"><label>Note <small style="font-weight:400;color:var(--gray-400)">(optional — visible to seller)</small></label>
      <textarea id="cc-note" placeholder="e.g. Morning batch, good quality. Festival extra supply..."></textarea>
    </div>
    <div class="calc-result hidden" id="cc-result">
      <div><div class="cr-label">Calculated Amount</div><div class="cr-formula" id="cc-formula"></div></div>
      <div class="cr-amount" id="cc-amt">₹0</div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="saveCollection()"><i class="ti ti-check"></i>Save Collection</button>
      <button class="btn btn-secondary" onclick="resetCollForm()"><i class="ti ti-refresh"></i>Reset</button>
    </div>
  </div>`;
};
window.calcCollection = () => {
  const l = parseFloat(document.getElementById('cc-liters')?.value)||0;
  const r = parseFloat(document.getElementById('cc-rate')?.value)||0;
  const f = parseFloat(document.getElementById('cc-fat')?.value)||0;
  const res = document.getElementById('cc-result');
  if (!res) return;
  if (l>0&&r>0) {
    res.classList.remove('hidden');
    document.getElementById('cc-formula').textContent = `${l}L × ₹${r}/L  (fat ${f}%)`;
    document.getElementById('cc-amt').textContent = `₹${DB.fmt(l*r)}`;
  } else { res.classList.add('hidden'); }
};
window.saveCollection = () => {
  const l = parseFloat(document.getElementById('cc-liters')?.value)||0;
  const r = parseFloat(document.getElementById('cc-rate')?.value)||0;
  const f = parseFloat(document.getElementById('cc-fat')?.value)||0;
  const seller = document.getElementById('cc-seller')?.value;
  const date = document.getElementById('cc-date')?.value;
  const paid = document.getElementById('cc-paid')?.value === 'true';
  const note = document.getElementById('cc-note')?.value||'';
  if (!l||!r||!f||!seller||!date) { toast('Please fill all required fields','error'); return; }
  const rec = { id: DB.nextId('col'), date, seller, liters:l, fat:f, rate:r, amount:parseFloat((l*r).toFixed(2)), paid, paidDate: paid?date:'', note, enteredBy: window._dpSession.id, createdAt: new Date().toISOString() };
  DB.saveCollection(rec);
  toast(`Saved: ${DB.userName(seller)} — ${l}L @ ₹${r}/L = ₹${DB.fmt(l*r)}`);
  resetCollForm();
};
window.resetCollForm = () => {
  ['cc-liters','cc-fat','cc-rate','cc-note'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.querySelectorAll('.fat-cell').forEach(c=>c.classList.remove('selected'));
  document.getElementById('cc-result')?.classList.add('hidden');
};

// ── MP: Add Sale ─────────────────────────────────────────────
PAGES['mp-add-sale'] = () => {
  const customers = DB.getUsers().filter(u=>u.role==='customer'&&u.active);
  const today = new Date().toISOString().slice(0,10);
  return `<div class="page-header"><h2><i class="ti ti-shopping-cart-plus"></i>Add Sale</h2><p>Record milk sold to a customer</p></div>
  <div class="card" style="max-width:560px">
    <div class="form-row">
      <div class="form-group"><label>Date</label><input type="date" id="cs-date" value="${today}"></div>
      <div class="form-group"><label>Customer</label><select id="cs-cust">${customers.map(u=>`<option value="${u.id}">${u.name}</option>`).join('')}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Quantity (Litres)</label>
        <select id="cs-qty-sel" onchange="qtyFromSelect()">
          <option value="0.25">0.25 L</option><option value="0.5">0.5 L</option>
          <option value="1" selected>1 L</option><option value="1.5">1.5 L</option>
          <option value="2">2 L</option><option value="3">3 L</option>
          <option value="4">4 L</option><option value="custom">Custom...</option>
        </select>
      </div>
      <div class="form-group"><label>Or enter qty (L)</label><input type="number" id="cs-qty" value="1" step="0.25" min="0" oninput="calcSale()"></div>
      <div class="form-group"><label>Rate ₹/L</label><input type="number" id="cs-rate" value="60" step="1" min="0" oninput="calcSale()"></div>
    </div>
    <div class="form-group mt-1"><label>Payment Status</label>
      <select id="cs-paid"><option value="false">Pending</option><option value="true">Paid</option></select>
    </div>
    <div class="form-group mt-1"><label>Note <small style="font-weight:400;color:var(--gray-400)">(optional — visible to customer)</small></label>
      <textarea id="cs-note" placeholder="e.g. Extra half litre, holiday delivery, advance payment..."></textarea>
    </div>
    <div class="calc-result hidden" id="cs-result">
      <div><div class="cr-label">Calculated Amount</div><div class="cr-formula" id="cs-formula"></div></div>
      <div class="cr-amount" id="cs-amt">₹0</div>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" onclick="saveSale()"><i class="ti ti-check"></i>Save Sale</button>
      <button class="btn btn-secondary" onclick="resetSaleForm()"><i class="ti ti-refresh"></i>Reset</button>
    </div>
  </div>`;
};
window.qtyFromSelect = () => {
  const sel = document.getElementById('cs-qty-sel').value;
  if (sel !== 'custom') { document.getElementById('cs-qty').value = sel; calcSale(); }
};
window.calcSale = () => {
  const q = parseFloat(document.getElementById('cs-qty')?.value)||0;
  const r = parseFloat(document.getElementById('cs-rate')?.value)||0;
  const res = document.getElementById('cs-result');
  if (!res) return;
  if (q>0&&r>0) {
    res.classList.remove('hidden');
    document.getElementById('cs-formula').textContent = `${q}L × ₹${r}/L`;
    document.getElementById('cs-amt').textContent = `₹${DB.fmt(q*r)}`;
  } else { res.classList.add('hidden'); }
};
window.saveSale = () => {
  const q = parseFloat(document.getElementById('cs-qty')?.value)||0;
  const r = parseFloat(document.getElementById('cs-rate')?.value)||0;
  const cust = document.getElementById('cs-cust')?.value;
  const date = document.getElementById('cs-date')?.value;
  const paid = document.getElementById('cs-paid')?.value === 'true';
  const note = document.getElementById('cs-note')?.value||'';
  if (!q||!r||!cust||!date) { toast('Please fill all required fields','error'); return; }
  const rec = { id: DB.nextId('sal'), date, customer:cust, qty:q, rate:r, amount:parseFloat((q*r).toFixed(2)), paid, paidDate: paid?date:'', note, enteredBy: window._dpSession.id, createdAt: new Date().toISOString() };
  DB.saveSale(rec);
  toast(`Saved: ${DB.userName(cust)} — ${q}L @ ₹${r}/L = ₹${DB.fmt(q*r)}`);
  resetSaleForm();
};
window.resetSaleForm = () => {
  ['cs-note'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('cs-result')?.classList.add('hidden');
};

// ── MP: View Collections ─────────────────────────────────────
PAGES['mp-colls'] = () => {
  const colls = DB.getCollections().slice().sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-table"></i>Collections</h2><p>All milk purchased from sellers</p></div>
    <div class="flex gap-1 no-print">
      <button class="btn btn-sm btn-secondary" onclick="exportCollsCSV()"><i class="ti ti-file-spreadsheet"></i>CSV</button>
      <button class="btn btn-sm btn-secondary" onclick="printColls()"><i class="ti ti-printer"></i>Print</button>
      <button class="btn btn-sm btn-primary" onclick="navigateTo('mp-add-coll')"><i class="ti ti-plus"></i>Add</button>
    </div>
  </div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Seller</th><th>Liters</th><th>Fat %</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th><th class="no-print">Actions</th></tr></thead>
      <tbody>${colls.map(c=>`<tr>
        <td>${fmtDate(c.date)}</td><td>${DB.userName(c.seller)}</td>
        <td>${c.liters}L</td><td>${c.fat}%</td><td>₹${c.rate}/L</td><td><strong>₹${DB.fmtInt(c.amount)}</strong></td>
        <td>${statusBadge(c.paid)}</td><td class="note-cell">${c.note||'—'}</td>
        <td class="no-print">
          <button class="btn btn-xs btn-amber" onclick="openEditColl('${c.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-xs btn-secondary" onclick="toggleCollPaid('${c.id}',${c.paid})" style="margin-left:3px" title="${c.paid?'Mark Pending':'Mark Paid'}">
            <i class="ti ${c.paid?'ti-x':'ti-check'}"></i>
          </button>
        </td>
      </tr>`).join('')}
      <tr class="tfoot-total"><td colspan="2">Total</td><td>${colls.reduce((a,b)=>a+b.liters,0)}L</td><td>—</td><td>—</td><td>₹${DB.fmtInt(colls.reduce((a,b)=>a+b.amount,0))}</td><td colspan="3"></td></tr>
      </tbody>
    </table></div>
  </div>`;
};

// ── MP: View Sales ───────────────────────────────────────────
PAGES['mp-sales'] = () => {
  const sales = DB.getSales().slice().sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-basket"></i>Sales</h2><p>All milk sold to customers</p></div>
    <div class="flex gap-1 no-print">
      <button class="btn btn-sm btn-secondary" onclick="exportSalesCSV()"><i class="ti ti-file-spreadsheet"></i>CSV</button>
      <button class="btn btn-sm btn-secondary" onclick="printSales()"><i class="ti ti-printer"></i>Print</button>
      <button class="btn btn-sm btn-primary" onclick="navigateTo('mp-add-sale')"><i class="ti ti-plus"></i>Add</button>
    </div>
  </div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Customer</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th><th class="no-print">Actions</th></tr></thead>
      <tbody>${sales.map(s=>`<tr>
        <td>${fmtDate(s.date)}</td><td>${DB.userName(s.customer)}</td>
        <td>${s.qty}L</td><td>₹${s.rate}/L</td><td><strong>₹${DB.fmtInt(s.amount)}</strong></td>
        <td>${statusBadge(s.paid)}</td><td class="note-cell">${s.note||'—'}</td>
        <td class="no-print">
          <button class="btn btn-xs btn-amber" onclick="openEditSale('${s.id}')"><i class="ti ti-edit"></i></button>
          <button class="btn btn-xs btn-secondary" onclick="toggleSalePaid('${s.id}',${s.paid})" style="margin-left:3px">
            <i class="ti ${s.paid?'ti-x':'ti-check'}"></i>
          </button>
        </td>
      </tr>`).join('')}
      <tr class="tfoot-total"><td colspan="2">Total</td><td>${sales.reduce((a,b)=>a+b.qty,0)}L</td><td>—</td><td>₹${DB.fmtInt(sales.reduce((a,b)=>a+b.amount,0))}</td><td colspan="3"></td></tr>
      </tbody>
    </table></div>
  </div>`;
};

// ── MP: Seller Overview ───────────────────────────────────────
PAGES['mp-sellers'] = () => {
  const sellers = DB.getUsers().filter(u=>u.role==='seller');
  let html = `<div class="page-header"><h2><i class="ti ti-cow"></i>Seller Overview</h2><p>All sellers and their complete records</p></div>`;
  for (const u of sellers) {
    const coll = DB.getCollectionsBySeller(u.id).slice().sort((a,b)=>b.date.localeCompare(a.date));
    const tot = coll.reduce((a,b)=>a+b.amount,0);
    const paid = coll.filter(c=>c.paid).reduce((a,b)=>a+b.amount,0);
    const totL = coll.reduce((a,b)=>a+b.liters,0);
    html += `<div class="card">
      <div class="card-header">
        <h3><div class="flex-center gap-1"><div class="avatar av-amber">${u.avatar}</div>${u.name}</div></h3>
        <div class="flex-center gap-1" style="font-size:.875rem">
          <span><strong style="color:var(--blue)">${totL}L</strong> collected</span>
          <span style="color:var(--gray-300)">|</span>
          <span><strong style="color:var(--green)">₹${DB.fmtInt(paid)}</strong> paid</span>
          <span style="color:var(--gray-300)">|</span>
          <span><strong style="color:var(--red)">₹${DB.fmtInt(tot-paid)}</strong> pending</span>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Liters</th><th>Fat %</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead>
        <tbody>
          ${coll.map(c=>`<tr><td>${fmtDate(c.date)}</td><td>${c.liters}L</td><td>${c.fat}%</td><td>₹${c.rate}/L</td><td>₹${DB.fmtInt(c.amount)}</td><td>${statusBadge(c.paid)}</td><td class="note-cell">${c.note||'—'}</td></tr>`).join('')}
          <tr class="tfoot-total"><td>Total</td><td>${totL}L</td><td>—</td><td>—</td><td>₹${DB.fmtInt(tot)}</td><td colspan="2"></td></tr>
        </tbody>
      </table></div>
    </div>`;
  }
  return html;
};

// ── MP: Customer Overview ────────────────────────────────────
PAGES['mp-customers'] = () => {
  const customers = DB.getUsers().filter(u=>u.role==='customer');
  let html = `<div class="page-header"><h2><i class="ti ti-user-check"></i>Customer Overview</h2><p>All customers and their purchase records</p></div>`;
  for (const u of customers) {
    const sales = DB.getSalesByCustomer(u.id).slice().sort((a,b)=>b.date.localeCompare(a.date));
    const tot = sales.reduce((a,b)=>a+b.amount,0);
    const paid = sales.filter(s=>s.paid).reduce((a,b)=>a+b.amount,0);
    const totL = sales.reduce((a,b)=>a+b.qty,0);
    html += `<div class="card">
      <div class="card-header">
        <h3><div class="flex-center gap-1"><div class="avatar av-coral">${u.avatar}</div>${u.name}</div></h3>
        <div class="flex-center gap-1" style="font-size:.875rem">
          <span><strong style="color:var(--blue)">${totL}L</strong> purchased</span>
          <span style="color:var(--gray-300)">|</span>
          <span><strong style="color:var(--green)">₹${DB.fmtInt(paid)}</strong> paid</span>
          <span style="color:var(--gray-300)">|</span>
          <span><strong style="color:var(--red)">₹${DB.fmtInt(tot-paid)}</strong> due</span>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead>
        <tbody>
          ${sales.map(s=>`<tr><td>${fmtDate(s.date)}</td><td>${s.qty}L</td><td>₹${s.rate}/L</td><td>₹${DB.fmtInt(s.amount)}</td><td>${statusBadge(s.paid)}</td><td class="note-cell">${s.note||'—'}</td></tr>`).join('')}
          <tr class="tfoot-total"><td>Total</td><td>${totL}L</td><td>—</td><td>₹${DB.fmtInt(tot)}</td><td colspan="2"></td></tr>
        </tbody>
      </table></div>
    </div>`;
  }
  return html;
};

// ── MP: Monthly Summary ───────────────────────────────────────
PAGES['mp-monthly'] = () => {
  const colls = DB.getCollections();
  const sales = DB.getSales();
  const allDates = [...new Set([...colls.map(c=>c.date),...sales.map(s=>s.date)])].sort();
  const byDay = {};
  allDates.forEach(d => { byDay[d] = { collL:0, collA:0, saleL:0, saleA:0 }; });
  colls.forEach(c => { byDay[c.date].collL += c.liters; byDay[c.date].collA += c.amount; });
  sales.forEach(s => { byDay[s.date].saleL += s.qty; byDay[s.date].saleA += s.amount; });

  const totCL = colls.reduce((a,b)=>a+b.liters,0);
  const totCA = colls.reduce((a,b)=>a+b.amount,0);
  const totSL = sales.reduce((a,b)=>a+b.qty,0);
  const totSA = sales.reduce((a,b)=>a+b.amount,0);

  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-calendar-month"></i>Monthly Summary</h2><p>Day-wise profit and loss breakdown</p></div>
    <div class="flex gap-1 no-print">
      <button class="btn btn-sm btn-secondary" onclick="exportMonthlyCSV()"><i class="ti ti-file-spreadsheet"></i>CSV</button>
      <button class="btn btn-sm btn-secondary" onclick="printMonthly()"><i class="ti ti-printer"></i>Print</button>
    </div>
  </div>
  <div class="metrics-grid">
    <div class="metric-card mc-blue"><div class="mc-label">Total Collected</div><div class="mc-value">${totCL}L</div></div>
    <div class="metric-card mc-green"><div class="mc-label">Total Sold</div><div class="mc-value">${totSL}L</div></div>
    <div class="metric-card mc-amber"><div class="mc-label">Buy Cost</div><div class="mc-value">₹${DB.fmtInt(totCA)}</div></div>
    <div class="metric-card mc-teal"><div class="mc-label">Revenue</div><div class="mc-value">₹${DB.fmtInt(totSA)}</div></div>
    <div class="metric-card ${totSA-totCA>=0?'mc-green':'mc-red'}"><div class="mc-label">Net Profit</div><div class="mc-value">₹${DB.fmtInt(totSA-totCA)}</div></div>
  </div>
  <div class="card">
    <div class="card-header"><h3><i class="ti ti-calendar"></i>Day-wise Breakdown</h3></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Collected (L)</th><th>Buy Cost (₹)</th><th>Sold (L)</th><th>Revenue (₹)</th><th>Day Profit (₹)</th></tr></thead>
      <tbody>
        ${allDates.map(d => {
          const r = byDay[d]; const p = r.saleA - r.collA;
          return `<tr><td>${fmtDate(d)}</td><td>${r.collL}</td><td>₹${DB.fmtInt(r.collA)}</td><td>${r.saleL}</td><td>₹${DB.fmtInt(r.saleA)}</td>
          <td style="color:${p>=0?'var(--green)':'var(--red)'};font-weight:600">₹${DB.fmtInt(p)}</td></tr>`;
        }).join('')}
        <tr class="tfoot-total"><td>TOTAL</td><td>${totCL}L</td><td>₹${DB.fmtInt(totCA)}</td><td>${totSL}L</td><td>₹${DB.fmtInt(totSA)}</td>
        <td style="color:${totSA-totCA>=0?'var(--green)':'var(--red)'}">₹${DB.fmtInt(totSA-totCA)}</td></tr>
      </tbody>
    </table></div>
  </div>`;
};

// ════════════════════════════════════════════════════════════
//  SELLER PAGES
// ════════════════════════════════════════════════════════════
PAGES['sel-dash'] = () => {
  const uid = window._dpSession.id;
  const mine = DB.getCollectionsBySeller(uid).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const totL = mine.reduce((a,b)=>a+b.liters,0);
  const totA = mine.reduce((a,b)=>a+b.amount,0);
  const paid = mine.filter(c=>c.paid).reduce((a,b)=>a+b.amount,0);
  const avgFat = mine.length ? (mine.reduce((a,b)=>a+b.fat,0)/mine.length).toFixed(1) : 0;
  return `<div class="page-header"><h2><i class="ti ti-layout-dashboard"></i>My Dashboard</h2><p>Your supply summary</p></div>
  <div class="metrics-grid">
    <div class="metric-card mc-blue"><div class="mc-label">Total Supplied</div><div class="mc-value">${totL}L</div></div>
    <div class="metric-card mc-teal"><div class="mc-label">Avg Fat %</div><div class="mc-value">${avgFat}%</div></div>
    <div class="metric-card mc-amber"><div class="mc-label">Total Earned</div><div class="mc-value">₹${DB.fmtInt(totA)}</div></div>
    <div class="metric-card mc-green"><div class="mc-label">Received</div><div class="mc-value">₹${DB.fmtInt(paid)}</div></div>
    <div class="metric-card mc-red"><div class="mc-label">Pending</div><div class="mc-value">₹${DB.fmtInt(totA-paid)}</div></div>
  </div>
  <div class="card">
    <div class="card-header"><h3><i class="ti ti-clock"></i>Recent Records</h3></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Liters</th><th>Fat %</th><th>Rate ₹/L</th><th>Amount</th><th>Payment</th><th>Note</th></tr></thead>
      <tbody>${mine.slice(0,8).map(c=>`<tr><td>${fmtDate(c.date)}</td><td>${c.liters}L</td><td>${c.fat}%</td><td>₹${c.rate}</td><td>₹${DB.fmtInt(c.amount)}</td><td>${statusBadge(c.paid)}</td><td class="note-cell">${c.note||'—'}</td></tr>`).join('')}</tbody>
    </table></div>
  </div>`;
};

PAGES['sel-supply'] = () => {
  const uid = window._dpSession.id;
  const mine = DB.getCollectionsBySeller(uid).slice().sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-calendar"></i>Day-wise Supply</h2><p>All your daily milk supply records</p></div>
    <button class="btn btn-sm btn-secondary no-print" onclick="printSellerStatement()"><i class="ti ti-printer"></i>Print Statement</button>
  </div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Liters</th><th>Fat %</th><th>Rate ₹/L</th><th>Amount</th><th>Payment</th><th>Note from middleman</th></tr></thead>
      <tbody>
        ${mine.map(c=>`<tr><td>${fmtDate(c.date)}</td><td>${c.liters}L</td><td>${c.fat}%</td><td>₹${c.rate}</td><td>₹${DB.fmtInt(c.amount)}</td><td>${statusBadge(c.paid)}</td><td class="note-cell">${c.note||'—'}</td></tr>`).join('')}
        <tr class="tfoot-total"><td>Total</td><td>${mine.reduce((a,b)=>a+b.liters,0)}L</td><td>—</td><td>—</td><td>₹${DB.fmtInt(mine.reduce((a,b)=>a+b.amount,0))}</td><td colspan="2"></td></tr>
      </tbody>
    </table></div>
  </div>`;
};

PAGES['sel-monthly'] = () => {
  const uid = window._dpSession.id;
  const mine = DB.getCollectionsBySeller(uid).slice().sort((a,b)=>a.date.localeCompare(b.date));
  const totL = mine.reduce((a,b)=>a+b.liters,0);
  const totA = mine.reduce((a,b)=>a+b.amount,0);
  const paid = mine.filter(c=>c.paid).reduce((a,b)=>a+b.amount,0);
  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-calendar-month"></i>Monthly Total</h2><p>Your complete month summary with daily breakdown</p></div>
    <button class="btn btn-sm btn-secondary no-print" onclick="printSellerStatement()"><i class="ti ti-printer"></i>Print</button>
  </div>
  <div class="metrics-grid">
    <div class="metric-card mc-blue"><div class="mc-label">Days Supplied</div><div class="mc-value">${mine.length}</div></div>
    <div class="metric-card mc-teal"><div class="mc-label">Total Litres</div><div class="mc-value">${totL}L</div></div>
    <div class="metric-card mc-amber"><div class="mc-label">Total Earned</div><div class="mc-value">₹${DB.fmtInt(totA)}</div></div>
    <div class="metric-card mc-green"><div class="mc-label">Received</div><div class="mc-value">₹${DB.fmtInt(paid)}</div></div>
    <div class="metric-card mc-red"><div class="mc-label">Pending</div><div class="mc-value">₹${DB.fmtInt(totA-paid)}</div></div>
  </div>
  <div class="card">
    <div class="card-header"><h3><i class="ti ti-table"></i>Day-wise Breakdown</h3></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Liters</th><th>Fat %</th><th>Rate ₹/L</th><th>Amount</th><th>Payment</th><th>Note</th></tr></thead>
      <tbody>
        ${mine.map(c=>`<tr><td>${fmtDate(c.date)}</td><td>${c.liters}L</td><td>${c.fat}%</td><td>₹${c.rate}</td><td>₹${DB.fmtInt(c.amount)}</td><td>${statusBadge(c.paid)}</td><td class="note-cell">${c.note||'—'}</td></tr>`).join('')}
        <tr class="tfoot-total"><td>TOTAL</td><td>${totL}L</td><td>—</td><td>—</td><td>₹${DB.fmtInt(totA)}</td><td colspan="2"></td></tr>
      </tbody>
    </table></div>
  </div>`;
};

PAGES['sel-payments'] = () => {
  const uid = window._dpSession.id;
  const mine = DB.getCollectionsBySeller(uid);
  const paid = mine.filter(c=>c.paid);
  const pending = mine.filter(c=>!c.paid);
  return `<div class="page-header"><h2><i class="ti ti-wallet"></i>My Payments</h2></div>
  <div class="metrics-grid">
    <div class="metric-card mc-green"><div class="mc-label">Total Received</div><div class="mc-value">₹${DB.fmtInt(paid.reduce((a,b)=>a+b.amount,0))}</div></div>
    <div class="metric-card mc-red"><div class="mc-label">Still Pending</div><div class="mc-value">₹${DB.fmtInt(pending.reduce((a,b)=>a+b.amount,0))}</div></div>
  </div>
  <div class="grid-2">
    <div class="card"><div class="card-header"><h3 style="color:var(--green)"><i class="ti ti-check"></i>Paid Records</h3></div>
    <div class="table-wrap"><table><thead><tr><th>Date</th><th>Liters</th><th>Amount</th></tr></thead>
    <tbody>${paid.sort((a,b)=>b.date.localeCompare(a.date)).map(c=>`<tr><td>${fmtDate(c.date)}</td><td>${c.liters}L</td><td>₹${DB.fmtInt(c.amount)}</td></tr>`).join('')}</tbody>
    </table></div></div>
    <div class="card"><div class="card-header"><h3 style="color:var(--amber)"><i class="ti ti-clock"></i>Pending Records</h3></div>
    <div class="table-wrap"><table><thead><tr><th>Date</th><th>Liters</th><th>Amount</th><th>Note</th></tr></thead>
    <tbody>${pending.sort((a,b)=>b.date.localeCompare(a.date)).map(c=>`<tr><td>${fmtDate(c.date)}</td><td>${c.liters}L</td><td>₹${DB.fmtInt(c.amount)}</td><td class="note-cell">${c.note||'—'}</td></tr>`).join('')}</tbody>
    </table></div></div>
  </div>`;
};

// ════════════════════════════════════════════════════════════
//  CUSTOMER PAGES
// ════════════════════════════════════════════════════════════
PAGES['cust-dash'] = () => {
  const uid = window._dpSession.id;
  const mine = DB.getSalesByCustomer(uid).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const totL = mine.reduce((a,b)=>a+b.qty,0);
  const totA = mine.reduce((a,b)=>a+b.amount,0);
  const paid = mine.filter(s=>s.paid).reduce((a,b)=>a+b.amount,0);
  return `<div class="page-header"><h2><i class="ti ti-layout-dashboard"></i>My Dashboard</h2><p>Your purchase summary</p></div>
  <div class="metrics-grid">
    <div class="metric-card mc-blue"><div class="mc-label">Total Purchased</div><div class="mc-value">${totL}L</div></div>
    <div class="metric-card mc-amber"><div class="mc-label">Total Bill</div><div class="mc-value">₹${DB.fmtInt(totA)}</div></div>
    <div class="metric-card mc-green"><div class="mc-label">Amount Paid</div><div class="mc-value">₹${DB.fmtInt(paid)}</div></div>
    <div class="metric-card mc-red"><div class="mc-label">Amount Due</div><div class="mc-value">₹${DB.fmtInt(totA-paid)}</div></div>
  </div>
  <div class="card">
    <div class="card-header"><h3><i class="ti ti-clock"></i>Recent Purchases</h3></div>
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Qty</th><th>Rate ₹/L</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead>
      <tbody>${mine.slice(0,8).map(s=>`<tr><td>${fmtDate(s.date)}</td><td>${s.qty}L</td><td>₹${s.rate}</td><td>₹${DB.fmtInt(s.amount)}</td><td>${statusBadge(s.paid)}</td><td class="note-cell">${s.note||'—'}</td></tr>`).join('')}</tbody>
    </table></div>
  </div>`;
};

PAGES['cust-daywise'] = () => {
  const uid = window._dpSession.id;
  const mine = DB.getSalesByCustomer(uid).slice().sort((a,b)=>b.date.localeCompare(a.date));
  return `<div class="page-header"><h2><i class="ti ti-calendar"></i>Day-wise Purchases</h2><p>Every daily milk delivery record</p></div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Qty</th><th>Rate ₹/L</th><th>Amount</th><th>Status</th><th>Note from middleman</th></tr></thead>
      <tbody>
        ${mine.map(s=>`<tr><td>${fmtDate(s.date)}</td><td>${s.qty}L</td><td>₹${s.rate}</td><td>₹${DB.fmtInt(s.amount)}</td><td>${statusBadge(s.paid)}</td><td class="note-cell">${s.note||'—'}</td></tr>`).join('')}
        <tr class="tfoot-total"><td>Total</td><td>${mine.reduce((a,b)=>a+b.qty,0)}L</td><td>—</td><td>₹${DB.fmtInt(mine.reduce((a,b)=>a+b.amount,0))}</td><td colspan="2"></td></tr>
      </tbody>
    </table></div>
  </div>`;
};

PAGES['cust-monthly'] = () => {
  const uid = window._dpSession.id;
  const mine = DB.getSalesByCustomer(uid).slice().sort((a,b)=>a.date.localeCompare(b.date));
  const totA = mine.reduce((a,b)=>a+b.amount,0);
  const paid = mine.filter(s=>s.paid).reduce((a,b)=>a+b.amount,0);
  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-calendar-month"></i>Monthly Bill</h2><p>Your complete bill with daily breakdown</p></div>
    <div class="flex gap-1 no-print">
      <button class="btn btn-sm btn-secondary" onclick="printCustBill()"><i class="ti ti-printer"></i>Print Bill</button>
    </div>
  </div>
  <div class="metrics-grid">
    <div class="metric-card mc-blue"><div class="mc-label">Days Received</div><div class="mc-value">${mine.length}</div></div>
    <div class="metric-card mc-teal"><div class="mc-label">Total Qty</div><div class="mc-value">${mine.reduce((a,b)=>a+b.qty,0)}L</div></div>
    <div class="metric-card mc-amber"><div class="mc-label">Total Bill</div><div class="mc-value">₹${DB.fmtInt(totA)}</div></div>
    <div class="metric-card mc-green"><div class="mc-label">Paid</div><div class="mc-value">₹${DB.fmtInt(paid)}</div></div>
    <div class="metric-card mc-red"><div class="mc-label">Due</div><div class="mc-value">₹${DB.fmtInt(totA-paid)}</div></div>
  </div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Qty</th><th>Rate ₹/L</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead>
      <tbody>
        ${mine.map(s=>`<tr><td>${fmtDate(s.date)}</td><td>${s.qty}L</td><td>₹${s.rate}</td><td>₹${DB.fmtInt(s.amount)}</td><td>${statusBadge(s.paid)}</td><td class="note-cell">${s.note||'—'}</td></tr>`).join('')}
        <tr class="tfoot-total"><td>TOTAL</td><td>${mine.reduce((a,b)=>a+b.qty,0)}L</td><td>—</td><td>₹${DB.fmtInt(totA)}</td><td colspan="2"></td></tr>
      </tbody>
    </table></div>
  </div>`;
};

PAGES['cust-payments'] = () => {
  const uid = window._dpSession.id;
  const mine = DB.getSalesByCustomer(uid).slice().sort((a,b)=>b.date.localeCompare(a.date));
  const totA = mine.reduce((a,b)=>a+b.amount,0);
  const paidA = mine.filter(s=>s.paid).reduce((a,b)=>a+b.amount,0);
  return `<div class="page-header flex-between">
    <div><h2><i class="ti ti-receipt"></i>Payment History</h2></div>
    <button class="btn btn-sm btn-secondary no-print" onclick="printCustBill()"><i class="ti ti-printer"></i>Print</button>
  </div>
  <div class="metrics-grid">
    <div class="metric-card mc-green"><div class="mc-label">Total Paid</div><div class="mc-value">₹${DB.fmtInt(paidA)}</div></div>
    <div class="metric-card mc-red"><div class="mc-label">Balance Due</div><div class="mc-value">₹${DB.fmtInt(totA-paidA)}</div></div>
  </div>
  <div class="card">
    <div class="table-wrap"><table>
      <thead><tr><th>Date</th><th>Qty</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead>
      <tbody>
        ${mine.map(s=>`<tr><td>${fmtDate(s.date)}</td><td>${s.qty}L</td><td>₹${DB.fmtInt(s.amount)}</td><td>${statusBadge(s.paid)}</td><td class="note-cell">${s.note||'—'}</td></tr>`).join('')}
        <tr class="tfoot-total"><td colspan="2">Total</td><td>₹${DB.fmtInt(totA)}</td><td colspan="2"></td></tr>
      </tbody>
    </table></div>
  </div>`;
};

// ════════════════════════════════════════════════════════════
//  SHARED ACTIONS (edit, delete, toggle, export, print)
// ════════════════════════════════════════════════════════════

window.openEditColl = (id) => {
  const c = DB.getCollectionById(id); if(!c) return;
  showModal(`<div class="modal-header"><h3>Edit Collection</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>
  <div class="form-row">
    <div class="form-group"><label>Liters</label><input type="number" id="ec-liters" value="${c.liters}" step="0.5"></div>
    <div class="form-group"><label>Fat %</label><input type="number" id="ec-fat" value="${c.fat}" step="0.1"></div>
    <div class="form-group"><label>Rate ₹/L</label><input type="number" id="ec-rate" value="${c.rate}" step="0.5"></div>
  </div>
  <div class="form-group mt-1"><label>Payment</label><select id="ec-paid"><option value="false" ${!c.paid?'selected':''}>Pending</option><option value="true" ${c.paid?'selected':''}>Paid</option></select></div>
  <div class="form-group mt-1"><label>Note</label><textarea id="ec-note">${c.note||''}</textarea></div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="doEditColl('${id}')">Save Changes</button></div>`);
};
window.doEditColl = (id) => {
  const c = DB.getCollectionById(id);
  const upd = {...c,
    liters: parseFloat(document.getElementById('ec-liters').value)||c.liters,
    fat:    parseFloat(document.getElementById('ec-fat').value)||c.fat,
    rate:   parseFloat(document.getElementById('ec-rate').value)||c.rate,
    paid:   document.getElementById('ec-paid').value === 'true',
    note:   document.getElementById('ec-note').value,
  };
  upd.amount = parseFloat((upd.liters * upd.rate).toFixed(2));
  DB.saveCollection(upd); closeModal(); toast('Collection updated');
  const cur = document.querySelector('.nav-item.active')?.dataset.page;
  if(cur) navigateTo(cur);
};
window.toggleCollPaid = (id, paid) => {
  const c = DB.getCollectionById(id); c.paid = !paid; DB.saveCollection(c); toast('Payment status updated');
  const cur = document.querySelector('.nav-item.active')?.dataset.page; if(cur) navigateTo(cur);
};
window.deleteColl = (id) => {
  confirmDialog('Delete this collection record permanently?', () => { DB.deleteCollection(id); toast('Deleted'); navigateTo('admin-colls'); });
};

window.openEditSale = (id) => {
  const s = DB.getSaleById(id); if(!s) return;
  showModal(`<div class="modal-header"><h3>Edit Sale</h3><button class="modal-close" onclick="closeModal()">&times;</button></div>
  <div class="form-row">
    <div class="form-group"><label>Qty (L)</label><input type="number" id="es-qty" value="${s.qty}" step="0.25"></div>
    <div class="form-group"><label>Rate ₹/L</label><input type="number" id="es-rate" value="${s.rate}" step="1"></div>
  </div>
  <div class="form-group mt-1"><label>Payment</label><select id="es-paid"><option value="false" ${!s.paid?'selected':''}>Pending</option><option value="true" ${s.paid?'selected':''}>Paid</option></select></div>
  <div class="form-group mt-1"><label>Note</label><textarea id="es-note">${s.note||''}</textarea></div>
  <div class="modal-footer"><button class="btn btn-secondary" onclick="closeModal()">Cancel</button><button class="btn btn-primary" onclick="doEditSale('${id}')">Save Changes</button></div>`);
};
window.doEditSale = (id) => {
  const s = DB.getSaleById(id);
  const upd = {...s,
    qty:  parseFloat(document.getElementById('es-qty').value)||s.qty,
    rate: parseFloat(document.getElementById('es-rate').value)||s.rate,
    paid: document.getElementById('es-paid').value === 'true',
    note: document.getElementById('es-note').value,
  };
  upd.amount = parseFloat((upd.qty * upd.rate).toFixed(2));
  DB.saveSale(upd); closeModal(); toast('Sale updated');
  const cur = document.querySelector('.nav-item.active')?.dataset.page; if(cur) navigateTo(cur);
};
window.toggleSalePaid = (id, paid) => {
  const s = DB.getSaleById(id); s.paid = !paid; DB.saveSale(s); toast('Payment status updated');
  const cur = document.querySelector('.nav-item.active')?.dataset.page; if(cur) navigateTo(cur);
};
window.deleteSale = (id) => {
  confirmDialog('Delete this sale record permanently?', () => { DB.deleteSale(id); toast('Deleted'); navigateTo('admin-sales'); });
};

// ── Export / Print helpers ────────────────────────────────────
window.exportCollsCSV = () => {
  exportCSV('collections.csv',
    ['Date','Seller','Liters','Fat %','Rate','Amount','Paid','Note'],
    DB.getCollections().map(c=>[c.date,DB.userName(c.seller),c.liters,c.fat,c.rate,c.amount,c.paid?'Yes':'No',c.note]));
};
window.exportSalesCSV = () => {
  exportCSV('sales.csv',
    ['Date','Customer','Qty(L)','Rate','Amount','Paid','Note'],
    DB.getSales().map(s=>[s.date,DB.userName(s.customer),s.qty,s.rate,s.amount,s.paid?'Yes':'No',s.note]));
};
window.exportMonthlyCSV = () => {
  const colls = DB.getCollections(); const sales = DB.getSales();
  const allDates = [...new Set([...colls.map(c=>c.date),...sales.map(s=>s.date)])].sort();
  const rows = allDates.map(d => {
    const cL = colls.filter(c=>c.date===d).reduce((a,b)=>a+b.liters,0);
    const cA = colls.filter(c=>c.date===d).reduce((a,b)=>a+b.amount,0);
    const sL = sales.filter(s=>s.date===d).reduce((a,b)=>a+b.qty,0);
    const sA = sales.filter(s=>s.date===d).reduce((a,b)=>a+b.amount,0);
    return [d, cL, cA, sL, sA, sA-cA];
  });
  exportCSV('monthly_summary.csv', ['Date','Collected(L)','Buy Cost','Sold(L)','Revenue','Profit'], rows);
};
window.exportAll = () => { exportCollsCSV(); exportSalesCSV(); toast('All CSV files exported'); };

window.printColls = () => {
  const colls = DB.getCollections().slice().sort((a,b)=>b.date.localeCompare(a.date));
  const tbl = `<table><thead><tr><th>Date</th><th>Seller</th><th>Liters</th><th>Fat %</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead><tbody>
    ${colls.map(c=>`<tr><td>${fmtDate(c.date)}</td><td>${DB.userName(c.seller)}</td><td>${c.liters}L</td><td>${c.fat}%</td><td>₹${c.rate}</td><td>₹${DB.fmtInt(c.amount)}</td><td>${c.paid?'Paid':'Pending'}</td><td>${c.note||''}</td></tr>`).join('')}
    <tr class="total"><td colspan="2">Total</td><td>${colls.reduce((a,b)=>a+b.liters,0)}L</td><td></td><td></td><td>₹${DB.fmtInt(colls.reduce((a,b)=>a+b.amount,0))}</td><td colspan="2"></td></tr>
  </tbody></table>`;
  printTable('Milk Collections Report', tbl);
};
window.printSales = () => {
  const sales = DB.getSales().slice().sort((a,b)=>b.date.localeCompare(a.date));
  const tbl = `<table><thead><tr><th>Date</th><th>Customer</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead><tbody>
    ${sales.map(s=>`<tr><td>${fmtDate(s.date)}</td><td>${DB.userName(s.customer)}</td><td>${s.qty}L</td><td>₹${s.rate}</td><td>₹${DB.fmtInt(s.amount)}</td><td>${s.paid?'Paid':'Pending'}</td><td>${s.note||''}</td></tr>`).join('')}
    <tr class="total"><td colspan="2">Total</td><td>${sales.reduce((a,b)=>a+b.qty,0)}L</td><td></td><td>₹${DB.fmtInt(sales.reduce((a,b)=>a+b.amount,0))}</td><td colspan="2"></td></tr>
  </tbody></table>`;
  printTable('Sales Report', tbl);
};
window.printMonthly = () => {
  const colls = DB.getCollections(); const sales = DB.getSales();
  const allDates = [...new Set([...colls.map(c=>c.date),...sales.map(s=>s.date)])].sort();
  const tbl = `<table><thead><tr><th>Date</th><th>Collected(L)</th><th>Buy Cost</th><th>Sold(L)</th><th>Revenue</th><th>Profit</th></tr></thead><tbody>
    ${allDates.map(d=>{
      const cL=colls.filter(c=>c.date===d).reduce((a,b)=>a+b.liters,0);
      const cA=colls.filter(c=>c.date===d).reduce((a,b)=>a+b.amount,0);
      const sL=sales.filter(s=>s.date===d).reduce((a,b)=>a+b.qty,0);
      const sA=sales.filter(s=>s.date===d).reduce((a,b)=>a+b.amount,0);
      return `<tr><td>${fmtDate(d)}</td><td>${cL}</td><td>₹${DB.fmtInt(cA)}</td><td>${sL}</td><td>₹${DB.fmtInt(sA)}</td><td>₹${DB.fmtInt(sA-cA)}</td></tr>`;
    }).join('')}
  </tbody></table>`;
  printTable('Monthly Summary Report', tbl);
};
window.printSellerStatement = () => {
  const uid = window._dpSession.id;
  const u = DB.getUserById(uid);
  const mine = DB.getCollectionsBySeller(uid).slice().sort((a,b)=>a.date.localeCompare(b.date));
  const totA = mine.reduce((a,b)=>a+b.amount,0);
  const paidA = mine.filter(c=>c.paid).reduce((a,b)=>a+b.amount,0);
  const tbl = `<p>Seller: <strong>${u.name}</strong> | Phone: ${u.phone||'—'}</p>
  <table><thead><tr><th>Date</th><th>Liters</th><th>Fat%</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead><tbody>
    ${mine.map(c=>`<tr><td>${fmtDate(c.date)}</td><td>${c.liters}L</td><td>${c.fat}%</td><td>₹${c.rate}</td><td>₹${DB.fmtInt(c.amount)}</td><td>${c.paid?'Paid':'Pending'}</td><td>${c.note||''}</td></tr>`).join('')}
    <tr class="total"><td>Total</td><td>${mine.reduce((a,b)=>a+b.liters,0)}L</td><td></td><td></td><td>₹${DB.fmtInt(totA)}</td><td>Due: ₹${DB.fmtInt(totA-paidA)}</td><td></td></tr>
  </tbody></table>`;
  printTable(`Seller Statement — ${u.name}`, tbl);
};
window.printCustBill = () => {
  const uid = window._dpSession.id;
  const u = DB.getUserById(uid);
  const mine = DB.getSalesByCustomer(uid).slice().sort((a,b)=>a.date.localeCompare(b.date));
  const totA = mine.reduce((a,b)=>a+b.amount,0);
  const paidA = mine.filter(s=>s.paid).reduce((a,b)=>a+b.amount,0);
  const tbl = `<p>Customer: <strong>${u.name}</strong> | Phone: ${u.phone||'—'}</p>
  <table><thead><tr><th>Date</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead><tbody>
    ${mine.map(s=>`<tr><td>${fmtDate(s.date)}</td><td>${s.qty}L</td><td>₹${s.rate}</td><td>₹${DB.fmtInt(s.amount)}</td><td>${s.paid?'Paid':'Due'}</td><td>${s.note||''}</td></tr>`).join('')}
    <tr class="total"><td>Total</td><td>${mine.reduce((a,b)=>a+b.qty,0)}L</td><td></td><td>₹${DB.fmtInt(totA)}</td><td>Due: ₹${DB.fmtInt(totA-paidA)}</td><td></td></tr>
  </tbody></table>`;
  printTable(`Customer Bill — ${u.name}`, tbl);
};

// Report generators
window.reportDaily = () => { toast('Daily report: see Collections & Sales pages filtered by today'); };
window.reportWeekly = () => { printMonthly(); };
window.reportMonthly = () => { printMonthly(); };
window.reportSellers = () => {
  const sellers = DB.getUsers().filter(u=>u.role==='seller');
  const tbl = `<table><thead><tr><th>Seller</th><th>Total Liters</th><th>Total Amount</th><th>Paid</th><th>Pending</th></tr></thead><tbody>
    ${sellers.map(u=>{ const uc=DB.getCollectionsBySeller(u.id); const tot=uc.reduce((a,b)=>a+b.amount,0); const paid=uc.filter(c=>c.paid).reduce((a,b)=>a+b.amount,0);
    return `<tr><td>${u.name}</td><td>${uc.reduce((a,b)=>a+b.liters,0)}L</td><td>₹${DB.fmtInt(tot)}</td><td>₹${DB.fmtInt(paid)}</td><td>₹${DB.fmtInt(tot-paid)}</td></tr>`;}).join('')}
  </tbody></table>`;
  printTable('Seller-wise Statement', tbl);
};
window.reportCustomers = () => {
  const custs = DB.getUsers().filter(u=>u.role==='customer');
  const tbl = `<table><thead><tr><th>Customer</th><th>Total Qty</th><th>Total Bill</th><th>Paid</th><th>Due</th></tr></thead><tbody>
    ${custs.map(u=>{ const us=DB.getSalesByCustomer(u.id); const tot=us.reduce((a,b)=>a+b.amount,0); const paid=us.filter(s=>s.paid).reduce((a,b)=>a+b.amount,0);
    return `<tr><td>${u.name}</td><td>${us.reduce((a,b)=>a+b.qty,0)}L</td><td>₹${DB.fmtInt(tot)}</td><td>₹${DB.fmtInt(paid)}</td><td>₹${DB.fmtInt(tot-paid)}</td></tr>`;}).join('')}
  </tbody></table>`;
  printTable('Customer-wise Bills', tbl);
};
