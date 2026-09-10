import { useState, useEffect } from 'react';
import { audioEngine } from '@/audio';
import HangingSpidey from './HangingSpidey';
import ScrambledText from './ScrambledText';

export default function LandingLoader({ onEnter }: { onEnter: () => void }) {
  const [progress, setProgress] = useState(0);
  const [loadDone, setLoadDone] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let cur = 0;
    const id = setInterval(() => {
      cur += Math.random() * 2.4 + 0.4;
      if (cur >= 100) {
        cur = 100;
        clearInterval(id);
        setTimeout(() => setLoadDone(true), 300);
      }
      setProgress(Math.floor(cur));
    }, 45);
    return () => clearInterval(id);
  }, []);

  const handleEnter = () => {
    if (!loadDone) return;
    setExiting(true);
    audioEngine.play(2000, 0.5);
    setTimeout(onEnter, 660);
  };

  return (
    <div
      className={`fixed inset-0 bg-[#0B1B3C] pixel-grid flex flex-col items-center overflow-hidden z-50 ${exiting ? 'crt-off' : ''}`}
    >
      {/* scanline layer */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-30 mix-blend-overlay" />

      {/* CRT vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 78% 78% at 50% 50%, transparent 46%, rgba(0,0,0,0.78) 100%)' }}
      />

      {/* corner brackets */}
      <div className="absolute top-4 left-4  w-14 h-14 border-t-2 border-l-2 border-[#00F2F2] z-10" />
      <div className="absolute top-4 right-4 w-14 h-14 border-t-2 border-r-2 border-[#00F2F2] z-10" />
      <div className="absolute bottom-4 left-4  w-14 h-14 border-b-2 border-l-2 border-[#00F2F2] z-10" />
      <div className="absolute bottom-4 right-4 w-14 h-14 border-b-2 border-r-2 border-[#00F2F2] z-10" />

      {/* edge lines */}
      <div className="absolute top-0 inset-x-0 h-px bg-[#00F2F2] opacity-25" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-[#00F2F2] opacity-25" />

      {/* ── Spidey drops in from the ceiling on boot ──
          Anchored to the top edge; the whole web line + sprite slides down
          (slideDown keyframes) like the web is being spun out. */}
      <HangingSpidey className="animate-[slideDown_1s_ease-out_forwards]" />

      {/* ── CONTENT — boot sequence + progress bar, below the hanging Spidey ── */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center pt-[50vh]">

        {/* text block — group so hovering the block "scans" the status lines */}
        <div className="group space-y-4">
          <h1 className="font-press-start text-white text-xs sm:text-sm leading-loose tracking-wide">
            <ScrambledText
              radius={80}
              duration={1}
              speed={0.3}
              scrambleChars="!<>-_\\/[]{}—=+*^?#"
              style={{
                margin: 0,
                display: 'inline-block',
                maxWidth: 'none',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                fontFamily: 'inherit',
                color: 'inherit',
              }}
            >
              WELCOME TO THE MANEET TRACKER
            </ScrambledText>
          </h1>
          <p className="font-press-start text-[#8BF0F0] group-hover:text-[#00F2F2] text-[9px] sm:text-[10px] leading-loose opacity-80 transition-colors duration-300">
            // INITIATING NEURAL LINK...
          </p>
          <p className="font-press-start text-[#8BF0F0] group-hover:text-[#00F2F2] text-[9px] sm:text-[10px] leading-loose opacity-80 transition-colors duration-300">
            // ACCESSING AI/ML ARCHIVES.
          </p>
        </div>

        {/* loading bar */}
        <div className="w-full max-w-xs">
          <div className="border-2 border-[#00F2F2] p-1 mb-1.5">
            <div
              className="h-4 bg-[#00F2F2] relative overflow-hidden"
              style={{ width: `${progress}%`, transition: 'width 0.07s linear' }}
            >
              <div
                className="absolute inset-y-0 w-6 bg-white opacity-25"
                style={{ animation: 'loader-shimmer 1.2s linear infinite' }}
              />
            </div>
          </div>
          <div className="flex justify-between font-press-start text-[7px] sm:text-[8px] text-[#8BF0F0]">
            <span>SYSTEM BOOT</span>
            <span>{String(progress).padStart(3, '0')}%</span>
          </div>
        </div>

        {/* initialize button */}
        <button
          onClick={handleEnter}
          disabled={!loadDone}
          data-magnetic
          className={`font-press-start text-[9px] sm:text-[10px] border-2 px-6 py-4 leading-relaxed transition-all duration-300
            ${loadDone
              ? 'border-[#00F2F2] text-[#00F2F2] cursor-pointer hover:bg-[#00F2F2]/10 hover:text-white hover:border-white glow-btn'
              : 'border-[#1E3A8A] text-[#1E3A8A] cursor-not-allowed opacity-40'
            }`}
        >
          [ INITIALIZE SYSTEM // SOUND ON ]
        </button>
      </div>
    </div>
  );
}
