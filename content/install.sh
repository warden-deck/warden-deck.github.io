#!/bin/sh
set -eu
repo="warden-cv/warden"
mode="user"
usage(){ cat <<'EOF'
Warden installer
Usage:
  install.sh             Install for the current user to ~/.local/bin
  install.sh --system    Install system-wide to /usr/local/bin
  install.sh --help      Show this help
Environment:
  WARDEN_INSTALL_DIR     Override the per-user install directory
                         (cannot be combined with --system)
  WARDEN_RELEASE_BASE    Override the release download base for a mirror
EOF
}
while [ "$#" -gt 0 ]; do
  case "$1" in
    --system) mode="system"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Warden installer: unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done
if [ "$mode" = system ]; then
  [ -z "${WARDEN_INSTALL_DIR:-}" ] || { echo "Warden installer: WARDEN_INSTALL_DIR cannot be combined with --system" >&2; exit 2; }
  [ "$(id -u)" -eq 0 ] || { echo "Warden installer: --system installs to /usr/local/bin and requires root." >&2; echo "Run: curl -fsSL https://warden.cv/install.sh | sudo sh -s -- --system" >&2; exit 1; }
  install_dir="/usr/local/bin"
else
  if [ "$(id -u)" -eq 0 ] && [ -z "${WARDEN_INSTALL_DIR:-}" ]; then
    echo "Warden installer: do not use sudo for the default per-user install." >&2
    echo "Run without sudo, or use --system to install to /usr/local/bin." >&2
    exit 1
  fi
  install_dir="${WARDEN_INSTALL_DIR:-$HOME/.local/bin}"
fi
case "$(uname -s)" in Linux) os=linux;; Darwin) os=darwin;; *) echo "Warden installer: unsupported operating system: $(uname -s)" >&2; exit 1;; esac
case "$(uname -m)" in x86_64|amd64) arch=amd64;; arm64|aarch64) arch=arm64;; *) echo "Warden installer: unsupported architecture: $(uname -m)" >&2; exit 1;; esac
asset="warden-${os}-${arch}.tar.gz"
base="${WARDEN_RELEASE_BASE:-https://github.com/${repo}/releases/latest/download}"
url="${base}/${asset}"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT INT TERM
echo "Downloading ${asset}..."
curl -fL "$url" -o "$tmp/$asset"
curl -fL "${base}/checksums.txt" -o "$tmp/checksums.txt"
expected="$(awk -v asset="$asset" '$2 == asset { print $1 }' "$tmp/checksums.txt")"
[ -n "$expected" ] || { echo "Warden installer: checksum is missing for $asset" >&2; exit 1; }
if command -v sha256sum >/dev/null 2>&1; then
  actual="$(sha256sum "$tmp/$asset" | awk '{print $1}')"
elif command -v shasum >/dev/null 2>&1; then
  actual="$(shasum -a 256 "$tmp/$asset" | awk '{print $1}')"
else
  echo "Warden installer: sha256sum or shasum is required" >&2
  exit 1
fi
[ "$actual" = "$expected" ] || { echo "Warden installer: checksum verification failed for $asset" >&2; exit 1; }
tar -xzf "$tmp/$asset" -C "$tmp" warden
mkdir -p "$install_dir"
install -m 0755 "$tmp/warden" "$install_dir/warden"
echo "Installed Warden to $install_dir/warden"
case ":${PATH:-}:" in *":$install_dir:"*) ;; *) echo; echo "$install_dir is not currently in PATH."; if [ "$mode" = user ] && [ "$install_dir" = "$HOME/.local/bin" ]; then echo "Add this to your shell profile, then open a new shell:"; echo '  export PATH="$HOME/.local/bin:$PATH"'; else echo "Add $install_dir to PATH before running Warden by name."; fi;; esac
