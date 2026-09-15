import type { CSSProperties } from "react";
import { buildContours } from "@/lib/contours";

/**
 * Contour-field backdrop — the elevation map of a system.
 *
 * Generated once at build time (value noise + marching squares) and emitted as
 * static SVG, so it costs zero client JS and cannot jank: no canvas, no rAF
 * loop, no image request. Change-packets are `<animateMotion>` riding existing
 * ring paths, so they animate without a render loop.
 *
 * The heavy geometry is declared once by <TerrainDefs /> and referenced with
 * <use>, so the document carries the contours a single time no matter how many
 * sections wear them.
 *
 * The fade is a CSS mask on the consuming element, deliberately *not* an SVG
 * <mask>: a gradient declared inside the <defs> of a 0x0 SVG has no resolvable
 * user space and degenerates to a flat value, which silently erases the field.
 */

const CACHE = new Map<string, ReturnType<typeof buildContours>>();

/** Nine levels at a fine lattice: enough contours to read as terrain, few
 *  enough that the widest ring stays around 900 path characters. */
const LEVELS = [0.38, 0.42, 0.46, 0.5, 0.54, 0.58, 0.62, 0.66, 0.7];

function field() {
  const cached = CACHE.get("hero");
  if (cached) return cached;
  const built = buildContours(
    1440,
    900,
    120,
    76,
    LEVELS.map((level) => ({ level, step: 1 })),
  );
  CACHE.set("hero", built);
  return built;
}

const GEOMETRY_ID = "terrain-geometry";

/** Recedes toward the top (under the nav) and strengthens toward the base. */
export const terrainFade =
  "linear-gradient(to bottom, rgb(0 0 0 / 0.2) 0%, rgb(0 0 0 / 0.36) 34%, rgb(0 0 0 / 0.72) 72%, rgb(0 0 0 / 1) 100%)";

/** Emit exactly once per page, before any <TerrainField />. */
export function TerrainDefs() {
  const data = field();

  return (
    <svg width="0" height="0" aria-hidden focusable="false" className="absolute">
      <defs>
        <g id={GEOMETRY_ID} fill="none">
          {data.rings.map((ring, i) => (
            <path
              key={i}
              d={ring.d}
              stroke="var(--color-terrain)"
              strokeWidth={ring.level >= 0.6 ? 1.15 : 0.95}
              vectorEffect="non-scaling-stroke"
              opacity={ring.level >= 0.6 ? 1 : ring.level >= 0.5 ? 0.8 : 0.62}
              strokeLinecap="round"
            />
          ))}

          {/* one contour traced in the accent colour: the surveyed route */}
          {data.rings[3] ? (
            <path
              d={data.rings[3].d}
              stroke="var(--color-signal)"
              strokeWidth="1.1"
              vectorEffect="non-scaling-stroke"
              opacity="0.5"
              strokeLinecap="round"
              strokeDasharray="140 420"
              className="motion-only animate-flow"
            />
          ) : null}
        </g>
      </defs>
    </svg>
  );
}

export function TerrainField({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const data = field();
  const packetRings = data.packets.map((i) => data.rings[i]).filter(Boolean);

  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox={data.viewBox}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{
        maskImage: terrainFade,
        WebkitMaskImage: terrainFade,
        ...style,
      }}
    >
      <use href={`#${GEOMETRY_ID}`} />

      {/* change-packets travelling the contours */}
      <g className="motion-only">
        {packetRings.map((ring, i) => (
          <circle key={i} r="2.2" fill="var(--color-signal)" opacity="0.85">
            <animateMotion
              dur={`${22 + i * 4}s`}
              begin={`${i * 2.6}s`}
              repeatCount="indefinite"
              path={ring.d}
            />
            <animate
              attributeName="opacity"
              values="0;0.85;0.85;0"
              keyTimes="0;0.06;0.9;1"
              dur={`${22 + i * 4}s`}
              begin={`${i * 2.6}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
    </svg>
  );
}
