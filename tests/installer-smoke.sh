#!/bin/sh
set -eu

root="$(mktemp -d)"
trap 'rm -rf "$root"' EXIT INT TERM
sh -n content/install.sh content/download.sh content/update.sh
cmp content/install.sh public/install.sh
cmp content/download.sh public/download.sh
cmp content/update.sh public/update.sh
mkdir -p "$root/release" "$root/install"
printf '#!/bin/sh\necho warden-test\n' > "$root/warden"
chmod 0755 "$root/warden"
tar -C "$root" -czf "$root/release/warden-linux-amd64.tar.gz" warden
(cd "$root/release" && sha256sum warden-linux-amd64.tar.gz > checksums.txt)

WARDEN_INSTALL_DIR="$root/install" WARDEN_RELEASE_BASE="file://$root/release" sh content/install.sh
test -x "$root/install/warden"
test "$("$root/install/warden")" = warden-test

printf '%064d  warden-linux-amd64.tar.gz\n' 0 > "$root/release/checksums.txt"
if WARDEN_INSTALL_DIR="$root/install" WARDEN_RELEASE_BASE="file://$root/release" sh content/install.sh >/dev/null 2>&1; then
  echo "installer accepted a checksum mismatch" >&2
  exit 1
fi
echo "warden installer smoke: ok"
