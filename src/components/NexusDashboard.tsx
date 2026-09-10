import { useCallback, useRef, useState } from 'react';
import { LayoutDashboard, FolderGit2, Cpu, RadioTower, Trophy } from 'lucide-react';
import emailjs from '@emailjs/browser';
import ReCAPTCHA from 'react-google-recaptcha';
import { GitHubCalendar } from 'react-github-calendar';
import OptionWheel from './OptionWheel';
import Folder from './Folder';
import CornerAvatar from './CornerAvatar';
import InteractiveTerminal from './InteractiveTerminal';
import ArchiveOverlay from './ArchiveOverlay';
import resumeUrl from '../assets/resume.pdf';

const PANELS = ['Overview','Awards', 'Projects', 'Skills', 'Comm Link'] as const;
type Panel = typeof PANELS[number];

const PANEL_ICONS: Record<Panel, typeof LayoutDashboard> = {
  Overview: LayoutDashboard,
  Projects: FolderGit2,
  Skills: Cpu,
  Awards: Trophy,
  'Comm Link': RadioTower,
};

// ── Panel: Overview — retro vertical timeline ──────────────────────────────────
// Each timeline entry can carry a `certificate` path under /certificates/
// (public/certificates/*.pdf) — the [ VERIFY_RECORD ] link renders only for
// entries that have one, mirroring the Awards panel's verification links.
function OverviewPanel() {
  const timeline = [
    {
      role: 'SENIOR CORE || TECH - PYTHON',
      org: 'Google Developer Groups, VIT',
      period: 'APR 2025 — PRESENT',
      primary: true,
      bullets: [
        'Selected for the Python domain out of a highly competitive pool of 3,950+ campus-wide applicants',
        'Engineered an automated MCQ grading system deployed across GDG recruitment, processing 6,000+ submissions',
        'Built backend for HEXATHON 26, one of the biggest designathons used by 300+ participants',
      ],
      tags: ['Python', 'Backend (FastAPI, Django, Azure functions)'],
      certificate: '/certificates/gdg-vit.pdf',

    },
    {
      role: 'AI/ML ENGINEERING INTERN',
      org: 'KalkiFI AI Solutions Pvt. Ltd.',
      period: 'SEPT 2024 — SEPT 2025',
      primary: true,
      bullets: [
        'Architected an end-to-end violence detection pipeline by fine-tuning custom YOLOv11 models',
        'Deployed the real-time inference engine on AWS (EC2 + Lambda)',
        'Engineered a robust biometric attendance system leveraging FaceNet and ResNet architectures',
      ],
      tags: ['Python', 'YOLOv11', 'AWS', 'FaceNet', 'ResNet'],
      certificate: '/certificates/kalkifi-internship.pdf',
    },

  ];

  return (
    <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 h-full">
      <h2
  className="text-[#00F2F2] text-sm md:text-base tracking-widest font-bold uppercase shrink-0"
  style={{ fontFamily: 'var(--font-jetbrains)', textShadow: '0 0 8px rgba(0,242,242,0.6)' }}
>
  &gt; FIELD LOG // TIMELINE_
</h2>

      {/* Interactive command terminal at the top of the Overview tab */}
      <InteractiveTerminal />

      {/* Timeline */}
      <div className="relative pl-8">
        {/* Vertical spine */}
        <div
          className="absolute left-3 top-0 bottom-0 w-px"
          style={{ background: 'linear-gradient(to bottom, #00F2F2, #1E3A8A 80%, transparent)' }}
        />

        <div className="flex flex-col gap-8">
          {timeline.map((entry, i) => (
            <div key={i} className="relative">
              {/* Node dot */}
              <div
                className="absolute -left-[21px] top-1 w-3 h-3 border-2 flex items-center justify-center"
                style={{
                  borderColor: entry.primary ? '#00F2F2' : '#1E3A8A',
                  background: entry.primary ? '#00F2F2' : '#0B1B3C',
                  boxShadow: entry.primary ? '0 0 12px #00F2F2, 0 0 24px rgba(0,242,242,0.3)' : 'none',
                }}
              />

              {/* Card */}
              <div
                className="border-l-2 pl-4 pb-2"
                style={{ borderColor: entry.primary ? '#00F2F2' : '#1E3A8A' }}
              >
                {/* Period badge */}
                <div
                  className="inline-block px-2 py-0.5 mb-2 text-[11px] tracking-widest border"
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    color: entry.primary ? '#00F2F2' : '#8BF0F0',
                    borderColor: entry.primary ? '#00F2F2' : '#1E3A8A',
                    background: entry.primary ? 'rgba(0,242,242,0.07)' : 'transparent',
                  }}
                >
                  {entry.period}
                </div>

                {/* Role */}
                <div
                  className="text-white mb-0.5 tracking-wider leading-relaxed font-bold"
                  style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '15px' }}
                >
                  {entry.role}
                </div>

                {/* Org */}
                <div
                  className="mb-3 text-lg tracking-wide"
                  style={{ fontFamily: 'var(--font-jetbrains)', color: '#8BF0F0' }}
                >
                  @ {entry.org}
                </div>

                {/* Bullets */}
                <ul className="flex flex-col gap-1.5 mb-3">
                  {entry.bullets.map((b, bi) => (
                    <li
                      key={bi}
                      className="flex items-start gap-2 text-base leading-snug font-medium text-white"
                      style={{ fontFamily: 'var(--font-jetbrains)' }}
                    >
                      <span className="text-[#00F2F2] shrink-0 mt-0.5">▸</span>
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-sm border"
                      style={{
                        fontFamily: 'var(--font-jetbrains)',
                        color: '#00F2F2',
                        borderColor: 'rgba(0,242,242,0.35)',
                        background: 'rgba(0,242,242,0.05)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Certificate verification link — same treatment as the Awards
                    panel's [ VERIFY_RECORD ] links; opens the certificate PDF
                    in a new tab */}
                {entry.certificate && (
                  <a
                    href={entry.certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs px-2 py-1 border border-[#00F2F2]/40 text-[#00F2F2] hover:bg-[#00F2F2] hover:text-[#0B1B3C] transition-all tracking-widest"
                  >
                    [ VERIFY_RECORD ]
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Origin node */}
          <div className="relative -mt-2">
            <div
              className="absolute -left-[21px] top-1 w-3 h-3 border-2 border-[#1E3A8A]"
              style={{ background: '#0B1B3C' }}
            />
            <div
              className="text-base text-[#1E3A8A] pl-4"
              style={{ fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.08em' }}
            >
              [ ORIGIN NODE — INITIALIZING... ]
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator — Overview only, so it never overlaps the Comm Link
          transmit button. Sticky to the bottom of the scrollable panel. */}
      <div className="sticky bottom-0 left-0 right-0 flex justify-center pointer-events-none">
        <span
          className="animate-pulse text-[#00F2F2] text-[10px] pb-0.5 tracking-widest"
          style={{ fontFamily: 'var(--font-jetbrains)', textShadow: '0 0 8px #00F2F2' }}
        >
          ▼ SCROLL ARCHIVES
        </span>
      </div>
    </div>
  );
}

// ── Panel: Projects ─────────────────────────────────────────────────────────────
function ProjectsPanel() {
  // 1. Add 'sourceLink' and 'liveLink' to your project objects
  const projects = [
    {
      codename: 'VCAP',
      subtitle: 'VIT Capstone Portal',
      status: 'DEPLOYED',
      desc: 'Digitized and standardized Capstone submissions for the School of Computer Science (SCOPE) at VIT, replacing fragmented manual workflows with a centralized platform that unified project tracking, automated report generation, and academic scoring.',
      tags: ['FastAPI', 'PostgreSQL', 'Redis', 'Latex'],
      accent: '#00F2F2',
      liveLink: 'vcap.vit.ac.in', // Leave empty if there is no live link
    },
    {
      codename: 'WHERETF',
      subtitle: 'Semantic File Search System',
      status: 'ACTIVE',
      desc: 'Semantic file search system supporting text and vision embeddings with hybrid keyword search. Includes multi-tier deployment options and Docker configuration.',
      tags: ['Python', 'PostgreSQL/pgvector', 'Docker','RAG'],
      accent: '#00F2F2',
      sourceLink: 'https://github.com/GDGVIT/WhereTF-backend',
      liveLink: 'https://github.com/GDGVIT/WhereTF-backend',
    },
    {
      codename: 'STHIRASENSE',
      subtitle: 'Stablecoin Depeg Prediction',
      status: 'ARCHIVED',
      desc: 'A comprehensive machine learning module for predicting stablecoin depeg events [ with 92.21% precision ] and liquidity stress analysis across minute-level OHLCV data.',
      tags: ['Python', 'XGBoost', 'Scikit-Learn', 'Pandas'],
      accent: '#8BF0F0',
      sourceLink: 'https://github.com/RK-NerdyBirdy/SthiraSense-ML',
      liveLink: '',
    },
    {
      codename: 'DHADKAN',
      subtitle: 'Live ECG Classification',
      status: 'ARCHIVED',
      desc: 'Real-time ECG monitoring system for telemedicine. Ingests live WebSocket telemetry from an ESP32-connected sensor for on-the-fly signal filtering, utilizing a custom CNN pipeline that achieves 98% classification accuracy while generating automated diagnostic PDF reports.',
      tags: ['TensorFlow', 'ESP32', 'CNN','WebSockets'],
      accent: '#8BF0F0',
      sourceLink: 'https://github.com/RK-NerdyBirdy/Dhadkan',
      liveLink: '',
    },
    {
      codename: 'FLOATCHAT',
      subtitle: 'Oceanographic RAG Pipeline',
      status: 'ARCHIVED',
      desc: 'Reduced data retrieval to sub-second responses for 13GB of ARGO records. Built RAG pipeline using FastAPI + LangChain with a PostgreSQL vectorized database.',
      tags: ['FastAPI', 'LangChain', 'PostgreSQL/PGVector'],
      accent: '#00F2F2',
      sourceLink: 'https://github.com/SakD2006/floatchat',
      liveLink: '',
    },
    
    {
      codename: 'VITALS',
      subtitle: 'Internal hospital utility for VIT',
      status: 'ARCHIVED',
      desc: 'End-to-end encrypted patient data platform. Zero-knowledge record access, S3-backed media vault, Redis session layer, and HIPAA-aligned audit trails.',
      tags: ['Next.js', 'FastAPI', 'Redis', 'S3'],
      accent: '#8BF0F0',
      sourceLink: 'https://github.com/RK-NerdyBirdy/VITals',
      liveLink: '',
    },
    {
      codename: 'CropWise',
      subtitle: ' AI-driven smart farming platform',
      status: 'ARCHIVED',
      desc: 'AI-driven smart farming platform that leverages IoT, real-time data analytics, and machine learning to optimize crop selection, yield prediction, and resource management. By analyzing factors like terrain, moisture, weather, pH, and nutrient levels, it provides personalized crop recommendations to maximize productivity.',
      tags: ['IoT', 'Python', 'Weather API'],
      accent: '#00F2F2',
      sourceLink: 'https://github.com/vaibhavi0028/Crop-Wise',
      liveLink: '',
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto custom-scrollbar pr-1">
      <h2
        className="text-[#00F2F2] text-sm md:text-base tracking-widest shrink-0 font-bold"
        style={{ fontFamily: 'var(--font-jetbrains)', textShadow: '0 0 8px rgba(0,242,242,0.6)' }}
      >
        &gt; PROJECT ARCHIVES_
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items">
        {projects.map((p) => (
          <div
            key={p.codename}
            className="group relative flex flex-col border-2 bg-[#030a1a] hover:bg-[#0a1628] transition-all duration-200 cursor-pointer overflow-hidden"
            style={{ borderColor: '#00F2F2' }}
          >
            {/* Top accent bar */}
            <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${p.accent}, transparent)` }} />

            <div className="flex flex-col gap-3 p-4 flex-1">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className="text-white group-hover:text-[#00F2F2] transition-colors tracking-widest leading-relaxed font-bold"
                    style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '15px' }}
                  >
                    {p.codename}
                  </div>
                  <div
                    className="text-lg leading-tight mt-0.5"
                    style={{ fontFamily: 'var(--font-jetbrains)', color: '#8BF0F0', letterSpacing: '0.05em' }}
                  >
                    {p.subtitle}
                  </div>
                </div>
                <div
                  className="shrink-0 px-2 py-0.5 text-sm border"
                  style={{
                    fontFamily: 'var(--font-jetbrains)',
                    color: p.status === 'DEPLOYED' ? '#4ade80' : '#00F2F2',
                    borderColor: p.status === 'DEPLOYED' ? 'rgba(74,222,128,0.4)' : 'rgba(0,242,242,0.4)',
                    letterSpacing: '0.08em',
                  }}
                >
                  {p.status}
                </div>
              </div>

              {/* Description */}
              <p
                className="text-base leading-snug" 
                style={{ fontFamily: 'var(--font-jetbrains)', color: 'rgba(255,255,255,0.88)' }}
              >
                {p.desc}
              </p>

              {/* Tags */}
              {/* FIX: Changed 'mt-auto' to 'mt-4' for a fixed, clean margin */}
              <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t border-[#1E3A8A]">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-sm border"
                    style={{
                      fontFamily: 'var(--font-jetbrains)',
                      color: '#00F2F2',
                      borderColor: 'rgba(0,242,242,0.3)',
                      background: 'rgba(0,242,242,0.06)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 2. Conditionally render the Source and Live links */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {p.sourceLink && (
                  <a 
                    href={p.sourceLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white text-[#8BF0F0] text-sm underline z-10"
                  >
                    [/SOURCE]
                  </a>
                )}
                {p.liveLink && (
                  <a 
                    href={p.liveLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-white text-[#8BF0F0] text-sm underline z-10"
                  >
                    [/LIVE]
                  </a>
                )}
              </div>
            </div>

            {/* Corner decoration */}
            <div className="absolute bottom-0 right-0 w-6 h-6 border-t border-l border-[#00F2F2]/20 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Open-source commit matrix */}
      <section>
        <h3
          className="text-[#8BF0F0] mb-3 pb-1.5 border-b border-[#1E3A8A] tracking-widest font-bold"
          style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px' }}
        >
          &gt; COMMIT_LOG
        </h3>
        <div className="overflow-x-auto custom-scrollbar pb-1">
          <GitHubCalendar username="RK-NerdyBirdy" colorScheme="dark" />
        </div>
      </section>
    </div>
  );
}

// ── Panel: Skills ───────────────────────────────────────────────────────────────
function SkillsPanel() {
  const coreSkills = [
    {
      name: 'Python',
      pct: 95,
      detail: 'Primary language — ML pipelines, APIs, scripting',
      icon: '🐍',
    },
    {
      name: 'C / C++',
      pct: 85,
      detail: 'Systems programming, Core logic',
      icon: '⚙',
    },
    
    {
      name: 'Torch / TensorFlow',
      pct: 88,
      detail: 'Model training, CNNs, YOLOv11',
      icon: '🔥',
    },
    {
      name: 'PostgreSQL',
      pct: 90,
      detail: 'Schema design, query optimization, vector extensions',
      icon: '🗄',
    },
    {
      name: 'Docker / K8s',
      pct: 88,
      detail: 'Containerization, KEDA Autoscaling, deployments',
      icon: '🐳',
    },
  ];

  const extended = [
    { group: 'AI / ML', items: ['TensorFlow', 'Torch', 'Scikit-Learn', 'YOLOv11', 'LangChain', 'OpenCV', 'Pandas', 'XGBoost'] },
    { group: 'BACKEND', items: ['FastAPI', 'Flask', 'Django', 'Redis', 'PostgreSQL', 'SQL/PLSQL'] },
    { group: 'INFRA', items: ['Kubernetes (KEDA)', 'Docker', 'AWS (EC2+Lambda)', 'Azure Functions', 'Linux'] },
    { group: 'LANGUAGES', items: ['Python', 'C', 'C++','Java', 'Golang', 'R', 'HTML/CSS'] },
  ];

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar pr-1">
      <h2
        className="text-[#00F2F2] text-sm md:text-base tracking-widest shrink-0 font-bold"
        style={{ fontFamily: 'var(--font-jetbrains)', textShadow: '0 0 8px rgba(0,242,242,0.6)' }}
      >
        &gt; CORE ARCHITECTURE SKILLS_
      </h2>

      {/* Core skill bars */}
      <section className="flex flex-col gap-4">
        {coreSkills.map(({ name, pct, detail }) => (
          <div key={name} className="group">
            {/* Label row */}
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-center gap-3">
                <span
                  className="text-white group-hover:text-[#00F2F2] transition-colors tracking-widest font-bold"
                  style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '15px' }}
                >
                  {name}
                </span>
                <span
                  className="text-sm hidden sm:block"
                  style={{ fontFamily: 'var(--font-jetbrains)', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}
                >
                  // {detail}
                </span>
              </div>
              <span
                className="text-xl tabular-nums"
                style={{ fontFamily: 'var(--font-jetbrains)', color: '#00F2F2', letterSpacing: '0.02em' }}
              >
                {pct}%
              </span>
            </div>

            {/* Bar */}
            <div
              className="h-3 relative overflow-hidden border border-[#1E3A8A] group-hover:border-[#00F2F2]/50 transition-colors"
              style={{ background: '#030a1a' }}
            >
              {/* Fill */}
              <div
                className="h-full relative overflow-hidden"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #1E3A8A 0%, #00F2F2 100%)',
                  boxShadow: '0 0 10px rgba(0,242,242,0.4)',
                  transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                <div
                  className="absolute inset-y-0 w-6 bg-white/20"
                  style={{ animation: 'loader-shimmer 2.5s linear infinite' }}
                />
              </div>
              {/* Segment ticks */}
              {[20, 40, 60, 80].map((t) => (
                <div
                  key={t}
                  className="absolute top-0 bottom-0 w-px bg-[#0B1B3C]/80"
                  style={{ left: `${t}%` }}
                />
              ))}
              {/* Pct marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[#00F2F2]"
                style={{ left: `${pct}%`, boxShadow: '0 0 6px #00F2F2' }}
              />
            </div>
          </div>
        ))}
      </section>

      {/* Extended skill grid */}
      <section>
        <h3
          className="text-xl mb-3 pb-1.5 border-b border-[#1E3A8A] tracking-widest"
          style={{ fontFamily: 'var(--font-jetbrains)', color: '#8BF0F0' }}
        >
          // EXTENDED ARSENAL
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {extended.map(({ group, items }) => (
            <div key={group} className="border border-[#1E3A8A] bg-[#030a1a] p-3">
              <div
                className="text-sm mb-2 tracking-widest"
                style={{ fontFamily: 'var(--font-jetbrains)', color: '#00F2F2' }}
              >
                [{group}]
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="text-sm px-1.5 py-0.5 border border-[#1E3A8A] hover:border-[#00F2F2]/60 hover:text-[#00F2F2] transition-all cursor-default"
                    style={{ fontFamily: 'var(--font-jetbrains)', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Panel: Comm Link ────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// EmailJS + reCAPTCHA credentials from Vite env vars (see .env.example).
// No secrets in source — the public key and site key are public by design,
// and everything else lives server-side at EmailJS.
const SERVICE_ID       = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID      = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY       = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

// Config completeness — if the env vars are missing, the form explains
// itself instead of silently failing on send.
const CONFIGURED = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);

type FormFields = { callsign: string; freq: string; msg: string };
type FormErrors = Partial<Record<keyof FormFields, string>>;
type Status = 'idle' | 'sending' | 'success' | 'error';

function TermErr({ msg }: { msg: string }) {
  return (
    <p className="mt-1 text-red-500 text-lg leading-tight" style={{ fontFamily: 'var(--font-vt323)' }}>
      &gt; ERR: {msg}
    </p>
  );
}

function CommLinkPanel() {
  const [form, setForm]       = useState<FormFields>({ callsign: '', freq: '', msg: '' });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [status, setStatus]   = useState<Status>('idle');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Ref to the form element — lets the submit handler reset() it natively
  // on success (clears textarea rows, disabled state, etc. in one call).
  const formRef = useRef<HTMLFormElement>(null);
  // reCAPTCHA instance — resettable so an expired/failed challenge can be
  // retried without a remount.
  const captchaRef = useRef<ReCAPTCHA>(null);

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (form.callsign.trim().length < 2) e.callsign = 'CALLSIGN_REQUIRED';
    if (!EMAIL_REGEX.test(form.freq.trim()))   e.freq     = 'INVALID_FREQUENCY_FORMAT';
    if (form.msg.trim().length < 10)           e.msg      = 'TRANSMISSION_TOO_SHORT';
    return e;
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    // reCAPTCHA gate — no token, no transmission. The widget shows its own
    // expiry warning, so the form only states the requirement.
    if (!captchaToken) {
      setStatus('error');
      return;
    }

    setStatus('sending');

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        { callsign: form.callsign, freq: form.freq, message: form.msg },
        PUBLIC_KEY,
      );
      setStatus('success');
      setForm({ callsign: '', freq: '', msg: '' });
      formRef.current?.reset();
      // Clear the solved captcha so it must be re-solved for the next send
      setCaptchaToken(null);
      captchaRef.current?.reset();
    } catch {
      setStatus('error');
      captchaRef.current?.reset();
    }
  };

  const fieldClass = (key: keyof FormErrors) =>
    `w-full bg-[#0B1B3C] border px-3 py-2 text-lg text-[#8BF0F0] outline-none transition-colors ${
      errors[key] ? 'border-red-500' : 'border-[#1E3A8A] focus:border-[#00F2F2]'
    }`;

  const links = [
    { label: 'GITHUB',   handle: 'github.com/RK-NerdyBirdy',      href: 'https://github.com/RK-NerdyBirdy',           icon: '⬡' },
    { label: 'LINKEDIN', handle: 'linkedin.com/in/maneet-gupta', href: 'https://www.linkedin.com/in/maneet-gupta/',  icon: '⬡' },
    { label: 'EMAIL',    handle: 'robomaneet@gmail.com',          href: 'mailto:robomaneet@gmail.com',                icon: '⬡' },
    { label: 'X.com',  handle: '@Robo_maneet',                href: 'https://x.com/Robo_maneet',                icon: '⬡' },
  ];

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto custom-scrollbar pr-1">
      <h2
        className="text-[#00F2F2] text-sm md:text-base tracking-widest"
        style={{ fontFamily: 'var(--font-jetbrains)', textShadow: '0 0 8px rgba(0,242,242,0.6)' }}
      >
        &gt; COMM LINK_
      </h2>

      {/* Social links */}
      <section>
        <h3
          className="text-[#8BF0F0] mb-3 tracking-widest border-b border-[#1E3A8A] pb-1.5 font-bold"
          style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px' }}
        >
          // OPEN CHANNELS
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 border border-[#1E3A8A] px-3 py-3 hover:border-[#00F2F2] transition-all group"
            >
              <span className="text-[#00F2F2] text-sm group-hover:scale-110 transition-transform">{l.icon}</span>
              <div>
                <div
                  className="text-[#8BF0F0] tracking-widest mb-0.5 font-bold"
                  style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px' }}
                >
                  {l.label}
                </div>
                <div
                  className="text-base group-hover:text-[#00F2F2] transition-colors"
                  style={{ fontFamily: 'var(--font-jetbrains)', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}
                >
                  {l.handle}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Transmission form */}
      <section className="flex-1">
        <h3
          className="text-[#8BF0F0] mb-3 tracking-widest border-b border-[#1E3A8A] pb-1.5 font-bold"
          style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px' }}
        >
          // SEND TRANSMISSION
        </h3>

        {/* Env-var guard — explains a missing configuration up front rather
            than letting the send fail opaquely. Terminal-styled, in-theme. */}
        {!CONFIGURED && (
          <p className="mb-3 text-yellow-400 text-lg leading-tight" style={{ fontFamily: 'var(--font-vt323)' }}>
            &gt; ERR: TRANSMITTER_OFFLINE // SET VITE_EMAILJS_* ENV VARS
          </p>
        )}

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          {/* CALLSIGN */}
          <div>
            <label className="block mb-1 tracking-widest text-sm" style={{ fontFamily: 'var(--font-jetbrains)', color: 'rgba(255,255,255,0.75)' }}>
              CALLSIGN
            </label>
            <input
              type="text"
              value={form.callsign}
              onChange={(e) => { setForm((f) => ({ ...f, callsign: e.target.value })); setErrors((er) => ({ ...er, callsign: undefined })); }}
              placeholder="your name or handle"
              className={fieldClass('callsign')}
              style={{ fontFamily: 'var(--font-jetbrains)' }}
            />
            {errors.callsign && <TermErr msg={errors.callsign} />}
          </div>

          {/* FREQUENCY */}
          <div>
            <label className="block mb-1 tracking-widest text-sm" style={{ fontFamily: 'var(--font-jetbrains)', color: 'rgba(255,255,255,0.75)' }}>
              FREQUENCY (EMAIL)
            </label>
            <input
              type="text"
              value={form.freq}
              onChange={(e) => { setForm((f) => ({ ...f, freq: e.target.value })); setErrors((er) => ({ ...er, freq: undefined })); }}
              placeholder="your@email.com"
              className={fieldClass('freq')}
              style={{ fontFamily: 'var(--font-jetbrains)' }}
            />
            {errors.freq && <TermErr msg={errors.freq} />}
          </div>

          {/* MESSAGE */}
          <div>
            <label className="block mb-1 tracking-widest text-sm" style={{ fontFamily: 'var(--font-jetbrains)', color: 'rgba(255,255,255,0.75)' }}>
              MESSAGE
            </label>
            <textarea
              value={form.msg}
              onChange={(e) => { setForm((f) => ({ ...f, msg: e.target.value })); setErrors((er) => ({ ...er, msg: undefined })); }}
              placeholder="encode your message..."
              rows={4}
              className={`${fieldClass('msg')} resize-none`}
              style={{ fontFamily: 'var(--font-jetbrains)' }}
            />
            {errors.msg && <TermErr msg={errors.msg} />}
          </div>

          {/* reCAPTCHA v2 checkbox — rendered only when a site key is set,
              wrapped in a bordered box so the light widget sits inside the
              dark terminal frame instead of floating on it. */}
          {RECAPTCHA_SITE_KEY && (
            <div className="p-2 border border-[#1E3A8A] bg-[#0B1B3C] w-fit">
              <ReCAPTCHA
                ref={captchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleCaptchaChange}
                theme="dark"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="text-sm border-2 border-[#00F2F2] text-[#00F2F2] px-4 py-3 hover:bg-[#00F2F2] hover:text-[#0B1B3C] transition-all tracking-widest mt-1 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
            style={{ fontFamily: 'var(--font-jetbrains)' }}
          >
            {status === 'sending' ? '[ ENCRYPTING... ]' : '[ TRANSMIT >> ]'}
          </button>

          {/* Status readouts — terminal-styled result lines */}
          {status === 'success' && (
            <p className="text-green-400 text-xl mt-1" style={{ fontFamily: 'var(--font-vt323)' }}>
              &gt; TRANSMISSION_SUCCESSFUL // DATA_RECEIVED
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-500 text-xl mt-1" style={{ fontFamily: 'var(--font-vt323)' }}>
              &gt; {captchaToken ? 'SYSTEM_FAILURE // RETRY_TRANSMISSION' : 'RECAPTCHA_VERIFICATION_REQUIRED'}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

// ── Panel: Awards — classified personnel file (education + commendations) ─────
// Each commendation links to its verification certificate under /certificates/
// (public/certificates/*.pdf). `verify` marks the ones with a certificate on
// file — the [ VERIFY_RECORD ] link only renders for those.
const COMMENDATIONS = [
  {
    title: 'Central Hack, VIT Yantra 26',
    resultClass: 'text-[#4ade80]',
    result: '[ WINNER - FINTECH ] — Placed 1st out of 142 competing teams',
    project: 'SthiraSense',
    desc: 'Delivered a production-ready stablecoin depeg early-warning system within a 48-hour build window.',
    certificate: '/certificates/yantrahack.jpeg',
    verify: true,
  },
  {
    title: 'WE HACK 5.0,  IEEE Women In Engineering ',
    resultClass: 'text-[#4ade80]',
    result: '[ WINNER - Inclusive Healthcare And Accesibility ] — Placed 1st out of 29 competing teams',
    project: 'PharmacoGNN',
    desc: 'Engineered an inductive graph neural network engine for female-stratified polypharmacy side-effect prediction under 36 hours.',
  },
  {
    title: 'AgriHack by VIT VAIAL',
    resultClass: 'text-[#4ade80]',
    result: '[ WINNER ] — Placed 1st out of 26 competing university teams',
    project: '',
    desc: 'Built a smart irrigation system fusing geolocation, weather forecasting, and hydrological calculations.',
    certificate: '/certificates/agrihack.pdf',
    verify: true,
  },
  {
    title: 'Smart India Hackathon 25 (SIH)',
    resultClass: 'text-[#00F2F2]',
    result: '[ FINALIST ] — 1 of 30 teams out of 300 in university round',
    project: 'Float Chat',
    desc: 'Developed a solution to make large-scale oceanographic data accessible through natural language queries.'
    
  },
] as const;

function AwardsPanel() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in relative z-10" style={{ fontFamily: 'var(--font-jetbrains)' }}>
      {/* ACADEMIC ARCHIVES */}
      <div className="border border-[#00F2F2]/50 bg-[#0B1B3C]/50 p-4 relative">
        <h2
          className="text-[#00F2F2] text-sm md:text-base tracking-widest font-bold mb-4 uppercase shrink-0"
          style={{ fontFamily: 'var(--font-jetbrains)', textShadow: '0 0 8px rgba(0,242,242,0.6)' }}
        >
          &gt; ACADEMIC_ARCHIVES_
        </h2>
        <div className="flex flex-col gap-5">
          {/* University */}
          <div className="pl-4 border-l-2 border-[#00F2F2]/50 hover:border-[#00F2F2] transition-colors">
            <div className="flex justify-between items-start gap-4">
              <h4 className="text-white font-bold text-base">Vellore Institute of Technology</h4>
              <span className="text-[#00F2F2] text-xs shrink-0 mt-1 border border-[#00F2F2]/30 px-1.5 py-0.5 bg-[#00F2F2]/10">
                JUL 2024 - PRESENT
              </span>
            </div>
            <p className="text-[#8BF0F0]/90 text-sm mt-1">B.Tech. in Computer Science and Engineering Spl. Business systems</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#00F2F2] text-sm font-bold bg-[#00F2F2]/10 px-2 py-0.5">CGPA: 9.08</span>
            </div>
          </div>

          {/* High School */}
          <div className="pl-4 border-l-2 border-[#00F2F2]/30 hover:border-[#00F2F2]/70 transition-colors">
            <div className="flex justify-between items-start gap-4">
              <h4 className="text-white font-bold text-base">Ralli International School</h4>
              <span className="text-[#8BF0F0]/70 text-xs shrink-0 mt-1 border border-[#1E3A8A] px-1.5 py-0.5">
                MAY 2022 - MAY 2024
              </span>
            </div>
            <p className="text-[#8BF0F0]/70 text-sm mt-1">High school - Physics, Chemistry, Maths and Computer Science</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[#8BF0F0] text-sm border border-[#1E3A8A] px-2 py-0.5">Percentage: 93.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* FIELD COMMENDATIONS */}
      <div className="border border-[#00F2F2]/50 bg-[#0B1B3C]/50 p-4 relative">
        <h2
  className="text-[#00F2F2] text-sm md:text-base tracking-widest font-bold mb-4 uppercase shrink-0"
  style={{ fontFamily: 'var(--font-jetbrains)', textShadow: '0 0 8px rgba(0,242,242,0.6)' }}
>
  &gt; FIELD_COMMENDATIONS_
</h2>
        <div className="flex flex-col gap-6">

          {COMMENDATIONS.map((rec) => (
            <div key={rec.title} className="pl-4 border-l-2 border-[#00F2F2] group hover:bg-[#00F2F2]/5 p-2 -ml-2 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00F2F2] animate-pulse shadow-[0_0_8px_#00F2F2]"></span>
                <h4 className="text-white font-bold text-base uppercase tracking-wide">{rec.title}</h4>
              </div>
              <div className={`${rec.resultClass} text-sm mt-1.5 font-bold tracking-wide`}>
                {rec.result}
              </div>
              <p className="text-[#8BF0F0]/80 text-sm mt-2 leading-relaxed">
                {rec.project && <span className="text-white font-medium">Project {rec.project}:</span>} {rec.desc}
              </p>
              {/* Certificate verification link — styled like the [/SOURCE]
                  links in Projects; opens the scanned certificate in a new tab */}
              {rec.verify && (
                <a
                  href={rec.certificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs px-2 py-1 border border-[#00F2F2]/40 text-[#00F2F2] hover:bg-[#00F2F2] hover:text-[#0B1B3C] transition-all tracking-widest"
                >
                  [ VERIFY_RECORD ]
                </a>
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
// ── NexusDashboard ─────────────────────────────────────────────────────────────
export default function NexusDashboard({ time }: { time: string }) {
  const [activePanel, setActivePanel] = useState<Panel>('Overview');
  const [archiveOpen, setArchiveOpen] = useState(false);
  // Bumped when the overlay is closed externally (TERMINATE button) so the
  // Folder remounts in its closed state and stays in sync with the overlay —
  // otherwise the next folder click would just close the folder (dead click).
  const [folderResetKey, setFolderResetKey] = useState(0);

  // Stable identities so the ArchiveOverlay effect deps don't churn on the
  // 1-second clock re-render
  const closeArchive = useCallback(() => {
    setArchiveOpen(false);
    setFolderResetKey((k) => k + 1);
  }, []);
  const handleFolderToggle = useCallback((open: boolean) => setArchiveOpen(open), []);

  const panels: Record<Panel, React.ReactNode> = {
    Overview: <OverviewPanel />,
    Projects: <ProjectsPanel />,
    Skills: <SkillsPanel />,
    Awards: <AwardsPanel />,
    'Comm Link': <CommLinkPanel />,
  };

  return (
    <div className="min-h-screen p-2 flex items-center justify-center bg-transparent">
      {/* Full-screen archive gallery — decrypted via the sidebar Folder */}
      {archiveOpen && <ArchiveOverlay onClose={closeArchive} />}

      {/* Outer Monitor Bezel — dynamically clamped so the whole CRT always fits
          the viewport: 95vw/95dvh with hard caps, no aspect-ratio lock.
          95dvh tracks mobile browser chrome (URL bar) so it never overflows. */}
      <div
        className="relative z-10 w-[95vw] max-w-7xl h-[95dvh] max-h-[950px] border-4 md:border-8 border-[#0B1B3C] rounded-xl flex flex-col md:flex-row overflow-hidden bg-[#0B1B3C]/80 backdrop-blur-sm p-2 md:p-4"
        style={{
          boxShadow: '0 0 40px rgba(0,242,242,0.2), 0 0 80px rgba(0,242,242,0.06)',
        }}
      >
        {/* Inner Bezel */}
        <div className="relative size-full border-2 md:border-4 border-[#00F2F2] rounded-lg p-1 md:p-3 overflow-hidden shadow-[inset_0_0_20px_rgba(0,242,242,0.3)]">

          {/* CRT Screen — translucent so stars shimmer behind the grid lines */}
          <div className="relative size-full bg-[#0B1B3C]/80 border border-[#8BF0F0] md:border-2 rounded overflow-hidden pixel-grid flex flex-col">
            {/* Scanlines */}
            <div className="absolute inset-0 scanline pointer-events-none opacity-50 z-50 mix-blend-overlay" />

            {/* Header */}
            <header className="flex justify-between items-center border-b-2 border-[#00F2F2] p-2 md:p-4 bg-[#1E3A8A]/30 z-10 relative shrink-0">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div className="w-2 h-2 md:w-3 md:h-3 shrink-0 bg-[#00F2F2] animate-pulse shadow-[0_0_10px_#00F2F2]" />
                <h1 className="font-press-start text-[#00F2F2] text-[7px] sm:text-[10px] md:text-base tracking-wider uppercase text-shadow-cyan truncate">
                  [NEXUS INTERFACE v1.0]
                </h1>
              </div>
              <div className="font-mono text-[#8BF0F0] text-[8px] md:text-sm shrink-0 pl-2">
                SYS.TIME // {time}
              </div>
            </header>

            {/* Body — stacks vertically on mobile, side-by-side from md up */}
            <main className="flex flex-col md:flex-row w-full h-full overflow-hidden z-10 relative min-h-0 flex-1">

              {/* Left sidebar — sits on top on mobile, left column from md up.
                  relative z-50 + no clipping on this element so the Folder's
                  expanded gallery layers on top of the main content. */}
              <aside className="relative z-50 w-full md:w-72 flex-none flex flex-col md:border-r border-b border-[#00F2F2] p-2 md:p-4 overflow-y-auto md:overflow-visible max-h-[40vh] md:max-h-none">
                {/* ── Top: Operative ID badge ─────────────────────────────── */}
                <div className="shrink-0 border-b border-[#1E3A8A] pb-3 md:pb-4 flex flex-col gap-2">
                  <div
                    className="text-[#00F2F2] tracking-widest shrink-0 font-bold"
                    style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', textShadow: '0 0 6px rgba(0,242,242,0.5)' }}
                  >
                    &gt; OPERATIVE_ID_
                  </div>
                  {/* Horizontal on mobile (saves vertical space), vertical gap on desktop */}
                  <div className="flex flex-row md:flex-col items-center md:items-start gap-3">
                    {/* Personal photo placeholder — sized for a profile picture */}
                   <div
                    className="shrink-0 w-28 h-28 flex items-center justify-center bg-[#030a1a] overflow-hidden"
                    style={{
                      border: '1px solid #00F2F2',
                      boxShadow: '0 0 10px rgba(0,242,242,0.25)',
                    }}
                  >
                    <img 
                      src="images/pfp.png" // Replace with your actual image path
                      alt="Operative ID" 
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }} // Kept your pixelated styling here
                    />
                  </div>
                    <div className="min-w-0" style={{ fontFamily: 'var(--font-jetbrains)' }}>
                      <div className="text-[13px] text-white leading-tight font-medium truncate">
                        Maneet Gupta
                      </div>
                      <div className="text-[11px] text-[#8BF0F0]/70 leading-tight mt-0.5">
                        // AI/ML Engineer
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Bottom: Field records folder ───────────────────────── */}
                {/* Fixed height keeps the wheel + stats stable when folder opens */}
                <div
                  className="relative z-50 shrink-0 border-b border-[#1E3A8A] pt-3 pb-4 flex flex-col gap-2"
                  style={{ height: '164px', overflow: 'visible', position: 'relative', zIndex: 50 }}
                >
                  {/* Section header */}
                  <div
                    className="text-[#00F2F2] tracking-widest shrink-0 font-bold"
                    style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '12px', textShadow: '0 0 6px rgba(0,242,242,0.5)' }}
                  >
                    &gt; FIELD_RECORDS_
                  </div>

                  {/* Folder — opening it decrypts the archive into a full-screen
                      CircularGallery overlay (managed in NexusDashboard state) */}
                  <div className="relative z-50 flex flex-col items-center gap-1.5 flex-1 justify-end">
                    <Folder
                      key={folderResetKey}
                      color="#00C8C8"
                      size={0.8}
                      onToggle={handleFolderToggle}
                    />

                    {/* Decrypt label always visible below the folder */}
                    <div
                      className="tracking-widest text-center"
                      style={{
                        fontFamily: 'var(--font-jetbrains)',
                        color: '#1E3A8A',
                        fontSize: '11px',
                        letterSpacing: '0.06em',
                      }}
                    >
                      [CLICK TO DECRYPT]                    </div>
                  </div>
                </div>

                {/* The Option Wheel — real React Bits drum picker.
                    Hidden on mobile: the swipeable tab bar already navigates,
                    and the wheel's height would starve the stacked layout. */}
                <div className="hidden md:flex flex-1 relative min-h-[160px]" style={{ minHeight: 0 }}>
                  {/* Active-slot indicator line */}
                  <div
                    className="absolute inset-x-0 pointer-events-none z-10 border-y border-[#00F2F2]"
                    style={{
                      top: '50%',
                      transform: 'translateY(-50%)',
                      height: '2.2rem',
                      background: 'linear-gradient(135deg,rgba(0,242,242,0.08) 0%,rgba(30,58,138,0.18) 100%)',
                      boxShadow: '0 0 12px rgba(0,242,242,0.15)',
                    }}
                  />
                  {/* Left tick mark */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none font-mono text-[#00F2F2] text-[10px]">▶</div>

                  <OptionWheel
                    items={[...PANELS]}
                    defaultSelected={PANELS.indexOf(activePanel)}
                    onChange={(_idx, label) => setActivePanel(label as Panel)}
                    textColor="#3a6a8a"
                    activeColor="#00F2F2"
                    fontSize={0.55}
                    spacing={1.6}
                    tilt={8}
                    curve={0.6}
                    blur={1.5}
                    fade={0.5}
                    minOpacity={0.08}
                    smoothing={180}
                    inset={28}
                    className="option-wheel--retro"
                  />
                </div>

                {/* System stats footer — desktop only (mobile stacks tight) */}
                <div className="hidden md:block shrink-0 pt-3 border-t border-[#1E3A8A] font-mono text-[9px] text-[#8BF0F0] space-y-1">
                  {[['CPU', 'OPTIMAL'], ['MEM', '64 TB'], ['NET', 'SECURED']].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[#8BF0F0]/50">{k}:</span>
                      <span className="text-[#00F2F2]">{v}</span>
                    </div>
                  ))}
                </div>

                {/* Resume download button */}
                <div className="shrink-0 pt-3">
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 text-center border-2 border-[#00F2F2] text-[#00F2F2] text-sm md:text-base whitespace-nowrap bg-[#00F2F2]/10 hover:bg-[#00F2F2] hover:text-[#0B1B3C] shadow-[0_0_10px_rgba(0,242,242,0.5)] transition-all uppercase font-bold animate-pulse block"
                    style={{ fontFamily: 'var(--font-vt323)', letterSpacing: '0.1em' }}
                  >
                    ↓ [ EXTRACT_RESUME.PDF ]
                  </a>
                </div>
              </aside>

              {/* Right: Content panel */}
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Panel tab bar — scrollable on mobile so tabs never wrap or squish */}
                <div className="flex-none flex overflow-x-auto whitespace-nowrap hide-scrollbar w-full border-b border-[#00F2F2]/50">
                  {PANELS.map((panel) => {
                    const Icon = PANEL_ICONS[panel];
                    const active = panel === activePanel;
                    return (
                      <button
                        key={panel}
                        onClick={() => setActivePanel(panel)}
                        className="text-[11px] px-3 py-2 border-r border-[#1E3A8A] transition-all tracking-widest whitespace-nowrap flex items-center gap-1.5 font-bold"
                        style={{
                          fontFamily: 'var(--font-jetbrains)',
                          color: active ? '#0B1B3C' : '#8BF0F0',
                          background: active ? '#00F2F2' : 'transparent',
                          borderBottom: active ? '2px solid #00F2F2' : '2px solid transparent',
                        }}
                      >
                        <Icon size={12} strokeWidth={2.5} style={{ shapeRendering: 'crispEdges' }} />
                        {active && <span className="mr-0.5">■</span>}{panel}
                      </button>
                    );
                  })}
                </div>

                {/* Animated panel swap — scrolls internally, never pushes the
                    monitor frame past the screen height. pb-20 keeps the last
                    block clear of the CornerAvatar on mobile. */}
                <div className="flex-1 overflow-y-auto p-4 pb-24 hide-scrollbar relative">
                  <div key={activePanel} style={{ animation: 'panel-in 0.25s ease-out both' }}>
                    {panels[activePanel]}
                  </div>
                </div>
              </div>
            </main>

            {/* Corner accents */}
            {['top-0 left-0 border-t-4 border-l-4', 'top-0 right-0 border-t-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4'].map((cls) => (
              <div key={cls} className={`absolute w-8 h-8 ${cls} border-[#00F2F2] z-20 pointer-events-none`} />
            ))}
          </div>
        </div>

        {/* Corner-avatar Spider-Man — LAST child of the bezel so it stacks
            above every decorative border/corner accent; pinned just outside
            the bottom-left corner of the CRT frame */}
        <CornerAvatar className="absolute -bottom-2 -left-2 z-[99999]" />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(11,27,60,0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,242,242,0.3); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #00F2F2; }
        @keyframes panel-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loader-shimmer {
          from { left: -1.5rem; }
          to   { left: 100%; }
        }
      `}</style>
    </div>
  );
}
