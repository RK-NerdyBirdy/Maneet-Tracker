import { useState, useCallback, useEffect, useRef } from 'react';
import { audioEngine } from '@/audio';

// Base badge (the "container" holding Spidey) — served from public/ so Vite
// copies it verbatim, never hashed. The head-turn sprite layers on top of it.
// BASE_URL keeps the path correct under subpath deploys.
const CONTAINER_URL = `${import.meta.env.BASE_URL}SpiderMan_Container.png`;

// Spidey-style quips tied to the profile behind this portfolio
const quotes = [
  // The Classics (AI & Tech)
  "My Spidey-sense is tingling... someone's checking the AI archives.",
  "Web-shooters? Nah, I prefer Python and C++.",
  "With great compute power comes great model accuracy.",
  "Training neural nets is like learning to web-swing. Lots of crashing at first.",
  "Is my Spidey-sense tingling, or did my LangChain agent just hallucinate?",
  "My reflexes are fast, but FastAPI is faster.",
  "Docker containers... the ultimate web to keep my microservices safe.",
  
  // The Hacker / OS
  "I use Arch, by the way. Even my suit runs on Hyprland.",
  "Compiling a custom kernel is honestly tougher than fighting Doc Ock.",
  "Why fight the Green Goblin when you can fight segmentation faults in C++?",

  // Projects & Hackathons
  "FloatChat finalist... not bad for a friendly neighborhood engineer.",
  "SthiraSense predicted the depeg, but not how much coffee I'd need.",
  "WhereTF is that file? Oh right, I literally built a search engine for that.",
  "AgriHack, Yantra '26... am I becoming an Avenger of hackathons?",
  "Managing the VCAP portal is almost as chaotic as the multiverse.",

  // Life, Vellore & Chill
  "Training models by day, swinging through Vellore by night.",
  "Swinging around is exhausting. I could really use a veg thali on a train right now.",
  "A trek in Nag Tibba sounds way better than debugging this pipeline.",
  "Need a break from the terminal... time to drift in Forza Horizon 5.",
  "Nothing beats a good Paneer Butter Masala after a long day of coding."
];

const QUOTE_VISIBLE_MS = 5000;   // each quip stays up for 5s

export default function CornerAvatar({ className = 'absolute -bottom-2 -left-2 z-[9999]' }: { className?: string }) {
  const [bouncing, setBouncing] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [quote, setQuote] = useState('');
  
  // Use a ref to track the timeout so rapid clicks don't cause overlap glitches
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup the timer if the component unmounts while a bubble is showing
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    // 1. Play audio and bounce
    audioEngine.playEffect(0.4);
    setBouncing(true);

    // 2. Trigger a random quote
    const next = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(next);
    setShowBubble(true);

    // 3. Reset the hide timer
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setShowBubble(false), QUOTE_VISIBLE_MS);
  }, []);

  const handleAnimEnd = useCallback(() => setBouncing(false), []);

  return (
    <div className={className}>
      
      {/* ── Comic Style Thought Bubble ────────────────────────────────────── */}
      <div
        className={`absolute bottom-16 left-8 w-48 p-3 border-2 border-black bg-white rounded-3xl z-[100000] transition-all duration-300 pointer-events-none shadow-xl ${
          showBubble ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        role="status"
        aria-live="polite"
      >
        <p
          className="text-black text-xs leading-snug font-bold tracking-wide text-center"
          style={{ fontFamily: 'var(--font-jetbrains)' }}
        >
          {quote}
        </p>
        
        {/* Thought bubble trail (Medium circle) */}
        <div className="absolute -bottom-3 left-6 w-5 h-5 bg-white border-2 border-black rounded-full z-[-1]"></div>
        
        {/* Thought bubble trail (Small circle) */}
        <div className="absolute -bottom-7 left-2 w-3 h-3 bg-white border-2 border-black rounded-full z-[-1]"></div>
      </div>

      {/* ── The sprite badge ────────────────────────────────────────────── */}
      <div
        onClick={handleClick}
        onAnimationEnd={handleAnimEnd}
        title="Click me!"
        className={`size-full select-none cursor-pointer ${bouncing ? 'spidey-bounce' : ''}`}
        style={{
          width: 48,
          height: 48,
          backgroundImage: `url(${CONTAINER_URL})`,
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      >
        {/* Head-turn sprite */}
        <div
          className="head-turn-sprite"
          style={{
            position: 'absolute',
            top: -6,
            left: 5,
            pointerEvents: 'none',
            backgroundImage: `url(${import.meta.env.BASE_URL}SpiderMan_HeadTurn.png)`,
          }}
        />
      </div>
    </div>
  );
}