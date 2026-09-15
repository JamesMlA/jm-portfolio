import { githubStats, repos as staticRepos, type Repo } from "@/content/data";

const REVALIDATE = 60 * 60 * 12; // twice a day is plenty for a portfolio

export type ContributionDay = { date: string; count: number; level: number };

export type RepoCard = {
  name: string;
  descriptionEn: string;
  descriptionEs: string;
  language: string;
  pushed: string;
  href: string;
  stars: number;
};

export type GithubData = {
  live: boolean;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  totalLastYear: number;
  days: ContributionDay[] | null;
  repos: RepoCard[];
  languages: string[];
};

/* Fallbacks keep the section honest when the API is rate-limited at build time. */
const fallbackRepos: RepoCard[] = staticRepos.map((r: Repo) => ({
  name: r.name,
  descriptionEn: r.description.en,
  descriptionEs: r.description.es,
  language: r.language,
  pushed: r.pushed,
  href: r.href,
  stars: 0,
}));

type ApiRepo = {
  name: string;
  description: string | null;
  language: string | null;
  pushed_at: string;
  html_url: string;
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Merge live metadata onto the curated (localized) descriptions. */
function mergeRepos(api: ApiRepo[] | null): RepoCard[] {
  const byName = new Map((api ?? []).map((r) => [r.name.toLowerCase(), r]));
  return staticRepos.map((curated) => {
    const base =
      fallbackRepos.find((f) => f.name === curated.name) ??
      ({
        name: curated.name,
        descriptionEn: curated.description.en,
        descriptionEs: curated.description.es,
        language: curated.language,
        pushed: curated.pushed,
        href: curated.href,
        stars: 0,
      } satisfies RepoCard);
    const live = byName.get(curated.name.toLowerCase());
    if (!live) return base;
    return {
      ...base,
      language: live.language ?? base.language,
      pushed: live.pushed_at.slice(0, 10),
      href: live.html_url,
      stars: live.stargazers_count,
    };
  });
}

export async function getGithubData(): Promise<GithubData> {
  const [profile, repoList, contributions] = await Promise.all([
    getJson<{
      public_repos: number;
      followers: number;
      following: number;
      created_at: string;
    }>(`https://api.github.com/users/${githubStats.login}`),
    getJson<ApiRepo[]>(
      `https://api.github.com/users/${githubStats.login}/repos?per_page=100&sort=pushed`,
    ),
    getJson<{ total: Record<string, number>; contributions: ContributionDay[] }>(
      `https://github-contributions-api.jogruber.de/v4/${githubStats.login}?y=last`,
    ),
  ]);

  const languageCounts = new Map<string, number>();
  for (const repo of repoList ?? []) {
    if (repo.fork || repo.archived || !repo.language) continue;
    languageCounts.set(repo.language, (languageCounts.get(repo.language) ?? 0) + 1);
  }
  const languages = [...languageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name]) => name);

  return {
    live: Boolean(profile),
    publicRepos: profile?.public_repos ?? githubStats.publicRepos,
    followers: profile?.followers ?? githubStats.followers,
    following: profile?.following ?? githubStats.following,
    createdAt: profile?.created_at ?? githubStats.createdAt,
    totalLastYear: contributions?.total?.lastYear ?? githubStats.contributionsLastYear,
    days: contributions?.contributions ?? null,
    repos: mergeRepos(repoList),
    languages: languages.length > 0 ? languages : [...githubStats.languages],
  };
}
