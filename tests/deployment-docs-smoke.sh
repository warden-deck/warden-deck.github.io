#!/bin/sh
set -eu

caddy=content/docs/https-caddy.html
nginx=content/docs/https-nginx.html
grep -q 'reverse_proxy' "$caddy"
grep -q 'proxy_pass' "$nginx"
grep -q 'X-Forwarded-Proto' "$nginx"
grep -q 'proxy_set_header Upgrade' "$nginx"
grep -q 'WARDEN_TRUST_PROXY' "$caddy" "$nginx"
if rg -ni 'campaign proceeds|campaign in progress|later module|BH[0-9]+.*Planned' content templates; then
  echo "stale public claim found" >&2
  exit 1
fi
echo "warden deployment documentation smoke: ok"
