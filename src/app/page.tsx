import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Experience } from "@/components/experience";
import { Projects } from "@/components/projects";
import { Skills } from "@/components/skills";
import { Thinking } from "@/components/thinking";
import { GithubSection } from "@/components/github-section";
import { Contact } from "@/components/contact";
import { getGithubData } from "@/lib/github";
import { structuredData } from "@/lib/structured-data";

export const revalidate = 43200;

export default async function Home() {
  const github = await getGithubData();

  const jsonLd = structuredData();

  return (
    <>
      <script
        type="application/ld+json"
        // Static, self-authored structured data — no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <About />
      <Experience />
      <Projects />
      <Skills />
      <Thinking />
      <GithubSection data={github} />
      <Contact />
    </>
  );
}
