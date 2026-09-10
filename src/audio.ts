// Global singleton — one instance, no duplicates no matter how many imports.
// The jingle is served as a static asset from public/ so Vite copies it to
// dist/spidey_jingle.mp3 verbatim — no content hash. BASE_URL keeps the path
// correct under subpath deploys (vite.config.ts sets base to FIGMA_PUBLIC_URL).
const JINGLE_URL = `${import.meta.env.BASE_URL}spidey_jingle.mp3`;

class AudioEngine {
  private track: HTMLAudioElement | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;

  private init() {
    if (this.track) return;
    this.track = new Audio(JINGLE_URL);
    this.track.preload = 'auto';
    this.track.loop = false; // plays once through per trigger
    this.track.volume = 0;
  }

  /** Fade in from silence and play once through. */
  play(fadeDurationMs = 2000, targetVolume = 0.5) {
    this.init();
    if (!this.track) return;
    this.track.currentTime = 0;
    this.track.play().catch(() => {});

    if (this.fadeTimer) clearInterval(this.fadeTimer);
    const steps = 40;
    const stepMs = fadeDurationMs / steps;
    const stepVol = targetVolume / steps;
    let tick = 0;

    this.fadeTimer = setInterval(() => {
      tick++;
      if (this.track) this.track.volume = Math.min(tick * stepVol, targetVolume);
      if (tick >= steps && this.fadeTimer) {
        clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, stepMs);
  }

  /** Instant-play from the start at full volume — for click easter eggs. */
  playEffect(volume = 0.4) {
    this.init();
    if (!this.track) return;
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.track.currentTime = 0;
    this.track.volume = volume;
    this.track.play().catch(() => {});
  }

  setVolume(v: number) {
    if (this.track) this.track.volume = Math.max(0, Math.min(1, v));
  }

  pause() {
    if (this.track) this.track.pause();
  }
}

export const audioEngine = new AudioEngine();
