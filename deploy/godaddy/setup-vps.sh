#!/usr/bin/env bash
set -euo pipefail

apt update
apt install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx ufw

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi

npm install -g pm2

ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

systemctl enable nginx
systemctl restart nginx

mkdir -p /var/www/naksharix
chown -R "$SUDO_USER":"$SUDO_USER" /var/www/naksharix

echo "GoDaddy VPS base setup complete."
