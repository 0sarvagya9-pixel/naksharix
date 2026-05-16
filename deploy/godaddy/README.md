# GoDaddy VPS Deployment Config

Use this for Ubuntu 22.04 or 24.04 VPS.

## DNS

In GoDaddy DNS:

- `A @` -> VPS public IP
- `A www` -> VPS public IP

## One-time server setup

```bash
sudo bash deploy/godaddy/setup-vps.sh
```

## App deployment

```bash
bash deploy/godaddy/deploy.sh
```

## SSL

```bash
sudo certbot --nginx -d naksharix.com -d www.naksharix.com
sudo systemctl reload nginx
```

## PM2 commands

```bash
pm2 status
pm2 logs naksharix
pm2 restart naksharix
pm2 save
```
