"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
} from "lucide-react";
import { useI18n } from "./i18n";
import { Chip, Reveal, Section, SectionHead } from "./ui";
import { DiagramTrace, ProjectDiagram } from "./diagram";
import { projects, type Project } from "@/content/data";
import { cx } from "@/lib/utils";

export function Projects() {
  const { d, l } = useI18n();
  const [openId, setOpenId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const openProject = useMemo(
    () => projects.find((p) => p.id === openId) ?? null,
    [openId],
  );

  const close = useCallback(() => {
    setOpenId(null);
    triggerRef.current?.focus();
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (!openId) return;
      const i = projects.findIndex((p) => p.id === openId);
      const next = projects[(i + delta + projects.length) % projects.length];
      setOpenId(next.id);
    },
    [openId],
  );

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    }, 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(focusTimer);
    };
  }, [close, openId, step]);

  return (
    <Section id="projects">
      <Reveal className="reveal-mask">
        <SectionHead
          index="03"
          eyebrow={d.projects.eyebrow.replace(/^\d+\s*—\s*/, "")}
          title={d.projects.title}
          lead={d.projects.lead}
          wide
        />
      </Reveal>

      {/* case studies as alternating editorial plates */}
      <ul className="mt-14 border-t border-line">
        {projects.map((project, i) => {
          const flip = i % 2 === 1;
          return (
            <Reveal
              as="li"
              key={project.id}
              delay={flip ? 80 : 0}
              className="border-b border-line"
            >
              <article className="group grid items-center gap-8 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
                <div
                  className={cx(
                    "flex min-w-0 flex-col lg:col-span-5",
                    flip && "lg:order-2",
                  )}
                >
                  <span
                    aria-hidden
                    className="numeral text-[clamp(3.2rem,7vw,5.4rem)] leading-[0.78] transition-colors duration-500 group-hover:text-signal/60"
                  >
                    {project.index}
                  </span>

                  <h3 className="display-wide mt-6 text-[clamp(1.7rem,3.2vw,2.6rem)] leading-[1.05] text-ink">
                    {l(project.title)}
                  </h3>

                  <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-mute text-pretty">
                    {l(project.tagline)}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {l(project.domain)
                      .split("·")
                      .map((part) => part.trim())
                      .filter(Boolean)
                      .map((part) => (
                        <Chip key={part}>{part}</Chip>
                      ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      triggerRef.current = e.currentTarget;
                      setOpenId(project.id);
                    }}
                    className="mt-7 inline-flex min-h-8 w-fit items-center gap-2 py-1 font-mono text-2xs tracking-wide text-signal transition-colors hover:text-ink"
                  >
                    <span className="border-b border-signal/30 pb-0.5">
                      {d.projects.open}
                    </span>
                    <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                <div
                  className={cx(
                    "ticks min-w-0 lg:col-span-7",
                    flip && "lg:order-1",
                  )}
                >
                  <figure className="panel grain volt-rim relative overflow-hidden">
                    {/* poster plate — generated at build time, purely decorative */}
                    <div className="scanlines">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/renders/${project.id}.png`}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        width={1600}
                        height={1000}
                        className="block h-auto w-full opacity-90 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    </div>
                    <figcaption className="flex items-center gap-4 border-t border-line px-4 py-2.5">
                      <span className="block w-16 shrink-0 opacity-70">
                        <DiagramTrace variant={project.diagram} />
                      </span>
                      <span className="ml-auto truncate font-mono text-2xs text-faint">
                        {l(project.scope)}
                      </span>
                    </figcaption>
                  </figure>
                </div>
              </article>
            </Reveal>
          );
        })}
      </ul>

      {openProject ? (
        <CaseStudy
          project={openProject}
          panelRef={panelRef}
          onClose={close}
          onStep={step}
        />
      ) : null}
    </Section>
  );
}

function CaseStudy({
  project,
  panelRef,
  onClose,
  onStep,
}: {
  project: Project;
  panelRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const { d, l } = useI18n();

  return (
    <div className="fixed inset-0 z-[72] flex items-start justify-center overflow-y-auto overscroll-contain p-0 sm:p-6">
      <div
        onClick={onClose}
        className="animate-rise fixed inset-0 bg-void/85 backdrop-blur-sm"
        style={{ animationDuration: "0.3s" }}
      />
      <div className="animate-rise ticks relative my-0 w-full max-w-4xl sm:my-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${d.projects.caseStudyLabel}: ${l(project.title)}`}
          className="panel grain relative overflow-hidden shadow-lift"
        >
          {/* dossier header rail */}
          <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-panel/95 px-5 py-3.5 backdrop-blur">
            <Layers className="size-3.5 text-signal" strokeWidth={1.75} />
            <span className="label-xs">{d.projects.caseStudyLabel}</span>
            <span className="font-mono text-2xs tabular-nums text-faint">
              {project.index} / {String(projects.length).padStart(2, "0")}
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => onStep(-1)}
                aria-label={d.projects.previous}
                className="grid size-8 place-items-center rounded-md border border-line text-dim transition-colors hover:border-line-hi hover:text-ink"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onStep(1)}
                aria-label={d.projects.next}
                className="grid size-8 place-items-center rounded-md border border-line text-dim transition-colors hover:border-line-hi hover:text-ink"
              >
                <ChevronRight className="size-3.5" />
              </button>
              <button
                type="button"
                data-autofocus
                onClick={onClose}
                aria-label={d.projects.close}
                className="ml-2 grid size-8 place-items-center rounded-md border border-line-hi text-mute transition-colors hover:border-signal/50 hover:text-signal"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="px-5 py-7 sm:px-8 sm:py-9">
            <p className="font-mono text-2xs tracking-wide text-dim">
              {l(project.domain)}
            </p>
            <h3 className="display-wide mt-2 text-[clamp(1.8rem,4vw,2.8rem)] leading-[1.05] text-ink">
              {l(project.title)}
            </h3>
            <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-mute">
              {l(project.tagline)}
            </p>

            <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-x-10">
              <div className="space-y-8 lg:col-span-7">
                <Block label={d.projects.labels.problem}>
                  <p className="text-[0.9rem] leading-[1.75] text-mute">
                    {l(project.problem)}
                  </p>
                </Block>

                <Block label={d.projects.labels.approach}>
                  <ol className="space-y-4">
                    {project.approach.map((step, i) => (
                      <li key={i} className="flex gap-3.5">
                        <span className="mt-0.5 font-mono text-2xs text-signal tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[0.88rem] leading-[1.7] text-mute">
                          {l(step)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </Block>

                <Block label={d.projects.labels.outcome}>
                  <p className="text-[0.9rem] leading-[1.75] text-mute">
                    {l(project.outcome)}
                  </p>
                </Block>
              </div>

              <div className="space-y-6 lg:col-span-5">
                <div>
                  <p className="label-xs">{d.projects.labels.technology}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <Chip key={tech} tone="signal">
                        {tech}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-xs">{d.projects.labels.scope}</p>
                  <p className="mt-2 font-mono text-xs text-mute">
                    {l(project.scope)}
                  </p>
                </div>

                <div>
                  <p className="label-xs">{d.projects.diagramLabel}</p>
                  <div className="mt-3">
                    <ProjectDiagram
                      variant={project.diagram}
                      caption={d.projects.diagramNote}
                    />
                  </div>
                </div>

                <div className="rounded-md border border-dashed border-amber/40 px-3.5 py-3">
                  <p className="font-mono text-2xs text-amber">{d.projects.soon}</p>
                  <p className="mt-1.5 text-2xs leading-relaxed text-faint">
                    {d.projects.soonNote}
                  </p>
                </div>

                {project.link ? (
                  <a
                    href={project.link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group inline-flex min-h-8 items-center gap-2 py-1 font-mono text-2xs text-signal transition-colors hover:text-ink"
                  >
                    {l(project.link.label)}
                    <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span className="sr-only">{d.a11y.external}</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="label-xs">{label}</h4>
      <div className="mt-3">{children}</div>
    </section>
  );
}
