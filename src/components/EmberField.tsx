import { useMemo } from 'react';

/**
 * Decorative drifting embers for the fire theme. Pure CSS animation, pointer
 * events off, sits behind content.
 */
export default function EmberField({ count = 18 }: { count?: number }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const left = Math.random() * 100;
        const size = 2 + Math.random() * 4;
        const delay = Math.random() * 3.5;
        const duration = 3 + Math.random() * 3.5;
        const hue = Math.random() > 0.5 ? '#FF7A18' : '#FF3B30';
        return { i, left, size, delay, duration, hue };
      }),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {embers.map((e) => (
        <span
          key={e.i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            background: e.hue,
            boxShadow: `0 0 ${e.size * 3}px ${e.hue}`,
            animation: `emberFloat ${e.duration}s ease-in ${e.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
