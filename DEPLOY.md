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

`ancordss.me.uk` is attached to the application with `certificateType: letsencrypt`.
**DNS is not yet pointed at this server**, which is the one remaining step.

Cloudflare fronts the domain (`elliott.ns.cloudflare.com`, `liz.ns.cloudflare.com`).
The apex has no origin configured for this app, so Cloudflare answers `522`.
Note that `blog.ancordss.me.uk` is GitHub Pages — moving the apex does not affect it.

### To finish

In the Cloudflare DNS dashboard for `ancordss.me.uk`:

1. Add an `A` record: name `@`, content `144.217.164.56`, **Proxy status: DNS only** (grey cloud).
2. Wait for propagation, then confirm Traefik issues the certificate:
   ```bash
   echo | openssl s_client -connect 144.217.164.56:443 -servername ancordss.me.uk 2>/dev/null \
     | openssl x509 -noout -subject -issuer -dates
   ```
   Expect `CN=ancordss.me.uk` issued by Let's Encrypt, **not** `CN=TRAEFIK DEFAULT CERT`.
3. Once the certificate is valid, the proxy can be switched back on (orange cloud).
   Keep SSL/TLS mode on **Full (strict)**; `Flexible` would cause a redirect loop,
   since Traefik already 301s HTTP to HTTPS.

Why DNS-only first: Let's Encrypt's HTTP-01 challenge must reach Traefik directly.
Proxying during issuance can fail the challenge and leave the origin serving the
default certificate.

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

## Before this is a public launch

- **Rotate the Dokploy API key.** The current key was exposed in shell history
  output. Revoke it in the panel and issue a new one.
