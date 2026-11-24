#!/usr/bin/env bash
# Do not re-resolve the application's reviewed production lockfile merely to
# install test tooling. Keep the browser tool dependency tree isolated.
set -euo pipefail
: "${RUNNER_TEMP:?RUNNER_TEMP is required}"
tools="$RUNNER_TEMP/naksharix-browser-tools"
mkdir -p "$tools"
printf '%s\n' '{"name":"naksharix-browser-tools","version":"1.0.0","private":true}' > "$tools/package.json"
npm install --prefix "$tools" --no-save --package-lock=false --ignore-scripts --no-audit --no-fund @playwright/test@1.54.1 @axe-core/playwright@4.10.2
mkdir -p node_modules/@playwright node_modules/@axe-core
# Resolve test imports from the checkout to the same runner used by the CLI.
for pkg in @playwright/test @axe-core/playwright playwright playwright-core; do
  if [ -e "node_modules/$pkg" ] || [ -L "node_modules/$pkg" ]; then
    test "$(realpath "node_modules/$pkg")" = "$(realpath "$tools/node_modules/$pkg")" || { echo "Existing browser package conflicts: $pkg" >&2; exit 1; }
  else
    ln -s "$tools/node_modules/$pkg" "node_modules/$pkg"
  fi
done
node "$tools/node_modules/@playwright/test/cli.js" --version
git diff --exit-code -- package.json package-lock.json
