#!/usr/bin/env bash
# Point the rolling `edge` pre-release at the current master commit and make
# its assets match DIR. Called by launcher-build.yml and publish-release.yml,
# which own different assets of the same release:
#   EDGE_OWN     ERE of asset names this caller may delete when stale
#   EDGE_DISOWN  ERE of asset names it must never delete
# Needs GH_TOKEN, GH_REPO and SHA in the environment (contents: write).
set -euo pipefail
dir="${1:?usage: edge-release.sh DIR}"
own="${EDGE_OWN:-.}"
disown="${EDGE_DISOWN:-^$}"
: "${GH_REPO:?}" "${SHA:?}"
notes="Rolling build of master at ${SHA}. Replaced on every commit to \
master; not a versioned release. Use a tagged release for anything you \
rely on."

# Two workflows race to create it: whoever loses just uses the winner's.
gh release view edge >/dev/null 2>&1 ||
  gh release create edge --prerelease --target "$SHA" \
    --title "edge (latest master)" --notes "$notes" >/dev/null ||
  gh release view edge >/dev/null
gh api -X PATCH "repos/$GH_REPO/git/refs/tags/edge" \
  -f sha="$SHA" -F force=true >/dev/null
gh release edit edge --prerelease --notes "$notes" >/dev/null
gh release upload edge "$dir"/* --clobber

# Drop assets of ours that this build no longer produces.
keep="$(ls "$dir")"
gh release view edge --json assets -q '.assets[].name' | while read -r a; do
  if [[ "$a" =~ $own ]] && ! [[ "$a" =~ $disown ]] &&
    ! grep -qxF -- "$a" <<<"$keep"; then
    gh release delete-asset edge "$a" -y
  fi
done
