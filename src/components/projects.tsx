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
      <Reveal>
        <SectionHead
          eyebrow={d.projects.eyebrow}
          title={d.projects.title}
          lead={d.projects.lead}
          wide
        />
      </Reveal>

      <ul className="mt-14 grid gap-px overflow-hidden rounded-panel border border-line bg-line md:grid-cols-2">
        {projects.map((project, i) => {
          const wide = i === 0;
          return (
            <Reveal
              as="li"
              key={project.id}
              delay={i * 60}
              className={cx("bg-panel", wide && "md:col-span-2")}
            >
              <article
                className={cx(
                  "group relative flex h-full flex-col p-6 transition-colors duration-500 hover:bg-panel-hi sm:p-7",
                  wide && "md:grid md:grid-cols-2 md:gap-10 md:p-9",
                )}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xs text-signal">{project.index}</span>
                    <span className="font-mono text-2xs tracking-wide text-dim">
                      {l(project.domain)}
                    </span>
                    <span className="ml-auto font-mono text-2xs text-faint">
                      {l(project.scope)}
                    </span>
                  </div>

                  <h3
                    className={cx(
                      "mt-4 font-display tracking-tight text-ink",
                      wide ? "text-2xl sm:text-3xl" : "text-xl",
                    )}
                  >
                    {l(project.title)}
                  </h3>

                  <p className="mt-3 max-w-xl text-[0.88rem] leading-relaxed text-mute">
                    {l(project.tagline)}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.stack.slice(0, wide ? 6 : 4).map((tech) => (
                      <Chip key={tech}>{tech}</Chip>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      triggerRef.current = e.currentTarget;
                      setOpenId(project.id);
                    }}
                    className="mt-6 inline-flex min-h-6 w-fit items-center gap-2 py-1 font-mono text-2xs tracking-wide text-signal transition-colors hover:text-ink"
                  >
                    <span className="border-b border-signal/30 pb-0.5">
                      {d.projects.open}
                    </span>
                    <ArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                <div
                  className={cx(
                    "mt-6 flex items-end",
                    wide && "md:mt-0 md:items-center",
                  )}
                >
                  <div className="w-full opacity-70 transition-opacity duration-500 group-hover:opacity-100">
                    <DiagramTrace variant={project.diagram} />
                    {wide ? (
                      <div className="mt-4 border-t border-line pt-4">
                        <ProjectDiagram
                          variant={project.diagram}
                          caption={`${d.projects.diagramLabel} — ${l(project.title)}`}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>

                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-signal transition-transform duration-700 group-hover:scale-x-100"
                />
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
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${d.projects.caseStudyLabel}: ${l(project.title)}`}
        className="animate-rise panel grain relative my-0 w-full max-w-4xl overflow-hidden shadow-lift sm:my-4"
      >
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-panel/95 px-5 py-3.5 backdrop-blur">
          <Layers className="size-3.5 text-signal" strokeWidth={1.75} />
          <span className="font-mono text-2xs tracking-[0.16em] text-dim uppercase">
            {d.projects.caseStudyLabel}
          </span>
          <span className="font-mono text-2xs text-faint">
            {project.index} / {String(projects.length).padStart(2, "0")}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label={d.projects.previous}
              className="grid size-7 place-items-center rounded-md border border-line text-dim transition-colors hover:border-line-hi hover:text-ink"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label={d.projects.next}
              className="grid size-7 place-items-center rounded-md border border-line text-dim transition-colors hover:border-line-hi hover:text-ink"
            >
              <ChevronRight className="size-3.5" />
            </button>
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              aria-label={d.projects.close}
              className="ml-2 grid size-7 place-items-center rounded-md border border-line-hi text-mute transition-colors hover:border-signal/50 hover:text-signal"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        <div className="px-5 py-7 sm:px-8 sm:py-9">
          <p className="font-mono text-2xs tracking-wide text-dim">{l(project.domain)}</p>
          <h3 className="mt-2 text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
            {l(project.title)}
          </h3>
          <p className="mt-3 max-w-2xl text-[0.92rem] leading-relaxed text-mute">
            {l(project.tagline)}
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-x-10">
            <div className="space-y-8 lg:col-span-7">
              <Block label={d.projects.labels.problem}>
                <p className="text-[0.9rem] leading-[1.75] text-mute">{l(project.problem)}</p>
              </Block>

              <Block label={d.projects.labels.approach}>
                <ol className="space-y-4">
                  {project.approach.map((step, i) => (
                    <li key={i} className="flex gap-3.5">
                      <span className="mt-0.5 font-mono text-2xs text-signal tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[0.88rem] leading-[1.7] text-mute">{l(step)}</span>
                    </li>
                  ))}
                </ol>
              </Block>

              <Block label={d.projects.labels.outcome}>
                <p className="text-[0.9rem] leading-[1.75] text-mute">{l(project.outcome)}</p>
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
                <p className="mt-2 font-mono text-xs text-mute">{l(project.scope)}</p>
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

              <div className="rounded-md border border-dashed border-line-hi px-3.5 py-3">
                <p className="font-mono text-2xs text-amber">
                  {d.projects.soon}
                </p>
                <p className="mt-1.5 text-2xs leading-relaxed text-faint">
                  {d.projects.soonNote}
                </p>
              </div>

              {project.link ? (
                <a
                  href={project.link.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center gap-2 font-mono text-2xs text-signal transition-colors hover:text-ink"
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
