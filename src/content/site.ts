/**
 * Non-translatable identity + links.
 * Every value here was verified against a live source — no invented metrics.
 */
export const site = {
  name: "James Maradiaga",
  handle: "Ancordss",
  role: "Lead DevOps Engineer",
  location: "Guatemala",
  timeZone: "America/Guatemala",
  email: "maradiaga.l.james@gmail.com",
  url: "https://ancordss.me.uk",
  links: {
    github: "https://github.com/Ancordss",
    linkedin: "https://www.linkedin.com/in/jamesmaradiaga",
    blog: "https://blog.ancordss.me.uk",
    email: "mailto:maradiaga.l.james@gmail.com",
  },
  photo: "/james-maradiaga.jpg",
  /** Public GitHub facts pulled live from the GitHub API at build time. */
  github: {
    api: "https://api.github.com/users/Ancordss",
    contributionsApi: "https://github-contributions-api.jogruber.de/v4/Ancordss",
  },
} as const;

/**
 * Section order drives the nav, the "g <key>" chord and the command palette.
 * `keywords` are language-neutral so search still works while in Spanish.
 */
export const sections = [
  {
    id: "home",
    key: "h",
    keywords: "james devops engineer hero start top cloud sre mlops",
  },
  {
    id: "about",
    key: "a",
    keywords: "profile bio philosophy automate reliability simple linux containers",
  },
  {
    id: "experience",
    key: "e",
    keywords: "niuro toolbox banco industrial data buddies ciudad vieja career roles jobs",
  },
  {
    id: "projects",
    key: "p",
    keywords:
      "case study kubernetes terraform cicd pipeline streaming ffmpeg mlops ai cloud architecture",
  },
  {
    id: "skills",
    key: "s",
    keywords:
      "aws azure gcp kubernetes docker linux terraform cloudformation python go c++ github actions sql nosql monitoring observability",
  },
  {
    id: "github",
    key: "g",
    keywords: "repos repositories open source contributions activity ancordss code blog",
  },
  {
    id: "contact",
    key: "c",
    keywords: "email mail linkedin hire work together reach out",
  },
] as const;

export type SectionId = (typeof sections)[number]["id"];
