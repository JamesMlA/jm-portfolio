import { projects, skillDomains, timeline } from "@/content/data";
import { site, sections } from "@/content/site";

/**
 * schema.org structured data, emitted as a single `@graph` so entities can
 * reference each other by @id instead of being duplicated (AgentReady AR-READ-08).
 *
 * ProfilePage wraps the Person: the homepage *is* a profile page, and saying so
 * lets an agent treat the page as the canonical description of the subject
 * rather than as a generic document that happens to mention a person.
 *
 * Facts asserted here are also present in visible text — markdown converters
 * commonly drop <script> blocks.
 */

const id = (fragment: string) => `${site.url}/#${fragment}`;

const PERSON_ID = id("person");
const PAGE_ID = id("profilepage");
const SITE_ID = id("website");

export function structuredData() {
  const person = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    alternateName: site.handle,
    url: site.url,
    image: `${site.url}${site.photo}`,
    email: `mailto:${site.email}`,
    jobTitle: "Lead DevOps Engineer",
    description:
      "Lead DevOps Engineer in Guatemala. Designs, automates and operates cloud infrastructure: Kubernetes, Infrastructure as Code, CI/CD, observability and MLOps across AWS, Azure and GCP.",
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location,
      addressCountry: "GT",
    },
    nationality: { "@type": "Country", name: "Guatemala" },
    knowsLanguage: [
      { "@type": "Language", name: "English", alternateName: "en" },
      { "@type": "Language", name: "Spanish", alternateName: "es" },
    ],
    sameAs: [site.links.github, site.links.linkedin, site.links.blog],
    knowsAbout: [
      "Cloud infrastructure",
      "Kubernetes",
      "Infrastructure as Code",
      "Terraform",
      "CI/CD",
      "Site Reliability Engineering",
      "Observability",
      "MLOps",
      "Python",
      "Go",
      "AWS",
      "Azure",
      "Google Cloud Platform",
      "Linux",
      "Docker",
      "Cloud cost optimization",
    ],
    hasOccupation: {
      "@type": "Occupation",
      name: "Lead DevOps Engineer",
      occupationLocation: { "@type": "Country", name: "Guatemala" },
      skills:
        "Kubernetes, Terraform, CI/CD, observability, security, cloud cost optimization, Python, Go",
    },
    worksFor: {
      "@type": "Organization",
      name: "Niuro",
      description: "Current employer. Leads cloud infrastructure and DevOps practice.",
    },
    /** Roles become typed employments so an agent can read the history. */
    hasPart: timeline.slice(1).map((entry) => ({
      "@type": "EmploymentAgreement",
      roleName: entry.role.en,
      description: entry.summary.en,
      startDate: String(entry.start),
      endDate: entry.current ? undefined : String(entry.period.en.match(/\d{4}/g)?.at(-1) ?? ""),
      hiringOrganization: { "@type": "Organization", name: entry.company },
    })),
  };

  const projectEntities = projects.map((project) => ({
    "@type": "CreativeWork",
    "@id": id(`project-${project.id}`),
    name: project.title.en,
    description: project.tagline.en,
    abstract: project.problem.en,
    about: [project.domain.en, ...project.stack],
    keywords: project.stack.join(", "),
    author: { "@id": PERSON_ID },
    isPartOf: { "@id": PAGE_ID },
    ...(project.link ? { sameAs: project.link.href } : {}),
  }));

  const skillEntities = skillDomains.map((domain) => ({
    "@type": "ItemList",
    "@id": id(`skills-${domain.id}`),
    name: domain.label.en,
    itemListElement: domain.skills.map((skill, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: skill.name,
      description: skill.note.en,
    })),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": PAGE_ID,
        url: site.url,
        name: `${site.name} — Lead DevOps Engineer`,
        description:
          "Engineering portfolio of James Maradiaga: cloud infrastructure, Kubernetes, Infrastructure as Code, reliability and MLOps.",
        inLanguage: ["en", "es"],
        isPartOf: { "@id": SITE_ID },
        mainEntity: { "@id": PERSON_ID },
        about: { "@id": PERSON_ID },
        hasPart: projectEntities.map((p) => ({ "@id": p["@id"] })),
        significantLink: sections.map((s) => `${site.url}/#${s.id}`),
        /** Points agents at the machine-readable mirrors. */
        encoding: [
          { "@type": "MediaObject", encodingFormat: "text/markdown", contentUrl: `${site.url}/index.md` },
          { "@type": "MediaObject", encodingFormat: "text/plain", contentUrl: `${site.url}/llms.txt` },
        ],
      },
      person,
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: site.url,
        name: site.name,
        inLanguage: "en",
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
      },
      ...projectEntities,
      ...skillEntities,
    ],
  };
}
