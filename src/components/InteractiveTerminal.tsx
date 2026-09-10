import { useEffect, useRef, useState } from 'react';
import resumeUrl from '../assets/resume.pdf';

type Line = { type: 'input' | 'output'; text: string };

const COMMANDS: Record<string, string> = {
  '/help': 'Available commands: /resume, /skills, /education, /location, /experience, /projects, /awards, /contact, /whoami, /clear',
  '/location': 'Origin: Ghaziabad, Uttar Pradesh. Current Base: Vellore, Tamil Nadu.',
  '/education': 'B.Tech CSE (Business Systems) @ Vellore Institute of Technology (CGPA: 9.08). High School @ Ralli International School (93.8%).',
  '/skills': 'Languages: Python, Java, C/C++, SQL, Golang. ML: TensorFlow, Torch, YOLOv11, OpenCV. Backend/Infra: FastAPI, Django, PostgreSQL, Redis, Docker, Kubernetes (KEDA).',
  '/experience': 'AI/ML Engineering Intern @ KalkiFI AI Solutions (Sept 2024 - Sept 2025) | Tech - Python @ Google Developer Groups, VIT (Apr 2025 - Present).',
  '/projects': 'Key Archives: VCAP (VIT Capstone Portal), SthiraSense (Stablecoin ML), Float Chat (Oceanographic RAG), Dhadkan (Live ECG CNN).',
  '/awards': 'Commendations: 1st Place @ VIT Yantra 26 (Fintech Track), 1st Place @ AgriHack, Finalist @ Smart India Hackathon 25.',
  '/contact': 'Comms: robomaneet@gmail.com | +91-7982076022 | GitHub: RK-NerdyBirdy',
  '/whoami': 'Maneet Gupta. AI/ML Engineering Intern building scalable pipelines, distributed backends, and real-time inference engines.',
  '/resume': 'Initiating extraction protocol... (Please use the [ EXTRACT_RESUME.PDF ] button in the sidebar to download).',
};

export default function InteractiveTerminal() {
  const [history, setHistory] = useState<Line[]>([
    { type: 'output', text: 'NEXUS OS v1.0. Type /help to view commands.' },
  ]);
  const [input, setInput] = useState('');
  // Command history for Up/Down arrow traversal
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history]);

  const runCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    const entry: Line = { type: 'input', text: raw };

    if (cmd === '/clear') {
      setHistory([]);
      return;
    }

    let output: string;
    if (cmd === '/resume') {
      output = 'Extracting file...';
      window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    } else if (COMMANDS[cmd]) {
      output = COMMANDS[cmd];
    } else {
      output = 'Command not recognized. Type /help.';
    }

    setHistory((h) => [...h, entry, { type: 'output', text: output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      runCommand(input);
      // Record the executed command and reset traversal to "below the oldest"
      const trimmed = input.trim();
      if (trimmed) {
        setCommandHistory((h) => [...h, trimmed]);
        setHistoryIndex(-1);
      }
      setInput('');
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault(); // stop the input from scrolling or moving the caret
      if (commandHistory.length === 0) return;
      // First press starts at the newest command (index length-1)
      const next = historyIndex === -1
        ? commandHistory.length - 1
        : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setInput(commandHistory[next]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const next = historyIndex + 1;
      if (next >= commandHistory.length) {
        // Walked off the end of history — clear the input
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(next);
        setInput(commandHistory[next]);
      }
    }
  };

  return (
    <section className="mb-4 shrink-0">
      <div className="font-press-start text-[#00F2F2] text-[8px] md:text-[10px] tracking-widest ">
       <h2
  className="text-[#00F2F2] text-sm md:text-base tracking-widest font-bold mb-2 uppercase shrink-0"
  style={{ fontFamily: 'var(--font-jetbrains)', textShadow: '0 0 8px rgba(0,242,242,0.6)' }}
>
  &gt; INTERROGATION_PROTOCOL // MANEET_GUPTA
</h2>
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        className="border-2 border-[#00F2F2] bg-black rounded shadow-[0_0_15px_rgba(0,242,242,0.25)] cursor-text"
      >
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-[#00F2F2]/40 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#00F2F2]/80" />
          <span
            className="ml-2 text-[#8BF0F0] text-xs"
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            nexus@shell
          </span>
        </div>

        {/* Scrollback + input */}
        <div
          ref={scrollRef}
          className="p-3 max-h-[260px] overflow-y-auto custom-scrollbar text-sm leading-relaxed"
          style={{ fontFamily: 'var(--font-jetbrains)' }}
        >
          {history.map((line, i) => (
            <div key={i} className={line.type === 'input' ? 'text-[#8BF0F0]' : 'text-[#00F2F2]'}>
              {line.type === 'input' ? (
                <span>
                  <span className="text-[#00F2F2]">$ </span>
                  {line.text}
                </span>
              ) : (
                line.text
              )}
            </div>
          ))}

          {/* Prompt line */}
          <div className="flex items-center">
            <span className="text-[#00F2F2] mr-1 shrink-0">$</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck={false}
              className="bg-transparent outline-none text-[#00F2F2] w-full text-base md:text-sm"
              style={{ fontFamily: 'var(--font-jetbrains)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
