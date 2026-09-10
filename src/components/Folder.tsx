import { useState, ReactNode } from 'react';
import './Folder.css';

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) color = color.split('').map(c => c + c).join('');
  const num = parseInt(color.slice(0, 6), 16);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.floor(n * (1 - percent))));
  const r = clamp((num >> 16) & 0xff);
  const g = clamp((num >> 8) & 0xff);
  const b = clamp(num & 0xff);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

interface FolderProps {
  color?: string;
  size?: number;
  items?: ReactNode[];
  /** When provided, rendered as a floating gallery panel above the folder when open. Items/papers are hidden. */
  children?: ReactNode;
  className?: string;
  onToggle?: (open: boolean) => void;
}

const Folder = ({
  color = '#5227FF',
  size = 1,
  items = [],
  children,
  className = '',
  onToggle,
}: FolderProps) => {
  const maxItems = 3;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) papers.push(null);

  const [open, setOpen] = useState(false);
  const [paperOffsets, setPaperOffsets] = useState(
    Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))
  );

  const folderBackColor = darkenColor(color, 0.08);
  const paper1 = darkenColor('#ffffff', 0.1);
  const paper2 = darkenColor('#ffffff', 0.05);
  const paper3 = '#ffffff';

  const handleClick = () => {
    const next = !open;
    setOpen(next);
    onToggle?.(next);
    if (!next) setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));
  };

  const handlePaperMouseMove = (e: React.MouseEvent, index: number) => {
    if (!open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = (e.clientX - (rect.left + rect.width / 2)) * 0.15;
    const offsetY = (e.clientY - (rect.top + rect.height / 2)) * 0.15;
    setPaperOffsets(prev => {
      const next = [...prev];
      next[index] = { x: offsetX, y: offsetY };
      return next;
    });
  };

  const handlePaperMouseLeave = (_e: React.MouseEvent, index: number) => {
    setPaperOffsets(prev => {
      const next = [...prev];
      next[index] = { x: 0, y: 0 };
      return next;
    });
  };

  return (
    <div style={{ transform: `scale(${size})`, transformOrigin: 'bottom center' }} className={className}>
      <div
        className={`folder${open ? ' open' : ''}`}
        style={{
          '--folder-color': color,
          '--folder-back-color': folderBackColor,
          '--paper-1': paper1,
          '--paper-2': paper2,
          '--paper-3': paper3,
        } as React.CSSProperties}
        onClick={handleClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        aria-label={open ? 'Close folder' : 'Open folder'}
      >
        <div className="folder__back">
          {/* When children provided: show gallery panel instead of individual papers */}
          {children ? (
            <div
              className="folder__gallery-panel"
              style={{
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none',
                transform: open ? 'translateY(-105%) scale(1)' : 'translateY(-80%) scale(0.92)',
                transition: 'opacity 0.3s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {children}
            </div>
          ) : (
            papers.map((item, i) => (
              <div
                key={i}
                className={`paper paper-${i + 1}`}
                onMouseMove={e => handlePaperMouseMove(e, i)}
                onMouseLeave={e => handlePaperMouseLeave(e, i)}
                style={open ? ({
                  '--magnet-x': `${paperOffsets[i]?.x ?? 0}px`,
                  '--magnet-y': `${paperOffsets[i]?.y ?? 0}px`,
                } as React.CSSProperties) : {}}
              >
                {item}
              </div>
            ))
          )}
          <div className="folder__front" />
          <div className="folder__front right" />
        </div>
      </div>
    </div>
  );
};

export default Folder;
