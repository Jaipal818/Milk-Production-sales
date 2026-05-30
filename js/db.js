// ============================================================
//  Dairy Pro — Database & State (localStorage-backed)
// ============================================================

const DB = (() => {
  const KEYS = { users: 'dp_users', collections: 'dp_collections', sales: 'dp_sales', audit: 'dp_audit', rates: 'dp_rates' };

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
  }
  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // ── Seed default data on first run ──────────────────────────
  function seed() {
    if (load(KEYS.users)) return;

    const users = [
      { id: 'admin1', name: 'Admin', role: 'admin',    pass: 'admin123', phone: '', avatar: 'AD', active: true },
      { id: 'mp1',    name: 'Ramesh',role: 'middle',   pass: 'ramesh123',phone: '9876543210', avatar: 'RM', active: true },
      { id: 's2',     name: 'Suresh Reddy',role: 'seller',  pass: 'suresh123',phone: '9222222222', avatar: 'SR', active: true },
      { id: 's3',     name: 'Lakshmi Devi',role: 'seller',  pass: 'lakshmi123',phone:'9333333333', avatar: 'LD', active: true },
      { id: 'c1',     name: 'Anand Rao',   role: 'customer',pass: 'anand123',  phone: '9444444444', avatar: 'AR', active: true },
      { id: 'c2',     name: 'Priya Sharma',role: 'customer',pass: 'priya123',  phone: '9555555555', avatar: 'PS', active: true },
      { id: 'c3',     name: 'Vijay Singh', role: 'customer',pass: 'vijay123',  phone: '9666666666', avatar: 'VS', active: true },
    ];

    const collections = [
      { id: 'col1', date:'2026-05-01', seller:'s1', liters:12, fat:6.5, rate:45, amount:540,  paid:true,  paidDate:'2026-05-05', note:'Morning batch, good quality', enteredBy:'mp1', createdAt:'2026-05-01T08:00:00' },
      { id: 'col2', date:'2026-05-01', seller:'s2', liters:8,  fat:5.0, rate:36, amount:288,  paid:false, paidDate:'', note:'', enteredBy:'mp1', createdAt:'2026-05-01T08:30:00' },
      { id: 'col3', date:'2026-05-02', seller:'s1', liters:10, fat:6.0, rate:40, amount:400,  paid:true,  paidDate:'2026-05-05', note:'', enteredBy:'mp1', createdAt:'2026-05-02T08:00:00' },
      { id: 'col4', date:'2026-05-02', seller:'s3', liters:15, fat:7.0, rate:48, amount:720,  paid:false, paidDate:'', note:'Festival extra supply', enteredBy:'mp1', createdAt:'2026-05-02T08:15:00' },
      { id: 'col5', date:'2026-05-03', seller:'s2', liters:9,  fat:5.5, rate:38, amount:342,  paid:true,  paidDate:'2026-05-06', note:'', enteredBy:'mp1', createdAt:'2026-05-03T08:00:00' },
      { id: 'col6', date:'2026-05-03', seller:'s1', liters:11, fat:6.5, rate:45, amount:495,  paid:true,  paidDate:'2026-05-06', note:'', enteredBy:'mp1', createdAt:'2026-05-03T08:10:00' },
      { id: 'col7', date:'2026-05-04', seller:'s3', liters:14, fat:7.5, rate:52, amount:728,  paid:false, paidDate:'', note:'High fat day', enteredBy:'mp1', createdAt:'2026-05-04T08:00:00' },
      { id: 'col8', date:'2026-05-04', seller:'s2', liters:7,  fat:5.0, rate:36, amount:252,  paid:true,  paidDate:'2026-05-07', note:'', enteredBy:'mp1', createdAt:'2026-05-04T08:20:00' },
      { id: 'col9', date:'2026-05-05', seller:'s1', liters:13, fat:6.5, rate:45, amount:585,  paid:false, paidDate:'', note:'', enteredBy:'mp1', createdAt:'2026-05-05T08:00:00' },
      { id:'col10', date:'2026-05-05', seller:'s3', liters:16, fat:7.0, rate:48, amount:768,  paid:false, paidDate:'', note:'Cows grazed well', enteredBy:'mp1', createdAt:'2026-05-05T08:10:00' },
    ];

    const sales = [
      { id: 'sal1', date:'2026-05-01', customer:'c1', qty:2,   rate:60, amount:120, paid:true,  paidDate:'2026-05-05', note:'Regular delivery', enteredBy:'mp1', createdAt:'2026-05-01T09:00:00' },
      { id: 'sal2', date:'2026-05-01', customer:'c2', qty:1,   rate:60, amount:60,  paid:false, paidDate:'', note:'', enteredBy:'mp1', createdAt:'2026-05-01T09:05:00' },
      { id: 'sal3', date:'2026-05-02', customer:'c1', qty:2,   rate:60, amount:120, paid:true,  paidDate:'2026-05-05', note:'', enteredBy:'mp1', createdAt:'2026-05-02T09:00:00' },
      { id: 'sal4', date:'2026-05-02', customer:'c3', qty:0.5, rate:60, amount:30,  paid:true,  paidDate:'2026-05-02', note:'Half litre only', enteredBy:'mp1', createdAt:'2026-05-02T09:10:00' },
      { id: 'sal5', date:'2026-05-03', customer:'c1', qty:2,   rate:60, amount:120, paid:true,  paidDate:'2026-05-06', note:'', enteredBy:'mp1', createdAt:'2026-05-03T09:00:00' },
      { id: 'sal6', date:'2026-05-03', customer:'c2', qty:1.5, rate:60, amount:90,  paid:false, paidDate:'', note:'', enteredBy:'mp1', createdAt:'2026-05-03T09:05:00' },
      { id: 'sal7', date:'2026-05-04', customer:'c3', qty:1,   rate:60, amount:60,  paid:true,  paidDate:'2026-05-04', note:'', enteredBy:'mp1', createdAt:'2026-05-04T09:00:00' },
      { id: 'sal8', date:'2026-05-04', customer:'c1', qty:2,   rate:60, amount:120, paid:true,  paidDate:'2026-05-07', note:'', enteredBy:'mp1', createdAt:'2026-05-04T09:05:00' },
      { id: 'sal9', date:'2026-05-05', customer:'c2', qty:1,   rate:60, amount:60,  paid:false, paidDate:'', note:'New month advance', enteredBy:'mp1', createdAt:'2026-05-05T09:00:00' },
      { id:'sal10', date:'2026-05-05', customer:'c1', qty:2,   rate:60, amount:120, paid:false, paidDate:'', note:'', enteredBy:'mp1', createdAt:'2026-05-05T09:05:00' },
    ];

    const rates = {
      3.0:28, 3.5:30, 4.0:32, 4.5:34, 5.0:36, 5.5:38,
      6.0:40, 6.5:45, 7.0:48, 7.5:52, 8.0:56, 8.5:60
    };

    save(KEYS.users, users);
    save(KEYS.collections, collections);
    save(KEYS.sales, sales);
    save(KEYS.audit, []);
    save(KEYS.rates, rates);
  }

  // ── Public API ───────────────────────────────────────────────
  return {
    init() { seed(); },

    // Users
    getUsers()          { return load(KEYS.users) || []; },
    getUserById(id)     { return this.getUsers().find(u => u.id === id); },
    getUserByName(name) { return this.getUsers().find(u => u.name === name); },
    authenticate(name, pass) {
      return this.getUsers().find(u => u.name.toLowerCase() === name.toLowerCase() && u.pass === pass && u.active);
    },
    saveUser(user) {
      const users = this.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) users[idx] = user; else users.push(user);
      save(KEYS.users, users);
    },
    deleteUser(id) {
      save(KEYS.users, this.getUsers().filter(u => u.id !== id));
    },
    userName(id) { const u = this.getUserById(id); return u ? u.name : 'Unknown'; },

    // Collections
    getCollections()     { return load(KEYS.collections) || []; },
    getCollectionById(id){ return this.getCollections().find(c => c.id === id); },
    getCollectionsBySeller(sid) { return this.getCollections().filter(c => c.seller === sid); },
    saveCollection(rec) {
      const list = this.getCollections();
      const idx = list.findIndex(c => c.id === rec.id);
      if (idx >= 0) {
        this.logAudit('collection', rec.id, list[idx], rec);
        list[idx] = rec;
      } else {
        list.push(rec);
      }
      save(KEYS.collections, list);
    },
    deleteCollection(id) {
      save(KEYS.collections, this.getCollections().filter(c => c.id !== id));
    },

    // Sales
    getSales()           { return load(KEYS.sales) || []; },
    getSaleById(id)      { return this.getSales().find(s => s.id === id); },
    getSalesByCustomer(cid){ return this.getSales().filter(s => s.customer === cid); },
    saveSale(rec) {
      const list = this.getSales();
      const idx = list.findIndex(s => s.id === rec.id);
      if (idx >= 0) {
        this.logAudit('sale', rec.id, list[idx], rec);
        list[idx] = rec;
      } else {
        list.push(rec);
      }
      save(KEYS.sales, list);
    },
    deleteSale(id) {
      save(KEYS.sales, this.getSales().filter(s => s.id !== id));
    },

    // Rates
    getRates() { return load(KEYS.rates) || {}; },
    saveRates(rates) { save(KEYS.rates, rates); },
    getRateForFat(fat) {
      const rates = this.getRates();
      const keys = Object.keys(rates).map(Number).sort((a,b) => a-b);
      let best = keys[0];
      for (const k of keys) { if (k <= fat) best = k; }
      return rates[best] || 0;
    },

    // Audit log
    getAudit()  { return load(KEYS.audit) || []; },
    logAudit(type, recordId, oldVal, newVal) {
      const session = window._dpSession;
      const log = this.getAudit();
      const changes = [];
      const fields = ['liters','fat','rate','amount','paid','note','qty','seller','customer','date'];
      for (const f of fields) {
        if (oldVal[f] !== newVal[f]) {
          changes.push({ field: f, old: oldVal[f], new: newVal[f] });
        }
      }
      if (changes.length === 0) return;
      log.unshift({
        id: 'aud_' + Date.now(),
        type, recordId,
        changes,
        by: session ? session.id : 'unknown',
        byName: session ? session.name : 'Unknown',
        at: new Date().toISOString()
      });
      save(KEYS.audit, log.slice(0, 500));
    },

    // Helpers
    nextId(prefix) { return prefix + '_' + Date.now(); },
    fmt(n) { return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    fmtInt(n) { return Number(n).toLocaleString('en-IN'); },
  };
})();
