#!/bin/sh
# Generate a self-signed origin certificate for littlehomie.tech.
#
# Cloudflare sits in front of this origin and, in SSL/TLS mode "Full", connects
# to nginx over HTTPS without validating the cert — so a self-signed one is
# perfectly fine here. The key NEVER leaves the server and is gitignored.
#
#   sh nginx/gen-selfsigned.sh
#
# Re-run any time; it overwrites the existing pair. 10-year validity so you
# don't have to think about renewals (Cloudflare doesn't check expiry in Full).
set -eu

DOMAIN="littlehomie.tech"
CERT_DIR="$(dirname "$0")/certs"

mkdir -p "$CERT_DIR"

openssl req -x509 -nodes -newkey rsa:2048 \
  -days 3650 \
  -keyout "$CERT_DIR/origin.key" \
  -out "$CERT_DIR/origin.crt" \
  -subj "/CN=$DOMAIN" \
  -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN"

chmod 600 "$CERT_DIR/origin.key"

echo "Wrote $CERT_DIR/origin.crt and $CERT_DIR/origin.key (self-signed, 10y)."
