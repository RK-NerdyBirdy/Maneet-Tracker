import { useState, useEffect } from 'react';
import LandingLoader from './components/LandingLoader';
import TrackerMap from './components/TrackerMap';
import NexusDashboard from './components/NexusDashboard';
import ClickSpark from './components/ClickSpark';
import TargetCursor from './components/TargetCursor';

// Epoch clock — starts at Sept 21 2006 02:22:00 and ticks forward from page load
const EPOCH_START = new Date(2006, 8, 21, 2, 22, 0).getTime();
const SESSION_START = Date.now();

// Cinematic sequence stages: 0 = boot loader, 1 = satellite tracking, 2 = dashboard
const STAGE_BOOT = 0;
const STAGE_TRACKING = 1;
const STAGE_DASHBOARD = 2;

export default function App() {
  const [stage, setStage] = useState(STAGE_BOOT);
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date(EPOCH_START + (Date.now() - SESSION_START));
      const pad = (n: number) => String(n).padStart(2, '0');
      setTime(
        `${d.getFullYear()}:${pad(d.getMonth() + 1)}:${pad(d.getDate())}:${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    /* Root: starfield ground, relative + overflow-hidden so the fixed star layers
       never bleed past the viewport or create scroll */
    <div className="relative overflow-hidden w-full min-h-screen bg-[#030712]">
      {/* Pure-CSS starfield — two static layers, zero JS canvas cost.
         ::before = dense small stars, ::after = sparse large stars. */}
      <div className="starfield fixed inset-0 z-0 pointer-events-none" aria-hidden="true" />

      {/* Interactive shell — z-10 sits above the starfield */}
      <ClickSpark sparkColor="#00F2F2" sparkSize={12} sparkRadius={22} sparkCount={8} duration={500} extraScale={1.2}>
        <div className="relative z-10 min-h-screen">
          {/* Stage 0 — boot loader; hands off to the satellite tracker */}
          {stage === STAGE_BOOT && <LandingLoader onEnter={() => setStage(STAGE_TRACKING)} />}

          {/* Stage 1 — orbital tracking sequence; mounts the dashboard when done */}
          {stage === STAGE_TRACKING && <TrackerMap onTrackingComplete={() => setStage(STAGE_DASHBOARD)} />}

          {/* Stage 2 — the Nexus dashboard */}
          {stage === STAGE_DASHBOARD && <NexusDashboard time={time} />}
        </div>
      </ClickSpark>

      {/* React Bits TargetCursor — the spinning bracket reticle. Targets every
          interactive element in the app: links/buttons/inputs/tabs, the
          terminal (cursor-text), Folders (role="button"), and OptionWheel
          options (role="option"). Its brackets snap around them on hover.
          Mobile is handled inside the component (returns null). */}
      <TargetCursor
        spinDuration={2}
        targetSelector="a, button, input, textarea, [role='tab'], [role='button'], [role='option'], .cursor-pointer, .cursor-text"
        cursorColorOnTarget="#00F2F2"
      />
    </div>
  );
}
