#!/bin/sh
set -eu
system=false; rollback=false
while [ "$#" -gt 0 ]; do case "$1" in --system) system=true;; --rollback) rollback=true;; --help) echo 'usage: update.sh [--system] [--rollback]'; exit 0;; *) echo "unknown option: $1" >&2; exit 2;; esac; shift; done
if $system; then [ "$(id -u)" -eq 0 ] || { echo '--system requires root.' >&2; exit 1; }; binary=/usr/local/bin/warden; else [ "$(id -u)" -ne 0 ] || { echo 'Run without sudo or pass --system.' >&2; exit 1; }; binary=${WARDEN_INSTALL_DIR:-"$HOME/.local/bin"}/warden; fi
[ -f "$binary" ] && [ ! -L "$binary" ] || { echo "No regular Warden installation at $binary" >&2; exit 1; }; previous="$binary.previous"
if $rollback; then [ -f "$previous" ] || { echo 'No rollback binary is available.' >&2; exit 1; }; cp "$previous" "$binary.rollback.$$"; chmod 0755 "$binary.rollback.$$"; mv "$binary.rollback.$$" "$binary"; if ! $system && "$binary" service status >/dev/null 2>&1; then "$binary" service restart; fi; echo 'Restored the previous Warden binary.'; exit 0; fi
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT INT TERM
WARDEN_VERSION=${WARDEN_VERSION:-latest} sh -c "curl -fsSL https://warden.cv/download.sh | sh -s -- --output '$tmp/warden'"
cp "$binary" "$previous.new"; chmod 0755 "$previous.new"; mv "$previous.new" "$previous"; install -m 0755 "$tmp/warden" "$binary.new"; mv "$binary.new" "$binary"
if ! $system && "$binary" service status >/dev/null 2>&1; then "$binary" service restart; fi
echo 'Updated Warden. Roll back with update.sh --rollback.'
