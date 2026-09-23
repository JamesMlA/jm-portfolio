"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useI18n } from "./i18n";
import { Tag, TextLink, Words } from "./ui";
import { projects, type Project } from "@/content/data";
import { cx } from "@/lib/utils";

type PanelKind = "landscape" | "macro" | "field";

const PANEL_SIZE: Record<PanelKind, { width: number; height: number }> = {
  landscape: { width: 2400, height: 1200 },
  macro: { width: 1600, height: 1000 },
  field: { width: 1600, height: 1000 },
};

/** A render panel — full-bleed artwork that settles into place on scroll. */
function Panel({
  id,
  kind,
  className,
}: {
  id: string;
  kind: PanelKind;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.6], [1.08, 1]);
  const size = PANEL_SIZE[kind];

  return (
    <figure ref={ref} className={cx("relative overflow-hidden", className)}>
      <motion.img
        src={`/renders/${id}-${kind}.png`}
        alt=""
        aria-hidden
        loading="lazy"
        width={size.width}
        height={size.height}
        style={reduced ? undefined : { scale }}
        className="h-full w-full object-cover"
      />
    </figure>
  );
}

/** The quiet grey band between panels — the proof behind the impact. */
function DetailStrip({ project }: { project: Project }) {
  const { d, l } = useI18n();

  return (
    <div className="mx-auto grid max-w-[1400px] gap-8 px-7 py-14 md:py-20 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-6 lg:col-start-1">
        <div>
          <p className="kicker text-soft">{d.projects.labels.problem}</p>
          <p className="mt-2 max-w-[38rem] text-[15px] leading-relaxed text-soft">
            {l(project.problem)}
          </p>
        </div>
        <div>
          <p className="kicker text-soft">{d.projects.labels.approach}</p>
          <ul className="mt-2 max-w-[38rem] space-y-2.5 text-[15px] leading-relaxed text-soft">
            {project.approach.map((step, i) => (
              <li key={i}>{l(step)}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="kicker text-soft">{d.projects.labels.scope}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-soft">
            {l(project.scope)}
          </p>
        </div>
        <p className="text-[12px] leading-relaxed text-soft">
          {d.projects.soon} — {d.projects.soonNote}
        </p>
      </div>
    </div>
  );
}

/**
 * One case study: anchor (domain label + huge light title), proof column to
 * the right, then the render panels with the detail strip between them.
 */
function Chapter({ project }: { project: Project }) {
  const { d, l } = useI18n();

  return (
    <article className="tone-dark relative pb-16 md:pb-24">
      <header className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-7 pt-16 md:pt-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="kicker text-soft">{l(project.domain)}</p>
          <h2 className="display-hero mt-5 text-[clamp(2.6rem,5.5vw,4.25rem)]">
            <Words text={l(project.title)} step={65} />
            <Words text={l(project.tagline)} className="text-soft" step={65} />
          </h2>
        </div>

        {/* proof column */}
        <aside className="lg:col-span-4 lg:col-start-9 lg:mt-24">
          <p className="kicker text-soft">{d.projects.labels.technology}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.stack.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </div>
          {project.link ? (
            <TextLink
              href={project.link.href}
              external
              variant="press"
              className="mt-6"
            >
              {l(project.link.label)}
            </TextLink>
          ) : null}
          <p className="kicker mt-6 text-soft">{d.projects.labels.outcome}</p>
          <p className="mt-2 max-w-[20rem] text-[13px] leading-relaxed text-soft">
            {l(project.outcome)}
          </p>
        </aside>
      </header>

      <Panel
        id={project.id}
        kind="landscape"
        className="mt-14 aspect-[2/1] md:mt-20"
      />
      <DetailStrip project={project} />
      <div className="mx-auto grid max-w-[1400px] gap-8 px-7 lg:grid-cols-12">
        <Panel
          id={project.id}
          kind="macro"
          className="aspect-[8/5] lg:col-span-7 lg:col-start-6"
        />
        <Panel
          id={project.id}
          kind="field"
          className="aspect-[8/5] lg:col-span-7 lg:col-start-1"
        />
      </div>
    </article>
  );
}

/** The home page: the work, nothing else (CONTEXT.md "Work spine"). */
export function WorkSpine() {
  return (
    <div>
      {projects.map((project) => (
        <Chapter key={project.id} project={project} />
      ))}
    </div>
  );
}
