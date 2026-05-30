# 🥛 Dairy Pro — Milk Management System

A complete multi-role milk collection & sales management web app.
No backend or database required — runs entirely in the browser using localStorage.

---

## 📁 Project Structure

```
dairy-pro/
├── index.html          ← Main entry point (open this)
├── css/
│   └── style.css       ← All styles
├── js/
│   ├── db.js           ← LocalStorage database layer
│   ├── app.js          ← Auth, routing, UI helpers
│   └── pages.js        ← All page renderers
└── README.md
```

---

## 🚀 How to Run in VS Code

### Method 1 — Live Server (Recommended, takes 30 seconds)

1. Open **VS Code**
2. Open the `dairy-pro` folder:
   - `File → Open Folder → select dairy-pro`
3. Install the **Live Server** extension:
   - Click the Extensions icon on the left sidebar (or press `Ctrl+Shift+X`)
   - Search for **Live Server** by *Ritwick Dey*
   - Click **Install**
4. Open `index.html` in the editor
5. Click **"Go Live"** in the bottom-right status bar
   - OR right-click `index.html` → **"Open with Live Server"**
6. Browser opens at `http://127.0.0.1:5500`  

> **Why Live Server?** Opening index.html directly as a file (`file://`) may
> block font loading. Live Server serves it properly over http://localhost.

---

### Method 2 — Python (No extensions needed)

If you have Python installed, open a terminal in VS Code (`Ctrl+`` `) and run:

**Python 3:**
```bash
cd dairy-pro
python -m http.server 8000
```
Then open: `http://localhost:8000`

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

---

### Method 3 — Node.js serve

If you have Node.js installed:
```bash
npx serve dairy-pro
```
Then open the URL shown in the terminal.

---

## 🔐 Login Accounts

| Role          | Username      | Password    |
|---------------|---------------|-------------|
| Admin         | Admin         | admin123    |
| Middle Person | Ramesh        | ramesh123   |
| Seller        | Ravi Kumar    | ravi123     |
| Seller        | Suresh Reddy  | suresh123   |
| Seller        | Lakshmi Devi  | lakshmi123  |
| Customer      | Anand Rao     | anand123    |
| Customer      | Priya Sharma  | priya123    |
| Customer      | Vijay Singh   | vijay123    |

> All passwords can be changed by Admin from the Manage Users page.

---

## ✨ Features

### Admin
- Full dashboard with profit/loss overview
- Add/edit/deactivate users (sellers, customers, middle persons)
- Edit fat % → rate table
- View all collections and sales
- Reports: Seller statements, Customer bills, CSV export, Print
- Full audit log of all edits

### Middle Person
- Add daily milk collections (buy from sellers)
  - Fat % click-to-select grid → rate auto-fills → amount auto-calculates
  - Note column for each entry (visible to seller)
- Add daily sales (sell to customers)
  - Quantity presets (0.25L, 0.5L, 1L, 2L...) + custom
  - Note column (visible to customer)
- Edit any record (all changes logged in audit trail)
- Mark payments as paid/pending
- View seller overview — all sellers' records in one place
- View customer overview — all customers' records in one place
- Monthly summary — day-wise profit/loss table with column totals
- CSV export and print for all views

### Seller (separate login per seller)
- Sees ONLY their own data
- Day-wise supply records with fat %, rate, amount
- Notes entered by middleman visible here
- Monthly total with running totals
- Payment status (paid / pending breakdown)
- Print seller statement

### Customer (separate login per customer)
- Sees ONLY their own purchases
- Day-wise purchase records with qty, rate, amount
- Notes from middleman visible
- Monthly bill with totals
- Payment history
- Print bill

---

## 💾 Data Storage

All data is saved in **localStorage** in your browser.
- Data persists between sessions (closing and reopening the browser)
- Data is per-browser (not shared across devices)
- To reset all data: open browser console → type `localStorage.clear()` → refresh

---

## 📱 Mobile Support

The app is responsive and works on mobile browsers.
The sidebar collapses on small screens (hamburger menu appears).

---

## 🖨️ Print / Export

- Every table has a **Print** button → opens a clean print-ready window
- CSV export available for collections, sales, and monthly summary
- Seller statements and customer bills are printable from their respective pages

---

## 🔧 Customising

### Change default fat rates
- Login as Admin → Rate Settings → edit any fat % rate → Save

### Add new users
- Login as Admin → Manage Users → Add User

### Change passwords
- Login as Admin → Manage Users → Edit (any user) → enter new password

### Add more fat % levels
- Login as Admin → Rate Settings → Add Fat Level

---

## 🌐 Deploy Online (Optional)

To make this accessible from any device on your network:
1. Find your computer's local IP: run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Start the server: `python -m http.server 8000`
3. Access from any phone/tablet on the same WiFi: `http://YOUR_IP:8000`

For permanent hosting, upload the entire `dairy-pro` folder to:
- **Netlify** (free): drag-and-drop the folder at netlify.com/drop
- **GitHub Pages** (free): push to a GitHub repo and enable Pages
- **Vercel** (free): `npx vercel` in the folder

---

## ⚠️ Notes

- This app uses **localStorage** (browser storage). It is suitable for a single
  device or small team on the same computer. For multi-device real-time sync,
  a backend (Node.js + SQLite or Firebase) would be needed.
- All calculations are done client-side. No data leaves your device.
