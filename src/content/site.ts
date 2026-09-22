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
 * Section order drives the nav and the story-beat rhythm.
 */
export const sections = [
  { id: "home" },
  { id: "about" },
  { id: "experience" },
  { id: "projects" },
  { id: "skills" },
  { id: "github" },
  { id: "contact" },
] as const;
