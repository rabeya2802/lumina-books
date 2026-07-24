# 🚀 Deployment Guide — Lumina Books

**Architecture**
- **Frontend** → Vercel (React + Vite SPA)
- **Backend** → GCP VM (Node.js + Express)
- **Database** → GCP VM (MariaDB on the same machine)

```
Browser ──HTTPS──> Vercel (frontend) ──HTTP──> 34.87.35.30 (Express + MariaDB)
```

---

## 🔌 Connecting to your VM (SSH)

You do **NOT** need to set up SSH keys manually — GCP gives you a built-in browser terminal. Pick one of:

### Option 1 — Browser SSH (easiest, no setup) ✅ Recommended
1. GCP Console → **Compute Engine → VM Instances**
2. Find `lumina-books-rabeya`
3. Click the **SSH** button (or `Connect` → `Open in browser window`)
4. A terminal opens directly in your VM — run your commands there.

### Option 2 — `gcloud` CLI (from your laptop)
```bash
# One-time: brew install --cask google-cloud-sdk && gcloud auth login
gcloud compute ssh lumina-books-rabeya --zone=asia-southeast1-c
```

### Option 3 — Plain `ssh` (needs keys added to GCP metadata)
```bash
ssh abdurrahmanrussel77@34.87.35.30
```

> For this project, **use Option 1** — zero local setup.

---

## ⭐ TL;DR — Your VM quick start

Your VM is already created:
- **Name:** `lumina-books-rabeya` · **Zone:** `asia-southeast1-c` · **OS:** Debian 13

**3 things to do, in order:**

1. **Push code to GitHub** (from your laptop):
   ```bash
   git remote set-url origin https://github.com/rabeya2802/lumina-books.git
   git add . && git commit -m "Production-ready" && git push -u origin main
   ```

2. **Open GCP firewall** for ports **80** and **5000** (see B2 below).

3. **On the VM (SSH in, then):**
   ```bash
   sudo apt update && sudo apt install -y git
   git clone https://github.com/rabeya2802/lumina-books.git
   cd lumina-books
   # EDIT deploy/setup-backend.sh: set DB_PASS, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM
   nano deploy/setup-backend.sh
   bash deploy/setup-backend.sh
   ```

4. **Deploy frontend on Vercel** with env var `VITE_API_URL=http://34.87.35.30` → then
   set `CORS_ORIGIN` in `/opt/lumina-books/backend/.env` to your Vercel URL and `pm2 restart lumina-api`.

---

## 0. What was fixed in this repo for production

| Change | Why |
|---|---|
| Created `frontend/src/services/api.js` | Central axios instance with `baseURL` from `VITE_API_URL` + auto JWT header |
| Replaced hardcoded `http://localhost:5001` in 13 files | Those URLs would break in production |
| Added `frontend/vercel.json` | SPA routing fallback so `/books/:id` works on refresh |
| Added root `.gitignore` | Prevents `.env` secrets from being committed |
| Added `CORS_ORIGIN` support in backend | Locks down your API to your Vercel domain |
| Added `frontend/.env.example` | Documents `VITE_API_URL` |

✅ Frontend `npm run build` passes.

---

## PART A — Deploy the FRONTEND to Vercel

### A1. Push code to GitHub
Your repo is `https://github.com/rabeya2802/lumina-books` (currently local remote points to `luminous-logic`; fix it if needed):
```bash
git remote set-url origin https://github.com/rabeya2802/lumina-books.git
git add .
git commit -m "Production-ready: API client, CORS, Vercel config"
git push -u origin main   # or master
```

### A2. Import into Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repo `rabeya2802/lumina-books`.
3. Vercel auto-detects Vite. Set:
   - **Root Directory** → `frontend`
   - **Build Command** → `npm run build`
   - **Output Directory** → `dist`
   - **Install Command** → `npm install`
4. **Environment Variables** → add:
   | Name | Value (example) |
   |---|---|
   | `VITE_API_URL` | `http://YOUR_GCP_VM_IP:5000` (use the VM IP from Part B) |
5. Click **Deploy**. You'll get a URL like `https://lumina-books.vercel.app`.
6. After backend is live, update `VITE_API_URL` to your backend (or custom domain) and **Redeploy**.

> ⚠️ Because `VITE_` vars are baked into the build, you must **redeploy** whenever you change `VITE_API_URL`.

---

## PART B — Deploy BACKEND + MySQL on a GCP VM

### B1. Create the VM
1. GCP Console → **Compute Engine → VM Instances → Create**.
2. Recommended settings:
   - **Name**: `lumina-backend`
   - **Machine**: `e2-medium` (2 vCPU / 4 GB) — fine for MySQL + Node
   - **Boot disk**: **Debian 12** or **Ubuntu 22.04**, 30 GB SSD
   - **Allow HTTP/HTTPS traffic** ✅ (we'll configure ports below)
   - **Firewall → Networking**: add a tag like `api-server`
3. Reserve a **Static External IP** (VM details → Network interfaces → External IP → **Reserve**). Note this IP — it's your `VITE_API_URL` host.

### B2. Open firewall ports
GCP → **VPC network → Firewall → Create**:
- Name: `allow-api-5000`
- Targets: `api-server` (the tag you set on the VM)
- Source IPv4 ranges: `0.0.0.0/0`
- Protocols/ports: **tcp:5000** (and **22** for SSH, usually already open)

> For production with HTTPS, also open **80** and **443** if you'll use a domain + Nginx/Caddy.

### B3. SSH into the VM and install stack
```bash
# Update + Node 20 + MySQL 8
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs mysql-server git

# Secure MySQL
sudo mysql_secure_installation
```

### B4. Create the database & user
```bash
sudo mysql
```
```sql
CREATE DATABASE online_book_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lumina'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON online_book_store.* TO 'lumina'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Import your schema:
```bash
sudo mysql online_book_store < backend/schema.sql
```

### B5. Deploy the backend code
```bash
cd /opt
sudo git clone https://github.com/rabeya2802/lumina-books.git
sudo chown -R $USER:$USER lumina-books
cd lumina-books/backend
npm ci --omit=dev
```

Create `/opt/lumina-books/backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=lumina
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DB_NAME=online_book_store
JWT_SECRET=generate_a_long_random_string
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=your@gmail.com
CORS_ORIGIN=https://lumina-books.vercel.app
NODE_ENV=production
```
Generate a JWT secret: `openssl rand -hex 32`

### B6. Run it forever with PM2
```bash
sudo npm i -g pm2
cd /opt/lumina-books/backend
pm2 start src/server.js --name lumina-api
pm2 save
pm2 startup    # follow the printed command to start on boot
```

Test: `curl http://localhost:5000/api/health` → `{"status":"ok",...}`

### B7. (Strongly recommended) HTTPS with Nginx + Let's Encrypt
Without HTTPS, browsers may block API calls from your HTTPS Vercel site. Use Nginx as a reverse proxy:

```bash
sudo apt install -y nginx
```
Create `/etc/nginx/sites-available/lumina`:
```nginx
server {
    server_name api.yourdomain.com;   # point a domain A-record to the VM IP

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/lumina /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```
Then in Vercel set `VITE_API_URL=https://api.yourdomain.com` and redeploy.

> No domain yet? Temporarily use `http://VM_IP:5000` as `VITE_API_URL`. It works, but HTTPS to HTTP mixed-content can be blocked by some browsers — use HTTPS for real users.

---

## PART C — Connecting everything (final checklist)

1. ✅ Backend running on GCP VM (PM2 keeps it up).
2. ✅ MySQL imported + `.env` set on the VM.
3. ✅ Firewall port 5000 open (or 443 via Nginx).
4. ✅ On Vercel: `VITE_API_URL` = backend URL → **Redeploy**.
5. ✅ On VM `.env`: `CORS_ORIGIN` = Vercel frontend URL → `pm2 restart lumina-api`.
6. ✅ Open the Vercel site, register, and check that `/api/auth/register` succeeds in the browser DevTools Network tab.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Frontend loads but API calls fail | `VITE_API_URL` missing or build not redeployed |
| `CORS error` in console | Backend `CORS_ORIGIN` not set / not matching the Vercel URL |
| `502 Bad Gateway` (Nginx) | Backend down — `pm2 status`, `pm2 logs lumina-api` |
| `ECONNREFUSED` to MySQL | MySQL service stopped — `sudo systemctl status mysql` |
| Mixed content blocked | Frontend is HTTPS but backend is HTTP — add HTTPS to backend |
| Signup email not sent | `EMAIL_PASSWORD` must be a Gmail **App Password**, not your login password |

---

## Quick commands cheat sheet
```bash
# On GCP VM — check backend
pm2 logs lumina-api --lines 50
pm2 restart lumina-api

# Update backend after a git push
cd /opt/lumina-books && git pull && cd backend && npm ci --omit=dev && pm2 restart lumina-api

# MySQL
sudo mysql -u lumina -p online_book_store

# Redeploy frontend
# Vercel dashboard → Project → Redeploy (after changing VITE_API_URL)
```
