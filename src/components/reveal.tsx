"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import { cx } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  id?: string;
};

/** The exact props Reveal hands to its tag — concrete so JSX stays typed. */
type RevealTagProps = {
  id?: string;
  ref?: Ref<HTMLElement>;
  "data-visible"?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * Scroll-triggered entrance. The initial state is set from the observer's own
 * callback — never from the effect body — so nothing cascades on mount.
 * CSS owns the transition, so `prefers-reduced-motion` neutralises it for free.
 */
export function Reveal({ children, as, delay = 0, className, id }: RevealProps) {
  const Tag = (as ?? "div") as ComponentType<RevealTagProps>;
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      id={id}
      ref={ref}
      data-visible={visible}
      className={cx("reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
