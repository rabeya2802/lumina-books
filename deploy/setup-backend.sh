#!/usr/bin/env bash
# =============================================================================
# Lumina Books — Backend setup for GCP VM (Debian 13)
# Run ON THE VM as the sudo-capable user.
#   Usage:  bash deploy/setup-backend.sh
# =============================================================================
set -euo pipefail

# --- Config (EDIT THESE BEFORE RUNNING) --------------------------------------
DB_NAME="online_book_store"
DB_USER="lumina"
DB_PASS="CHANGE_ME_TO_A_STRONG_PASSWORD"          # <-- change me
JWT_SECRET="$(openssl rand -hex 32)"               # auto-generated
PORT="5000"
APP_DIR="/opt/lumina-books"
CORS_ORIGIN="https://lumina-books-rabeya.vercel.app"   # <-- set after first Vercel deploy

# Email (set these to your real Gmail + App Password before going live)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"
EMAIL_FROM="your@gmail.com"

echo "======================================================"
echo "  Lumina Books — Backend Setup (Debian 13)"
echo "  DB: $DB_NAME | User: $DB_USER | Port: $PORT"
echo "======================================================"

# --- 1. System packages -------------------------------------------------------
echo ">> [1/7] Installing Node.js 20, MariaDB, Git, Nginx, PM2..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
fi
sudo apt-get update -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
  nodejs mariadb-server git nginx ufw curl ca-certificates
sudo npm install -g pm2

# --- 2. Start + enable MariaDB ------------------------------------------------
echo ">> [2/7] Starting MariaDB..."
sudo systemctl enable --now mariadb

# --- 3. Create database + user ------------------------------------------------
echo ">> [3/7] Creating database '$DB_NAME' and user '$DB_USER'..."
sudo mariadb <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
SQL
echo "   DB ready."

# --- 4. Fetch code ------------------------------------------------------------
echo ">> [4/7] Cloning repo to $APP_DIR..."
if [ -d "$APP_DIR/.git" ]; then
  echo "   Already exists — pulling latest."
  cd "$APP_DIR" && sudo git pull
else
  sudo git clone https://github.com/rabeya2802/lumina-books.git "$APP_DIR"
fi
sudo chown -R "$USER":"$USER" "$APP_DIR"

# --- 5. Install backend deps + import schema ----------------------------------
echo ">> [5/7] Installing backend dependencies + importing schema..."
cd "$APP_DIR/backend"
npm ci --omit=dev

if [ -f "schema.sql" ]; then
  sudo mariadb "$DB_NAME" < schema.sql && echo "   Schema imported."
else
  echo "   WARNING: schema.sql not found, skipping import."
fi

# --- 6. Write .env ------------------------------------------------------------
echo ">> [6/7] Writing backend/.env..."
cat > "$APP_DIR/backend/.env" <<ENV
PORT=$PORT
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
DB_NAME=$DB_NAME
JWT_SECRET=$JWT_SECRET
EMAIL_HOST=$EMAIL_HOST
EMAIL_PORT=$EMAIL_PORT
EMAIL_USER=$EMAIL_USER
EMAIL_PASSWORD=$EMAIL_PASSWORD
EMAIL_FROM=$EMAIL_FROM
CORS_ORIGIN=$CORS_ORIGIN
NODE_ENV=production
ENV
echo "   .env written (JWT auto-generated)."

# --- 7. PM2 + Nginx -----------------------------------------------------------
echo ">> [7/7] Starting PM2 + configuring Nginx reverse proxy..."
pm2 delete lumina-api 2>/dev/null || true
pm2 start "$APP_DIR/backend/src/server.js" --name lumina-api
pm2 save

# Nginx reverse proxy (port 80 -> 5000)
NGINX_CONF="/etc/nginx/sites-available/lumina"
sudo tee "$NGINX_CONF" > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/lumina
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Persist PM2 across reboots
pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null | grep -q "pm2 save" || true

echo ""
echo "======================================================"
echo "  ✅ DONE. Health check:"
echo "     curl http://localhost:5000/api/health"
echo "     curl http://localhost/api/health   (via nginx)"
echo ""
echo "  External (open firewall port 80 + 5000 in GCP!):"
echo "     curl http://34.87.35.30:5000/api/health"
echo "     curl http://34.87.35.30/api/health"
echo ""
echo "  Next: edit $APP_DIR/backend/.env to set real EMAIL_*"
echo "        then: pm2 restart lumina-api"
echo "======================================================"