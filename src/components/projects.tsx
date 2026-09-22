"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useI18n } from "./i18n";
import { Headline, Kicker, Lead, Reveal, Section, SpecRow, Tag, TextLink } from "./ui";
import { projects, type Project } from "@/content/data";
import { cx } from "@/lib/utils";

/**
 * The work story: five case studies as alternating product rows —
 * story on one side, the poster shot on the other. Every study is fully
 * inline; there is no modal and nothing to step through.
 */
export function Projects() {
  const { d } = useI18n();

  return (
    <Section id="projects" tone="light" wide>
      <div className="max-w-[980px]">
        <Reveal>
          <Kicker>{d.projects.eyebrow.replace(/^\d+\s*—\s*/, "")}</Kicker>
        </Reveal>
        <Reveal delay={80}>
          <Headline>{d.projects.title}</Headline>
        </Reveal>
        <Reveal delay={160}>
          <Lead>{d.projects.lead}</Lead>
        </Reveal>
      </div>

      <div className="mt-24 space-y-28 md:space-y-36">
        {projects.map((project, i) => (
          <ProjectRow key={project.id} project={project} flip={i % 2 === 1} />
        ))}
      </div>
    </Section>
  );
}

/** One product row: the inline case study and its poster, sides alternating. */
function ProjectRow({ project, flip }: { project: Project; flip: boolean }) {
  const { d, l } = useI18n();

  return (
    <article className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <Reveal className={cx("min-w-0", flip && "lg:order-2")} delay={100}>
        <p className="text-[13px] font-semibold text-soft">{project.index}</p>

        <h3 className="display-hero mt-2 text-[clamp(1.9rem,3.4vw,2.8rem)]">
          {l(project.title)}
        </h3>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {l(project.domain)
            .split("·")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => (
              <Tag key={part}>{part}</Tag>
            ))}
        </div>

        <div className="mt-8 border-t hairline">
          <SpecRow label={d.projects.labels.problem}>{l(project.problem)}</SpecRow>
          <SpecRow label={d.projects.labels.architecture}>{l(project.tagline)}</SpecRow>
          <SpecRow label={d.projects.labels.approach}>
            <ul className="list-disc space-y-2 pl-5">
              {project.approach.map((step, i) => (
                <li key={i}>{l(step)}</li>
              ))}
            </ul>
          </SpecRow>
          <SpecRow label={d.projects.labels.technology}>
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </div>
          </SpecRow>
          <SpecRow label={d.projects.labels.outcome}>{l(project.outcome)}</SpecRow>
          <SpecRow label={d.projects.labels.scope}>{l(project.scope)}</SpecRow>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed hairline px-4 py-3">
          <p className="text-[15px] font-semibold">{d.projects.soon}</p>
          <p className="mt-1 text-[15px] leading-relaxed text-soft">
            {d.projects.soonNote}
          </p>
        </div>

        {project.link ? (
          <TextLink className="mt-4" href={project.link.href} external>
            {l(project.link.label)}
          </TextLink>
        ) : null}
      </Reveal>

      <Reveal className={cx("min-w-0", flip && "lg:order-1")}>
        <Poster project={project} />
      </Reveal>
    </article>
  );
}

/**
 * The poster plate — generated at build time, purely decorative — with the
 * same settle-on-scroll the hero shot uses. Static under reduced motion.
 */
function Poster({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.04, 1]);

  return (
    <motion.div ref={ref} style={reduced ? undefined : { scale }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/renders/${project.id}.png`}
        alt=""
        aria-hidden
        loading="lazy"
        width={1600}
        height={1000}
        className="block h-auto w-full rounded-2xl shadow-lg"
      />
    </motion.div>
  );
}
