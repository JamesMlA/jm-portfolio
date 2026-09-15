import json, os, re, subprocess, sys
BASE = os.environ.get("BASE_URL", "http://localhost:3000")
def get(path, ctype_only=False):
    r = subprocess.run(["curl","-s","-D-","-o","/tmp/ag_body",f"{BASE}{path}"], capture_output=True, text=True)
    head = r.stdout
    status = int(re.search(r"HTTP/[\d.]+ (\d+)", head).group(1))
    ct = re.search(r"content-type: ([^\n]+)", head, re.I)
    body = open("/tmp/ag_body", encoding="utf-8", errors="replace").read()
    return status, (ct.group(1).strip() if ct else ""), body, head

results = []
def check(rid, desc, ok, detail=""):
    results.append((rid, ok, desc, detail))

# AR-FIND-01 reachable
s, ct, body, _ = get("/")
check("AR-FIND-01", "Public content reachable (no block)", s == 200, f"HTTP {s}")

# AR-FIND-03 sitemap referenced from robots.txt
s, ct, rb, _ = get("/robots.txt")
check("AR-FIND-03", "robots.txt references sitemap", "Sitemap:" in rb, rb.split("Sitemap:")[-1].strip()[:60] if "Sitemap:" in rb else "missing")

# AR-READ-01 answer in initial HTML
s, ct, html, _ = get("/")
need = ["Building reliable infrastructure", "Niuro", "Toolbox", "Kubernetes platform",
        "maradiaga.l.james@gmail.com", "Terraform"]
missing = [n for n in need if n not in html]
check("AR-READ-01", "Content present in initial HTML", not missing, f"missing: {missing}" if missing else "all probes found")

# AR-READ-02 accurate 404
s404, _, b404, _ = get("/definitely-not-a-page")
check("AR-READ-02", "404 for missing paths", s404 == 404, f"HTTP {s404}")

# AR-READ-05 fenced + language-tagged code
_, _, md, _ = get("/index.md")
langs = re.findall(r"```(\w+)", md)
check("AR-READ-05", "Fenced, language-tagged code", len(langs) >= 2, f"langs: {langs}")

# AR-READ-06 discovery files linked from page head
s, ct, html, _ = get("/")
linked = re.findall(r'<link[^>]*rel="alternate"[^>]*>', html)
has_md = any('type="text/markdown"' in l for l in linked)
has_llms = any('text/plain' in l and "llms" in l for l in linked)
check("AR-READ-06", "Discovery files linked from head", has_md and has_llms,
      f"markdown={has_md} llms={has_llms}")

# AR-READ-07 llms.txt shape (H1 + blockquote + sections with links)
s, ct, llms, _ = get("/llms.txt")
h1 = llms.startswith("# ")
quote = "\n> " in llms
sections = len(re.findall(r"^## ", llms, re.M))
links = len(re.findall(r"^- \[.+\]\(.+\)", llms, re.M))
check("AR-READ-07", "llms.txt follows the format", s == 200 and h1 and quote and sections >= 2 and links >= 5,
      f"HTTP {s} h1={h1} quote={quote} sections={sections} links={links}")

# AR-READ-08 JSON-LD parses and resolves
s, ct, html, _ = get("/")
blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
ok = False; detail = "no block"
if blocks:
    try:
        d = json.loads(blocks[0]); g = d["@graph"]
        ids = {x.get("@id") for x in g if x.get("@id")}
        refs = set()
        def walk(o):
            if isinstance(o, dict):
                for k, v in o.items():
                    if k == "@id" and isinstance(v, str): refs.add(v)
                    else: walk(v)
            elif isinstance(o, list):
                for v in o: walk(v)
        walk(g)
        dangling = [r for r in refs if r not in ids]
        ok = "Person" in [x.get("@type") for x in g] and not dangling
        detail = f"{len(g)} entities, {len(refs)} refs, dangling={len(dangling)}"
    except Exception as e:
        detail = f"parse error: {e}"
check("AR-READ-08", "JSON-LD valid with resolvable refs", ok, detail)

# AR-READ-09 markdown mirror advertised + served
md_status, md_ct, _, _ = get("/index.md")
check("AR-READ-09", "Markdown mirror advertised + served",
      has_md and md_status == 200 and md_ct.startswith("text/markdown"),
      f"HTTP {md_status} content-type: {md_ct}")

print(f"{'ID':14} {'RESULT':6} REQUIREMENT")
print("-" * 78)
for rid, ok, desc, detail in results:
    print(f"{rid:14} {'PASS' if ok else 'FAIL':6} {desc}")
    if detail: print(f"{'':21}-> {detail}")
passed = sum(1 for r in results if r[1])
print("-" * 78)
print(f"{passed}/{len(results)} applicable requirements satisfied")
sys.exit(0 if passed == len(results) else 1)
