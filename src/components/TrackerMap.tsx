// TrackerMap — cinematic satellite-tracking interstitial shown between the
// LandingLoader boot screen and the NexusDashboard. Sequence:
//
//   1. ZOOM IN (once, at entry): the world view dives onto Ghaziabad, where
//      the target — the Spidey logo with its crosshair brackets attached —
//      sits under the center of the screen.
//   2. TRAVEL: the whole unit (crosshair + logo + rings) glides along the
//      dotted flight path from Ghaziabad down to VIT Vellore while the zoom
//      deepens slightly (6 → 8) for a closer arrival view.
//   3. LOCK-ON: the framing freezes — the camera never zooms back out. The
//      readout finishes and the Nexus dashboard opens.
//
// ── Why this doesn't lag ─────────────────────────────────────────────────
// The naive approach (setState per keyframe) re-renders the ENTIRE map tree
// — ~177 <Geography> paths get re-diffed and FlightPath re-projects 60
// points on every camera nudge, and the readout's per-character typing
// re-rendered the map every ~24ms on top. Instead:
//
//   • The camera is driven OUTSIDE React: one rAF loop writes the
//     `transform` attribute of the inner .rsm-zoomable-group <g> directly
//     (the same attribute react-simple-maps itself writes via state). Zero
//     re-renders during the flight — the map subtree renders exactly once.
//   • The traveling unit is a static HTML overlay pinned to the exact center
//     of the map area. It's always at screen-center by definition (the
//     camera centers on it), so it needs no per-frame updates and no
//     counter-scale math — constant on-screen size for free.
//   • The terminal readout is its own component, so its typing state
//     re-renders only the little text box, never the SVG.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  useMapContext,
} from 'react-simple-maps';

// Structural type for the d3-geo projection react-simple-maps exposes via
// useMapContext (declared locally because @types/d3-geo isn't installed —
// d3-geo itself ships as an untyped transitive dependency).
interface GeoProjection {
  (point: [number, number]): [number, number] | null;
}

// Origin (Ghaziabad, UP) and target (VIT Vellore, TN)
const GHAZIABAD: [number, number] = [77.4538, 28.6692];
const VELLORE: [number, number] = [79.1559, 12.9692];

// Camera zooms: world view → flight framing (dive), deepening gently to the
// lock-on framing as the unit approaches Vellore. The camera only ever zooms
// IN — after arrival the framing freezes until the dashboard opens.
const ZOOM_START = 1;
const ZOOM_FLIGHT = 6;
const ZOOM_END = 8;

// Lightweight world TopoJSON (~110KB gzipped, CDN-cached)
const WORLD_TOPO_JSON = 'https://unpkg.com/world-atlas@2.0.2/countries-110m.json';

// Terminal readout — typed out character by character
const READOUT_LINES = [
  '> SATELLITE_LINK_ESTABLISHED',
  '> SCANNING_SECTOR_7...',
  '> SIGNAL_DETECTED: VIT, VELLORE, TN',
  '> TARGET_ACQUIRED',
];

const TYPE_INTERVAL_MS = 24;     // per character
const LINE_PAUSE_MS = 350;       // pause between lines
const HOLD_BEFORE_EXIT_MS = 1800; // hold the arrival framing before the dashboard

// Camera timeline, in ms from mount:
const DIVE_START = 300;    // beat before the dive onto Ghaziabad
const DIVE_MS = 1500;      // duration of the dive (the only zoom-in move)
const GLIDE_START = 2100;  // fires just as the dive completes
const GLIDE_MS = 3000;     // duration of the glide to Vellore
const SEQ_END = GLIDE_START + GLIDE_MS;

// ease-in-out for both moves: slow departure, fast middle, gentle arrival
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// ── The flight path, defined ONCE in geo space ──────────────────────────
// Quadratic Bézier from Ghaziabad to Vellore, bowed perpendicular to the
// chord. Both the dotted line AND the camera's glide are sampled from this
// one curve, so the reticle traces the drawn path exactly.
const D_LON = VELLORE[0] - GHAZIABAD[0];
const D_LAT = VELLORE[1] - GHAZIABAD[1];
const GEO_LEN = Math.hypot(D_LON, D_LAT) || 1;
const BOW = GEO_LEN * 0.22;
const CONTROL: [number, number] = [
  (GHAZIABAD[0] + VELLORE[0]) / 2 + (D_LAT / GEO_LEN) * BOW,
  (GHAZIABAD[1] + VELLORE[1]) / 2 - (D_LON / GEO_LEN) * BOW,
];

// Point on the flight arc at t ∈ [0, 1]
const qBezier = (t: number): [number, number] => {
  const u = 1 - t;
  return [
    u * u * GHAZIABAD[0] + 2 * u * t * CONTROL[0] + t * t * VELLORE[0],
    u * u * GHAZIABAD[1] + 2 * u * t * CONTROL[1] + t * t * VELLORE[1],
  ];
};

interface TrackerMapProps {
  onTrackingComplete: () => void;
}

// The dotted trajectory, drawn as a polyline sampled from the SAME Bézier
// the camera follows — the reticle literally rides this line. Rendered once;
// it never re-renders during the flight (static geometry in map space).
function FlightPath() {
  const { projection } = useMapContext();
  if (!projection) return null;

  const SAMPLES = 60;
  const parts: string[] = [];
  for (let i = 0; i <= SAMPLES; i++) {
    const p = projection(qBezier(i / SAMPLES));
    if (!p) return null;
    parts.push(`${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`);
  }

  return (
    <path
      d={parts.join(' ')}
      fill="none"
      stroke="#00F2F2"
      strokeWidth={1.25}
      strokeDasharray="6 4"
      vectorEffect="non-scaling-stroke"
      className="flight-path"
    />
  );
}

// Reports the map's projection + viewport size up to the parent exactly once
// (after ComposableMap has measured and built the projection), so the rAF
// camera driver can compute screen-space transforms without any re-render.
// Renders null — pure side channel.
function ProjectionProbe({ onReady }: { onReady: (v: { projection: GeoProjection; width: number; height: number }) => void }) {
  const { projection, width, height } = useMapContext();
  const reported = useRef(false);
  useEffect(() => {
    if (!reported.current && projection && width && height) {
      reported.current = true;
      onReady({ projection, width, height });
    }
  }, [projection, width, height, onReady]);
  return null;
}

// The terminal readout, isolated in its own component so its per-character
// typing state re-renders ONLY this text box — the map SVG above never
// re-renders while the readout types.
function TerminalReadout({ onDone }: { onDone: () => void }) {
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const full = READOUT_LINES.join('\n');
    let char = 0;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => { if (!cancelled) fn(); }, ms);
      timers.push(t);
    };

    // Type one character; pause longer at line breaks so each readout
    // line lands discretely (total ≈ 4s for the full sequence)
    const typeNext = () => {
      if (char >= full.length) {
        setDone(true);
        onDone();
        return;
      }
      const next = full[char];
      char += 1;
      setTyped(full.slice(0, char));
      const atLineBreak = next === '\n';
      later(typeNext, atLineBreak ? LINE_PAUSE_MS : TYPE_INTERVAL_MS);
    };

    later(typeNext, 400); // brief beat after the map appears
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <div
      className="bg-[#030712]/85 border border-[#00F2F2]/50 rounded px-3 py-2 text-[10px] md:text-xs leading-relaxed tracking-wider whitespace-pre-line"
      style={{ textShadow: '0 0 6px rgba(0,242,242,0.6)' }}
    >
      {typed}
      {!done && <span className="inline-block w-[7px] h-[13px] ml-0.5 align-middle bg-[#00F2F2] animate-pulse" />}
    </div>
  );
}

// The traveling unit as a static HTML overlay. The camera always centers on
// the unit, so "stays exactly at screen center" IS the animation — zero
// per-frame work, constant on-screen size, no SVG counter-scale math.
function TravelingUnit() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <svg width="60" height="60" viewBox="-30 -30 60 60" style={{ filter: 'drop-shadow(0 0 6px rgba(0,242,242,0.5))' }}>
        {/* Cyan acquisition ring */}
        <circle r={10} fill="#00F2F2" fillOpacity={0.25} className="animate-ping" />
        {/* Spidey logo — fixed 16×16 screen pixels */}
        <image href="/spideyIcon.png" width={16} height={16} x={-8} y={-8} preserveAspectRatio="xMidYMid meet" />
        {/* Crosshair brackets + ticks — attached to the logo, one unit */}
        <path
          d="M -15 0 L -11 0 M 15 0 L 11 0 M 0 -15 L 0 -11 M 0 15 L 0 11"
          stroke="#00F2F2"
          strokeWidth={1.25}
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function TrackerMap({ onTrackingComplete }: TrackerMapProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [done, setDone] = useState(false);

  // Keep the latest callback without retriggering any effect
  const completeRef = useRef(onTrackingComplete);
  completeRef.current = onTrackingComplete;

  // Fires once when the readout finishes — the only parent re-render after
  // mount (the map tree itself is untouched: React diffs vdom-to-vdom and
  // the camera is driven outside React entirely).
  const handleDone = useCallback(() => {
    setDone(true);
    setTimeout(() => completeRef.current(), HOLD_BEFORE_EXIT_MS);
  }, []);

  // Projection + viewport, reported once by the probe inside the map.
  const probeRef = useRef<{ projection: GeoProjection; width: number; height: number } | null>(null);
  const handleProbe = useCallback((v: { projection: GeoProjection; width: number; height: number }) => {
    probeRef.current = v;
  }, []);

  // ── THE CAMERA DRIVER — pure DOM, zero re-renders ─────────────────────
  // One rAF loop walks the timeline and writes the transform attribute of
  // the inner .rsm-zoomable-group <g> — the exact same attribute (and math:
  // x = px * k, translate(W/2 − x, H/2 − y) scale(k)) react-simple-maps
  // itself writes through React state. Bypassing React means the ~177-path
  // map subtree is never re-diffed mid-flight, which is what caused the lag.
  // isMounted + cleanup make this Strict-Mode-proof (React dev mounts,
  // cleans up, remounts — without the guard, orphan loops would fight).
  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const applyTransform = (center: [number, number], k: number) => {
      const probe = probeRef.current;
      const g = rootRef.current?.querySelector('.rsm-zoomable-group');
      if (!probe || !g || !probe.projection) return;
      const p = probe.projection(center);
      if (!p) return;
      const x = p[0] * k;
      const y = p[1] * k;
      g.setAttribute('transform', `translate(${probe.width / 2 - x} ${probe.height / 2 - y}) scale(${k})`);
    };

    const step = (now: number) => {
      const e = now - start;

      if (e < DIVE_START) {
        applyTransform(GHAZIABAD, ZOOM_START); // hold world view
      } else if (e < DIVE_START + DIVE_MS) {
        // Move 1 — the ONLY zoom-in: dive onto Ghaziabad
        const t = easeInOut((e - DIVE_START) / DIVE_MS);
        applyTransform(GHAZIABAD, ZOOM_START + (ZOOM_FLIGHT - ZOOM_START) * t);
      } else if (e < GLIDE_START) {
        applyTransform(GHAZIABAD, ZOOM_FLIGHT); // hold the dive framing
      } else if (e < SEQ_END) {
        // Move 2 — the glide: ride the dotted arc, zoom deepening 6 → 8
        const t = easeInOut((e - GLIDE_START) / GLIDE_MS);
        applyTransform(qBezier(t), ZOOM_FLIGHT + (ZOOM_END - ZOOM_FLIGHT) * t);
      } else {
        // Move 3 — lock-on: freeze at arrival. No zoom-out, ever.
        applyTransform(VELLORE, ZOOM_END);
        return; // stop the loop — the framing is held
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={rootRef}
      className="fixed inset-0 z-20 flex flex-col"
      style={{ animation: 'tracker-in 0.5s ease-out both' }}
      aria-label="Satellite tracking sequence"
    >
      {/* CRT tint + scanlines — translucent so the CSS starfield shows through */}
      <div className="absolute inset-0 bg-[#030712]/70 scanline opacity-60 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b-2 border-[#00F2F2] bg-[#0B1B3C]/60">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-2 h-2 md:w-3 md:h-3 shrink-0 bg-[#00F2F2] animate-pulse shadow-[0_0_10px_#00F2F2]" />
          <h1 className="font-press-start text-[#00F2F2] text-[7px] sm:text-[10px] md:text-sm tracking-wider uppercase text-shadow-cyan truncate">
            [ORBITAL_TRACKING_SYS v2.0]
          </h1>
        </div>
        <div className="text-[#8BF0F0] text-[10px] md:text-xs tracking-widest shrink-0 pl-2">
          SAT.LINK // ACTIVE
        </div>
      </header>

      {/* Map — fills the screen, floating over the starfield. The React tree
          renders ONCE: the camera runs on the rAF loop above, writing the
          zoomable group's transform attribute directly. */}
      <div className="relative z-10 flex-1 min-h-0">
        <ComposableMap
          projection="geoEquirectangular"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          {/* Constant props — the sync effect inside ZoomableGroup only runs
              once (on mount) to lay out the initial world view; after that
              the rAF loop owns the transform attribute exclusively. */}
          <ZoomableGroup center={GHAZIABAD} zoom={ZOOM_START}>
            <ProjectionProbe onReady={handleProbe} />

            <Geographies geography={WORLD_TOPO_JSON}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#0B1B3C"
                    stroke="#00F2F2"
                    strokeWidth={0.5}
                    // hover/pressed states disabled — this is a cinematic, not a UI
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#0B1B3C' },
                      pressed: { outline: 'none', fill: '#0B1B3C' },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Tracking trajectory — the exact arc the camera rides */}
            <FlightPath />

            {/* Origin trace at Ghaziabad — static in map space; the unit
                overlays it at the start, then departs leaving it behind.
                Fixed 1/ZOOM_END counterscale ≈ arrival size (4.5–6px ring). */}
            <Marker coordinates={GHAZIABAD}>
              <g transform={`scale(${1 / ZOOM_END})`}>
                <circle r={6} fill="none" stroke="#8BF0F0" strokeWidth={0.75} strokeDasharray="2 2" />
                <circle r={1.75} fill="#8BF0F0" />
              </g>
            </Marker>

            {/* Destination beacon at VIT Vellore — the unit lands on this. */}
            <Marker coordinates={VELLORE}>
              <g transform={`scale(${1 / ZOOM_END})`}>
                <circle r={12} fill="none" stroke="#00F2F2" strokeWidth={0.75} strokeDasharray="3 3" opacity={0.7} />
              </g>
            </Marker>
          </ZoomableGroup>
        </ComposableMap>

        {/* The traveling unit — crosshair + Spidey + ring, pinned dead-center.
            The camera centers on it, so this static overlay IS the flight. */}
        <TravelingUnit />
      </div>

      {/* Terminal readout — bottom-left overlay (isolated component; typing
          re-renders only this box, never the map) */}
      <div className="font-['JetBrains_Mono'] text-[#00F2F2] absolute left-3 bottom-3 md:left-6 md:bottom-6 z-10 pointer-events-none">
        <TerminalReadout onDone={handleDone} />
      </div>

      {/* Status footer */}
      <footer className="relative z-10 px-4 py-2 border-t border-[#00F2F2]/40 bg-[#0B1B3C]/60 text-[10px] md:text-xs text-[#8BF0F0] tracking-widest flex justify-between">
        <span>ORIGIN 28.6692°N 77.4538°E // TARGET 12.9692°N 79.1559°E</span>
        <span className={done ? 'text-[#00F2F2] animate-pulse' : ''}>
          {done ? 'ENGAGING_INTERFACE...' : 'TRACING...'}
        </span>
      </footer>

      <style>{`
        @keyframes tracker-in {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        /* Marching-ants flow along the flight path */
        @keyframes dash-flow {
          to { stroke-dashoffset: -20; }
        }
        .flight-path {
          animation: dash-flow 1.2s linear infinite;
        }
      `}</style>
    </section>
  );
}
