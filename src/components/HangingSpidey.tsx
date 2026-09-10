// HangingSpidey — pixel-art Spider-Man dangling from a web line that drops
// from the top of the boot screen. Anchors itself to the top edge of its
// nearest positioned ancestor (the fixed LandingLoader screen), so the line
// always starts at the very top of the viewport.
// Sprite sheet: SpiderMan_web.png — 6314×124 px, 77 frames × 82 px/frame.
// Every frame includes its own web strand, so the CSS line above the sprite
// window connects seamlessly to the strand inside frame 0.
// CSS classes: .spidey-hang / .spidey-webline / .spidey-sprite (src/index.css).

import type { CSSProperties, MouseEventHandler } from 'react';

// Served from public/images/preloader/ so Vite never hashes or renames it.
// BASE_URL keeps the path correct under subpath deploys (vite.config.ts sets
// base to FIGMA_PUBLIC_URL in Figma Make previews); a bare '/...' would 404.
const SPIDER_WEB_URL = `${import.meta.env.BASE_URL}images/preloader/SpiderMan_web.png`;

interface Props {
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export default function HangingSpidey({ className = '', style, onClick }: Props) {
  return (
    <div className={`spidey-hang ${className}`} style={style} onClick={onClick}>
      {/* Web line — from the top of the screen down to the sprite */}
      <div className="spidey-webline" aria-hidden="true" />
      {/* Spider-Man — native-px frame window, scaled down via transform */}
      <div
        className="spidey-sprite"
        style={{ backgroundImage: `url(${SPIDER_WEB_URL})` }}
      />
    </div>
  );
}
