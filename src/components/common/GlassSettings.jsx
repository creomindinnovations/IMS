import { useEffect, useState } from 'react';
import { getGlassOpacity, setGlassOpacity } from '../../utils/glassTheme';

export default function GlassSettings() {
  const [open, setOpen] = useState(false);
  const [opacity, setOpacity] = useState(0.35);

  useEffect(() => {
    setOpacity(getGlassOpacity());
  }, []);

  const handleChange = (e) => {
    const value = setGlassOpacity(e.target.value);
    setOpacity(value);
  };

  const pct = Math.round(opacity * 100);

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <div
        className={`glass-pop w-[280px] transition-all duration-300 ${
          open
            ? 'pointer-events-auto translate-y-0 scale-100 opacity-100'
            : 'pointer-events-none translate-y-3 scale-95 opacity-0'
        }`}
        role="dialog"
        aria-label="Glass opacity settings"
        aria-hidden={!open}
      >
        <h3 className="mb-4 text-sm font-semibold">Display Settings</h3>
        <label className="mb-2 flex items-center justify-between text-xs font-medium text-muted">
          Glass Opacity
          <span className="font-bold text-blue-deep">{pct}%</span>
        </label>
        <input
          type="range"
          min="0.05"
          max="0.95"
          step="0.05"
          value={opacity}
          onChange={handleChange}
          className="glass-slider w-full"
          aria-valuemin={5}
          aria-valuemax={95}
          aria-valuenow={pct}
        />
        <p className="mt-3 text-xs text-muted">Adjusts glass transparency across the app.</p>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass glass--round glass--icon flex h-[52px] w-[52px] items-center justify-center rounded-full text-xl"
        aria-label="Toggle glass settings"
        aria-expanded={open}
      >
        ⚙
      </button>
    </div>
  );
}
