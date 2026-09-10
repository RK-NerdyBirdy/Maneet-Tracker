import { useEffect } from 'react';
import CircularGallery from './CircularGallery';

// Module-level so the array identity is stable — the CircularGallery effect
// keys off `items`, so an inline array would tear down and rebuild the WebGL
// scene on every parent re-render (App re-renders every second for the clock).
const ARCHIVE_ITEMS = [
  { image: 'public/images/scroll/Dev261.jpeg', text: 'DevJams\'26' },
  { image: 'public/images/scroll/Dev262.jpeg', text: 'DevJams\'26' },
  { image: 'public/images/scroll/Hex1.JPG', text: 'Hexathon\'26' },
  { image: 'public/images/scroll/Hex2.JPG', text: 'Hexathon\'26' },
  { image: 'public/images/scroll/Wehack.jpeg', text: 'WE hack 5.0' },
  { image: 'public/images/scroll/yantra.jpeg', text: 'Yantra\'26' },
];

interface ArchiveOverlayProps {
  onClose: () => void;
}

export default function ArchiveOverlay({ onClose }: ArchiveOverlayProps) {
  // Escape closes; body scroll locked while the overlay is mounted
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#030712]/95 backdrop-blur-lg flex flex-col items-center justify-center p-4 md:p-8">
      {/* Close button — top right */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 px-4 py-2 border-2 border-[#00F2F2] text-[#00F2F2] bg-[#0B1B3C]/60 hover:bg-[#00F2F2] hover:text-[#0B1B3C] transition-all tracking-widest"
        style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '13px' }}
      >
        [ TERMINATE_ARCHIVE_VIEW ]
      </button>

      {/* Header */}
      <div
        className="text-[#00F2F2] tracking-widest mb-2 md:mb-4 text-center"
        style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '16px', textShadow: '0 0 8px #00F2F2' }}
      >
        &gt; DECRYPTED_FIELD_RECORDS // DRAG · SCROLL · ARROW KEYS
      </div>

      {/* Gallery — needs an explicit height for the WebGL canvas to size against */}
      <div className="w-full flex-1 min-h-0 max-w-6xl" style={{ position: 'relative' }}>
        <CircularGallery
          items={ARCHIVE_ITEMS}
          bend={3}
          textColor="#00F2F2"
          borderRadius={0.05}
          font="bold 24px 'JetBrains Mono'"
        />
      </div>
    </div>
  );
}
