#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/naksharix}"
DOMAIN="${DOMAIN:-naksharix.com}"

mkdir -p "$APP_DIR/logs"
mkdir -p logs

npm install
npm run db:generate
npm run build
npm run db:deploy

sudo cp nginx/naksharix.http-only.conf /etc/nginx/sites-available/naksharix
sudo ln -sf /etc/nginx/sites-available/naksharix /etc/nginx/sites-enabled/naksharix
sudo nginx -t
sudo systemctl reload nginx

pm2 start ecosystem.config.js --only naksharix || pm2 restart naksharix
pm2 save

echo "Naksharix deployed at http://${DOMAIN}. Run certbot to enable HTTPS."
