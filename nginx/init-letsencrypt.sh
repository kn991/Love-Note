#!/bin/sh
# ── One-time TLS bootstrap for littlehomie.tech ────────────────────────────
# Issues the first Let's Encrypt certificate so nginx can start with HTTPS.
# Run ONCE from the repo root on the server:
#
#     sh nginx/init-letsencrypt.sh
#
# Prereqs: DNS A record for littlehomie.tech points at THIS server, and ports
# 80/443 are free (stop any other web server first). Optionally set an email:
#
#     LE_EMAIL=you@example.com sh nginx/init-letsencrypt.sh
#
# Test against the staging CA first (avoids rate limits) with LE_STAGING=1.
set -e

domain="littlehomie.tech"
email="${LE_EMAIL:-}"
staging="${LE_STAGING:-0}"
rsa_key_size=4096
compose="docker compose -f docker-compose.prod.yml"
data_path="./nginx/certbot"

mkdir -p "$data_path/conf/live/$domain" "$data_path/www"

echo "### 1/5 Creating a temporary self-signed certificate for $domain ..."
$compose run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
    -keyout /etc/letsencrypt/live/$domain/privkey.pem \
    -out /etc/letsencrypt/live/$domain/fullchain.pem \
    -subj '/CN=$domain'" certbot

echo "### 2/5 Building images and starting nginx ..."
$compose up -d --build nginx

echo "### 3/5 Removing the temporary certificate ..."
$compose run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domain \
    /etc/letsencrypt/archive/$domain \
    /etc/letsencrypt/renewal/$domain.conf" certbot

echo "### 4/5 Requesting the real Let's Encrypt certificate ..."
if [ -n "$email" ]; then email_arg="--email $email"; else email_arg="--register-unsafely-without-email"; fi
if [ "$staging" != "0" ]; then staging_arg="--staging"; else staging_arg=""; fi

$compose run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg $email_arg \
    -d $domain \
    --rsa-key-size $rsa_key_size \
    --agree-tos --no-eff-email --force-renewal" certbot

echo "### 5/5 Reloading nginx with the new certificate ..."
$compose exec nginx nginx -s reload

echo ""
echo "### Done. Now bring up the whole stack:"
echo "    $compose up -d --build"
echo "### Then open https://$domain"
