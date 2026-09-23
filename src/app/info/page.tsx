import { About } from "@/components/about";
import { Experience } from "@/components/experience";
import { Skills } from "@/components/skills";
import { Thinking } from "@/components/thinking";
import { GithubSection } from "@/components/github-section";
import { Contact } from "@/components/contact";
import { getGithubData } from "@/lib/github";
import { site } from "@/content/site";

export const revalidate = 43200;

export default async function InfoPage() {
  const github = await getGithubData();

  return (
    <>
      {/* the quiet intro — portrait, name, role (identity, language-neutral) */}
      <header className="tone-dark relative overflow-hidden px-7 pt-32 pb-16 md:pt-40">
        <div className="mx-auto grid max-w-[1400px] items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="display-hero text-[clamp(2.8rem,6vw,4.5rem)]">
              {site.name}
            </h1>
            <p className="mt-4 font-mono text-[12px] tracking-[0.18em] text-soft uppercase">
              {site.role}
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.photo}
              alt={site.name}
              width={320}
              height={320}
              className="w-full max-w-[20rem] rounded-lg"
            />
          </div>
        </div>
      </header>
      <About />
      <Experience />
      <Skills />
      <Thinking />
      <GithubSection data={github} />
      <Contact />
    </>
  );
}
