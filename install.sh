#!/usr/bin/env bash
# ==============================================================================
# CNCjs Widget Hub - Universal One-Line Turnkey Installer
# Hosted at: https://github.com/kiwiscanwifi/cncjs-widgets-hub
# ==============================================================================

set -euo pipefail

REPO_URL="https://github.com/kiwiscanwifi/cncjs-widgets-hub.git"
DEFAULT_TARGET_DIR="$HOME/widgets"
CNCRC_FILE="$HOME/.cncrc"

echo "=========================================================="
echo "    CNCjs Widget Hub - Turnkey Community Installer        "
echo "=========================================================="

TARGET_DIR="${1:-$DEFAULT_TARGET_DIR}"

# 1. Clone or Update Repository
if [ -d "$TARGET_DIR/.git" ]; then
    echo "[1/4] Updating existing Widget Hub in $TARGET_DIR..."
    git -C "$TARGET_DIR" pull --ff-only || {
        echo "Git pull failed; continuing with local assets."
    }
else
    echo "[1/4] Cloning Widget Hub into $TARGET_DIR..."
    mkdir -p "$TARGET_DIR"
    git clone "$REPO_URL" "$TARGET_DIR"
fi

# 2. Configure ~/.cncrc Mount Point
echo "[2/4] Configuring CNCjs mount points in $CNCRC_FILE..."
python3 - << EOF
import json, os

cncrc_path = os.path.expanduser('$CNCRC_FILE')
target_dir = os.path.abspath('$TARGET_DIR')

data = {}
if os.path.exists(cncrc_path):
    try:
        with open(cncrc_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Warning reading ~/.cncrc: {e}")

if 'mountPoints' not in data:
    data['mountPoints'] = {}

# Ensure /widgets points to target directory
data['mountPoints']['/widgets'] = target_dir

with open(cncrc_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("  -> ~/.cncrc updated with mount: /widgets -> " + target_dir)
EOF

# 3. Inject loader.js into CNCjs index.hbs
echo "[3/4] Locating and verifying CNCjs index.hbs..."
INDEX_HBS_CANDIDATES=(
    "/usr/lib/node_modules/cncjs/dist/cncjs/app/index.hbs"
    "/usr/local/lib/node_modules/cncjs/dist/cncjs/app/index.hbs"
    "$(npm root -g 2>/dev/null)/cncjs/dist/cncjs/app/index.hbs"
)

FOUND_HBS=""
for hbs in "${INDEX_HBS_CANDIDATES[@]}"; do
    if [ -f "$hbs" ]; then
        FOUND_HBS="$hbs"
        break
    fi
done

if [ -n "$FOUND_HBS" ]; then
    echo "  Found CNCjs template at: $FOUND_HBS"
    if grep -q "widgets/loader.js" "$FOUND_HBS"; then
        echo "  -> loader.js is already configured in index.hbs."
    else
        echo "  -> Backing up index.hbs to index.hbs.bak..."
        sudo cp "$FOUND_HBS" "$FOUND_HBS.bak"
        echo "  -> Injecting loader.js script tag..."
        sudo sed -i 's|<head>|<head><script src="/widgets/loader.js?v=latest"></script>|g' "$FOUND_HBS"
        echo "  -> Successfully injected loader.js into index.hbs"
    fi
else
    echo "  [Notice] Could not auto-locate index.hbs. Please verify <script src='/widgets/loader.js'></script> is loaded."
fi

# 4. Restart CNCjs Service if running under systemd
echo "[4/4] Restarting CNCjs..."
if systemctl is-active --quiet cncjs 2>/dev/null; then
    sudo systemctl restart cncjs && echo "  -> CNCjs service restarted successfully."
elif which pm2 >/dev/null 2>&1 && pm2 list | grep -q cncjs; then
    pm2 restart cncjs && echo "  -> CNCjs restarted via PM2."
else
    echo "  -> Restart your CNCjs server process to load newly mounted widgets."
fi

echo "=========================================================="
echo "✓ CNCjs Widget Hub installation complete!"
echo "Open CNCjs in your browser and check the Widget Hub icon."
echo "=========================================================="
