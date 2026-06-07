import { motion } from 'framer-motion';

/**
 * The Aries wordmark + ram glyph (♈), wreathed in a soft flame glow.
 */
export default function AriesMark({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const glyph = size === 'lg' ? 'text-5xl' : 'text-2xl';
  const word = size === 'lg' ? 'text-6xl' : 'text-3xl';

  return (
    <div className="flex items-center justify-center gap-3 select-none">
      <motion.span
        className={`${glyph} text-aries-flame text-flame-glow leading-none`}
        animate={{ rotate: [0, -4, 4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        ♈
      </motion.span>
      <h1
        className={`${word} font-display tracking-wide text-aries-text text-flame-glow leading-none`}
      >
        ARIES
      </h1>
    </div>
  );
}
