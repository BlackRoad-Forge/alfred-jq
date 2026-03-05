alfred-jq
==============

[![CI](https://github.com/blackboxprogramming/alfred-jq/actions/workflows/ci.yml/badge.svg)](https://github.com/blackboxprogramming/alfred-jq/actions/workflows/ci.yml)
[![Security](https://github.com/blackboxprogramming/alfred-jq/actions/workflows/security.yml/badge.svg)](https://github.com/blackboxprogramming/alfred-jq/actions/workflows/security.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/blackboxprogramming/alfred-jq?label=latest%20release)](https://github.com/blackboxprogramming/alfred-jq/releases)
[![GitHub](https://img.shields.io/github/license/blackboxprogramming/alfred-jq)](https://github.com/blackboxprogramming/alfred-jq/blob/main/LICENSE)

Alfred workflow to process JSON from clipboard using [jq](https://stedolan.github.io/jq/) queries with key autocompletion.

## Use case: quick JSON processing without the terminal

![jq](https://user-images.githubusercontent.com/5732757/139618920-1df38ed6-3b59-4b4c-a89b-ba80897d2a07.gif)

## Install

Download the latest [jq.alfredworkflow](https://github.com/blackboxprogramming/alfred-jq/releases/latest/download/jq.alfredworkflow) from the releases page and double-click to install.

## Requirements

- [Alfred](https://alfredapp.com/) with Powerpack
- [jq](https://stedolan.github.io/jq/) (`brew install jq`)

## How to use

1. Copy JSON to your clipboard
2. Open Alfred and type `jq`
3. Type your jq query (e.g. `.name`, `.items[0]`, `.[] | .id`)
4. Available keys will auto-suggest as you type
5. Press **Tab** to autocomplete a key
6. Press **Enter** to preview the result in Large Type
7. Press **Shift+Enter** to copy the result back to clipboard

## API (Cloudflare Worker)

A serverless jq-like API is included in `cloudflare-worker/` for server-side JSON processing:

```bash
# Health check
curl https://your-worker.workers.dev/health

# Process a query
curl -X POST https://your-worker.workers.dev/query \
  -H "Content-Type: application/json" \
  -d '{"input": {"name": "test", "items": [1,2,3]}, "filter": ".name"}'
# Returns: {"result":"test","filter":".name"}
```

Supported filters: `.key`, `.key.subkey`, `.[index]`, `keys`, `length`, `type`, and pipes (`|`).

## Development

```bash
# Run Python tests
pip install pytest==8.3.4
python -m pytest tests/ -v

# Run Cloudflare Worker tests
node cloudflare-worker/test.js

# Lint
pip install flake8==7.1.1
flake8 complete_keys.py --max-line-length=120
```

## Project structure

```
alfred-jq/
├── .github/workflows/    # CI, release, security, pages, automerge, cloudflare
├── cloudflare-worker/    # Serverless jq API (Cloudflare Worker)
├── tests/                # Python test suite
├── workflow/             # Vendored Alfred-Workflow library (Dean Jackson)
├── complete_keys.py      # Key autocompletion script
├── info.plist            # Alfred workflow definition
├── icon.png              # Workflow icon
├── error.png             # Error state icon
└── jq.alfredworkflow     # Packaged workflow (built by CI)
```

## Credits

- [Alfred-Workflow](https://github.com/deanishe/alfred-workflow) by Dean Jackson (vendored in `workflow/`)
- [jq](https://stedolan.github.io/jq/) by Stephen Dolan
