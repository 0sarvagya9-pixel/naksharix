# SSL Setup for Naksharix

## Docker Compose SSL

1. Point these DNS records to your server:
   - `naksharix.com` A record -> VPS public IP
   - `www.naksharix.com` A record -> VPS public IP

2. Start app stack with the default HTTP-only Nginx config:

```bash
docker compose up -d postgres redis app nginx
```

3. Issue Let's Encrypt certificates:

```bash
docker compose --profile ssl run --rm certbot
```

4. Start Nginx with the HTTPS override:

```bash
docker compose -f docker-compose.yml -f docker-compose.ssl.yml up -d nginx
```

5. Renew certificates:

```bash
docker compose --profile ssl run --rm certbot renew
docker compose -f docker-compose.yml -f docker-compose.ssl.yml exec nginx nginx -s reload
```

## VPS Certbot SSL

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d naksharix.com -d www.naksharix.com
sudo systemctl reload nginx
```
