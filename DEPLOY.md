# Deploying

Live on Dokploy, served through Traefik. Container build, `output: "standalone"`.

## Current setup

| | |
| --- | --- |
| Project | `portfolio` (`18zq1rX_OKApwCkgb4iq1`) |
| Application | `portfolio-web` — `b7DaVp7yhHJeb26SoMtcy` |
| Container name | `portfolio-web-ot40al` |
| Repository | https://github.com/JamesMlA/jm-portfolio (branch `main`) |
| Source | `sourceType: git`, public repo over HTTPS — no GitHub App needed |
| Build | Dockerfile at repo root, context `.` |
| Port | 3000 |
| Origin server | `144.217.164.56` (same Dokploy host as `sentinel.ancordss.me.uk`) |
| Panel | https://dokploy.ancordss.me.uk |

Pushing to `main` triggers a redeploy (`autoDeploy: true`).

## Domain

`ancordss.me.uk` is attached to the application with `certificateType: letsencrypt`
and is **live**. Cloudflare fronts the domain (`elliott.ns.cloudflare.com`,
`liz.ns.cloudflare.com`) with the apex proxied (orange cloud) to `144.217.164.56`.

TLS today is Cloudflare's edge certificate (Google Trust Services). The origin has
its own Let's Encrypt certificate, issued 2026-09-15, so **Full (strict)** works.

Two things worth knowing if this ever needs re-doing:

- **Issue the certificate while the record is DNS-only.** The HTTP-01 challenge has
  to reach Traefik. When the record was pointed for the first time, the origin still
  served `TRAEFIK DEFAULT CERT` and the edge returned `526`; Traefik was in ACME
  backoff from the earlier mispointed attempt. Deleting and recreating the domain in
  Dokploy forced a fresh challenge, which succeeded in under a minute.
- **Expect a short `522` window right after the certificate flips.** Cloudflare's
  first request to a cold origin can fail; it clears on its own within seconds.

Verify issuance:
```bash
echo | openssl s_client -connect 144.217.164.56:443 -servername ancordss.me.uk 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```
Expect `CN=ancordss.me.uk` from Let's Encrypt, **not** `CN=TRAEFIK DEFAULT CERT`.

`www.ancordss.me.uk` is not configured and does not resolve. Add a `CNAME` for `www`
to `ancordss.me.uk` if that is wanted.

## Redeploying by hand

```bash
dokploy auth -u https://dokploy.ancordss.me.uk -t <API_KEY>
dokploy application deploy --applicationId b7DaVp7yhHJeb26SoMtcy
```

`application.redeploy` reuses the build cache and can ship a stale commit; use
`application.deploy` after pushing so the new revision is actually picked up.

## Verification

```bash
curl -sI https://<host>/ | grep -i '^link:'
curl -s  https://<host>/llms.txt
curl -s  https://<host>/index.md | head -40
BASE_URL=https://<host> python3 scripts/agent-check.py
```

## Live

https://ancordss.me.uk — verified 2026-09-15: all endpoints `200`, real `404`,
9/9 AgentReady requirements, canonical/OG/sitemap/llms.txt pointing at the domain.

## Before this is a public launch

- **Rotate the Dokploy API key.** The current key was exposed in shell history
  output. Revoke it in the panel and issue a new one.
- Decide whether the temporary `*.sslip.io` domain should stay attached. It is
  harmless (it resolves straight to the origin, bypassing Cloudflare) but it is
  indexed nowhere and serves a duplicate of the site.
