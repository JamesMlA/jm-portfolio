import { githubStats, principles, projects, skillDomains, timeline } from "@/content/data";
import { site } from "@/content/site";
import { en } from "@/content/en";

/**
 * Machine-readable renderings of the site's content, generated from the same
 * source modules the page renders from — so they cannot drift.
 *
 * Follows the AgentReady v1.0 requirements:
 *   AR-READ-01  content present without JS (these are static text responses)
 *   AR-READ-05  fenced, language-tagged code blocks
 *   AR-READ-07  a lean, described index at /llms.txt
 *   AR-READ-09  a markdown mirror advertised via rel="alternate"
 *   AR-FIND-03  sitemap reference
 */

const abs = (path: string) => `${site.url}${path}`;

/** One-line facts an agent should be able to quote without reading the page. */
export function factsMarkdown(): string {
  const current = timeline[0];
  return [
    `# ${site.name}`,
    "",
    `> Lead DevOps Engineer based in ${site.location}. Builds and operates cloud infrastructure: Kubernetes, Infrastructure as Code, CI/CD, observability and MLOps across AWS, Azure and GCP.`,
    "",
    "## Facts",
    "",
    `- **Name:** ${site.name} (GitHub handle: \`${site.handle}\`)`,
    `- **Role:** Lead DevOps Engineer at Niuro (${current.period.en})`,
    `- **Location:** ${site.location} (time zone ${site.timeZone})`,
    `- **Email:** ${site.email}`,
    `- **LinkedIn:** ${site.links.linkedin}`,
    `- **GitHub:** ${site.links.github}`,
    `- **Technical blog:** ${site.links.blog}`,
    `- **Focus areas:** Cloud infrastructure, Kubernetes, Infrastructure as Code, CI/CD, automation, reliability engineering, observability, cloud cost optimization, security, Python and Go engineering, MLOps`,
    `- **Public repositories:** ${githubStats.publicRepos}`,
    "",
    "## Working languages",
    "",
    "- English (site default)",
    "- Spanish — the site is fully bilingual; switch with the EN/ES control in the navigation.",
  ].join("\n");
}

/** Full portfolio content as markdown — the mirror of the rendered page. */
export function portfolioMarkdown(): string {
  const out: string[] = [];

  out.push(`# ${en.meta.title}`, "", `> ${en.hero.headline}`, "", en.hero.sub, "");
  out.push(factsMarkdown().split("\n").slice(4).join("\n"), "");

  /* --- About --- */
  out.push("## About", "", en.about.lead, "");
  for (const paragraph of en.about.body) out.push(paragraph, "");
  out.push(`### ${en.about.philosophyTitle}`, "");
  for (const key of ["automate", "reliability", "simple"] as const) {
    const p = en.about.principles[key];
    out.push(`- **${p.title}.** ${p.body}`);
  }
  out.push("", `### ${en.about.nowTitle}`, "");
  for (const item of en.about.now) out.push(`- ${item}`);
  out.push("");

  /* --- Experience --- */
  out.push("## Experience", "", en.experience.lead, "");
  for (const entry of timeline) {
    out.push(
      `### ${entry.role.en} — ${entry.company}`,
      "",
      `${entry.period.en}${entry.current ? " (current)" : ""}`,
      "",
      entry.summary.en,
      "",
      `Focus: ${entry.focus.map((f) => f.en).join(", ")}`,
      "",
    );
  }

  /* --- Projects --- */
  out.push("## Projects", "", en.projects.lead, "");
  for (const project of projects) {
    out.push(
      `### ${project.index}. ${project.title.en}`,
      "",
      `${project.domain.en} · ${project.scope.en}`,
      "",
      project.tagline.en,
      "",
      `**${en.projects.labels.problem}:** ${project.problem.en}`,
      "",
      `**${en.projects.labels.approach}:**`,
      "",
    );
    project.approach.forEach((step, i) => out.push(`${i + 1}. ${step.en}`));
    out.push(
      "",
      `**${en.projects.labels.outcome}:** ${project.outcome.en}`,
      "",
      `**${en.projects.labels.technology}:** ${project.stack.join(", ")}`,
      "",
    );
    if (project.link) out.push(`- Related code: ${project.link.href}`);
    out.push("");
  }

  /* --- Skills --- */
  out.push("## Skills", "", en.skills.lead, "");
  for (const domain of skillDomains) {
    out.push(`### ${domain.label.en}`, "");
    for (const skill of domain.skills) {
      out.push(`- **${skill.name}** — ${skill.note.en}`);
    }
    out.push("");
  }

  /* --- Day-to-day commands (AR-READ-05: fenced and language-tagged) --- */
  out.push(
    "## Typical operational workflow",
    "",
    "Commands representative of the work: infrastructure changes are planned and",
    "reviewed before they are applied, and rollouts are watched to completion.",
    "",
    "```bash",
    "# Plan an infrastructure change and review it as a diff",
    "terraform plan -out=release.tfplan",
    "# Plan: 14 to add, 2 to change, 0 to destroy.",
    "",
    "# Follow a rollout to completion",
    "kubectl rollout status deploy/platform-api",
    '# deployment "platform-api" successfully rolled out',
    "",
    "# Check the service-level objective, then the cost report",
    "./scripts/check-slo.sh",
    "make cost-report",
    "```",
    "",
    "```yaml",
    "# Representative workload guardrails: bounded, least-privilege, observable",
    "apiVersion: apps/v1",
    "kind: Deployment",
    "metadata:",
    "  name: platform-api",
    "spec:",
    "  template:",
    "    spec:",
    "      securityContext:",
    "        runAsNonRoot: true",
    "      containers:",
    "        - name: api",
    "          resources:",
    "            requests: { cpu: 250m, memory: 256Mi }",
    "            limits: { cpu: '1', memory: 512Mi }",
    "```",
    "",
  );

  /* --- How I think about infrastructure --- */
  out.push("## How I think about infrastructure", "", en.thinking.lead, "");
  for (const principle of principles) {
    out.push(`- **${principle.label.en}.** ${principle.detail.en}`);
  }
  out.push("");

  /* --- Open source --- */
  out.push(
    "## Open source",
    "",
    `GitHub profile: ${site.links.github} (${githubStats.publicRepos} public repositories, ` +
      `${githubStats.contributionsLastYear} contributions in the last year).`,
    "",
    "Selected public repositories:",
    "",
  );
  for (const repo of [
    { name: "vault-on-aws", desc: "HashiCorp Vault on AWS, deployed with Terraform." },
    { name: "ffmpeg", desc: "Docker builds for FFmpeg (Ubuntu, Alpine, CentOS, Scratch, NVIDIA, VAAPI)." },
    { name: "mongodb-k8s", desc: "Running MongoDB on Kubernetes." },
    { name: "Docker_cicd", desc: "Container build and delivery practice." },
    { name: "gcp-project", desc: "Google Cloud infrastructure described with Terraform." },
  ]) {
    out.push(`- [${repo.name}](${site.links.github}/${repo.name}): ${repo.desc}`);
  }
  out.push("");

  /* --- Contact --- */
  out.push(
    "## Contact",
    "",
    en.contact.title,
    "",
    en.contact.lead,
    "",
    `- Email: ${site.email}`,
    `- LinkedIn: ${site.links.linkedin}`,
    `- GitHub: ${site.links.github}`,
    "",
    "### Topics open to discussion",
    "",
  );
  for (const interest of en.contact.interests) out.push(`- ${interest}`);
  out.push("");

  /* --- Provenance --- */
  out.push(
    "## About this document",
    "",
    "Generated from the same content modules that render the website, so it stays in sync.",
    "Anything not verifiable from a public source is explicitly marked on the site and is",
    "not asserted here. Architecture diagrams on the site are labelled as illustrative.",
    "",
    `- Canonical site: ${site.url}`,
    `- Content index for agents: ${abs("/llms.txt")}`,
    `- Sitemap: ${abs("/sitemap.xml")}`,
  );

  return out.join("\n");
}

/**
 * `llms.txt` — a lean, described index. Per llmstxt.org the format is
 * H1 + blockquote summary + sections of `- [name](url): notes`.
 */
export function llmsTxt(): string {
  return [
    `# ${site.name}`,
    "",
    `> Lead DevOps Engineer in ${site.location}. Designs, automates and operates cloud infrastructure: Kubernetes, Infrastructure as Code, CI/CD, observability, security and MLOps across AWS, Azure and GCP.`,
    "",
    "This is a personal engineering portfolio. It is a static, server-rendered site;",
    "every fact below is also present in the HTML, so no JavaScript execution is required.",
    "",
    "Key facts an agent is likely to need: the role is Lead DevOps Engineer at Niuro",
    `(2025–present), prior DevOps roles at Toolbox, Banco Industrial Guatemala and Data Buddies.`,
    `Contact: ${site.email}. The site is bilingual (English default, Spanish available).`,
    "",
    "## Primary",
    "",
    `- [Full portfolio as markdown](${abs("/index.md")}): every section — about, experience, projects, skills, contact — as one markdown document`,
    `- [Homepage](${site.url}): the rendered site, canonical entry point`,
    "",
    "## Reference",
    "",
    `- [Projects](${site.url}): five engineering case studies on the home page — cloud infrastructure, Kubernetes platform, CI/CD and automation, streaming infrastructure, AI/MLOps`,
    `- [Experience](${site.url}/info#experience): role history with focus areas and dates`,
    `- [Skills](${site.url}/info#skills): technologies grouped by engineering domain, with how each is used`,
    `- [How I think about infrastructure](${site.url}/info#thinking): engineering principles and how they relate`,
    `- [Open source](${site.url}/info#github): GitHub profile and selected public repositories`,
    `- [Contact](${site.url}/info#contact): email, LinkedIn and GitHub`,
    "",
    "## Machine-readable",
    "",
    `- [sitemap.xml](${abs("/sitemap.xml")}): the site's canonical URLs`,
    `- [robots.txt](${abs("/robots.txt")}): crawl policy — all agents welcome`,
    `- [JSON-LD + RDFa](${site.url}): schema.org Person and ProfilePage facts embedded in the homepage head`,
    "",
    "## Optional",
    "",
    `- [Technical blog](${site.links.blog}): writing by the same author, hosted separately`,
    `- [GitHub profile](${site.links.github}): public repositories and contribution history`,
    `- [LinkedIn](${site.links.linkedin}): professional profile`,
  ].join("\n");
}
