export const en = {
  meta: {
    locale: "en",
    title: "James Maradiaga — Lead DevOps Engineer",
    description:
      "Lead DevOps Engineer in Guatemala. I design, automate and operate cloud infrastructure: Kubernetes, Terraform, CI/CD, observability and MLOps across AWS, Azure and GCP.",
  },

  nav: {
    sections: {
      home: "Home",
      about: "About",
      experience: "Experience",
      projects: "Projects",
      skills: "Skills",
      github: "GitHub",
      contact: "Contact",
    },
    menu: "Menu",
    close: "Close",
    language: "Language",
  },

  hero: {
    availability: "Open to interesting engineering problems",
    headline: "Building reliable infrastructure for software that matters.",
    sub: "Lead DevOps Engineer focused on cloud infrastructure, Kubernetes, automation, reliability, and AI/MLOps.",
    ctaPrimary: "View my work",
    ctaSecondary: "Get in touch",
    photoAlt: "James Maradiaga",
  },

  about: {
    eyebrow: "01 — About",
    title: "I work on the layer below the product.",
    lead: "Most of my work happens where software meets the machine: Linux hosts, cloud accounts, container runtimes and the pipelines that move changes between them.",
    body: [
      "I build and operate platforms — the provisioning, the cluster, the delivery path, the dashboards someone opens at 03:00 when something is off. The goal is never tooling for its own sake: it is infrastructure that other engineers can reason about without needing me in the room.",
      "Day to day that means writing Terraform instead of clicking consoles, designing CI/CD that gives fast and honest feedback, hardening Kubernetes, and automating the operational work that would otherwise be done by hand at the wrong moment. I program in Python and Go, mostly to delete repetition.",
      "I work across Linux, cloud infrastructure, containers, Kubernetes, automation and programming. I care about the unglamorous parts: idempotency, least privilege, cost visibility, and knowing exactly what happens when a node disappears.",
    ],
    philosophyTitle: "Engineering philosophy",
    principles: {
      automate: {
        title: "Automate",
        body: "Reduce manual work and make systems reproducible. If a task needs to be done twice, it belongs in code.",
      },
      reliability: {
        title: "Engineer for reliability",
        body: "Design infrastructure that is observable, scalable and resilient — and assume the failure will happen during the worst possible change window.",
      },
      simple: {
        title: "Keep it simple",
        body: "Prefer understandable systems over unnecessary complexity. Boring infrastructure that everyone can read beats clever infrastructure only one person understands.",
      },
    },
    nowTitle: "Currently",
    now: [
      "Leading cloud infrastructure and DevOps practice at Niuro",
      "Kubernetes platforms, Infrastructure as Code and delivery pipelines",
      "Observability, security hardening and cost awareness",
      "Local AI infrastructure and production-oriented MLOps",
    ],
    stack: ["Linux", "Kubernetes", "Terraform", "AWS", "Python", "Go"],
  },

  experience: {
    eyebrow: "02 — Experience",
    title: "A progression from support tickets to platform ownership.",
    lead: "Ten years ago I was fixing workstations. Today I lead the infrastructure other engineers ship on. The through-line is the same: understand the system, then remove the parts that hurt.",
    current: "Current",
    focusLabel: "Focus areas",
    remote: "remote-friendly",
  },

  skills: {
    eyebrow: "04 — Skills",
    title: "Technology is only interesting in context.",
    lead: "Where each technology sits in the systems I build. Grouped by engineering domain, not by logo count.",
  },

  projects: {
    eyebrow: "03 — Work",
    title: "Case studies, not screenshots.",
    lead: "These are the problem spaces I work in. Each one is written as an engineering case study — context, architecture and approach. Anything I cannot verify publicly is left out or marked accordingly.",
    soon: "Case study in progress",
    soonNote:
      "Written up as a working note rather than a marketing page. Detailed diagrams and outcomes are added once the write-up is reviewed.",
    labels: {
      problem: "Problem",
      architecture: "Architecture",
      approach: "Approach",
      technology: "Technology",
      outcome: "Outcome",
      scope: "Scope",
    },
  },

  thinking: {
    eyebrow: "05 — Mental model",
    title: "How I think about infrastructure",
    lead: "These are not skills, they are constraints I design against. Each one changes the others — that tension is what makes infrastructure work.",
    related: "Pulls on",
    detail: "What it changes",
  },

  github: {
    eyebrow: "06 — Open source",
    title: "Code, in public.",
    lead: "Pull live from the GitHub API at build time — no invented contribution numbers. Pinned repositories are real, unmodified projects.",
    viewProfile: "View GitHub profile",
    blog: "Technical blog",
    blogNote: "Writing about Linux, Kubernetes and automation.",
    repos: "Selected repositories",
    reposNote: "Sorted by last push. Descriptions as written by their author.",
    activity: "Contribution activity",
    activityNote: "Public contribution calendar for the last year.",
    contributions: "contributions in the last year",
    publicRepos: "public repositories",
    followers: "followers",
    following: "following",
    memberSince: "on GitHub since",
    pushed: "last push",
    pinned: "Pinned",
    liveNote: "Live data",
    stale: "Live data unavailable — showing the static fallback.",
    languages: "Primary languages",
    less: "less",
    more: "more",
  },

  contact: {
    eyebrow: "07 — Contact",
    title: "Have an infrastructure problem worth solving?",
    lead: "I'm interested in building reliable platforms, automating complex systems and solving difficult infrastructure problems.",
    email: "Email me",
    linkedin: "LinkedIn",
    github: "GitHub",
    copy: "Copy address",
    copied: "Copied",
    signature: "Built with Next.js, deployed like infrastructure.",
    interestTitle: "Things I'm happy to talk about",
    interests: [
      "Kubernetes platform design and operations",
      "Infrastructure as Code at team scale",
      "CI/CD that engineers actually trust",
      "Observability and incident response",
      "Cloud cost reduction without losing reliability",
      "MLOps and AI infrastructure",
    ],
  },

  footer: {
    built: "Designed and built by James Maradiaga",
    stack: "Next.js · TypeScript · Tailwind",
    forAgents: "For agents",
    forAgentsIndex: "index",
    forAgentsMarkdown: "markdown",
    forAgentsSitemap: "urls",
    rights: "All rights reserved",
    version: "rev",
  },

  a11y: {
    external: "opens in a new tab",
  },
};

export type Dictionary = typeof en;
