/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Aries theme — fire, ram, dark red.
        aries: {
          // Background bases (deep ember-black to blood maroon)
          base: '#1A0508',
          base2: '#2A0A0F',
          // Surfaces / cards
          surface: '#240A0E',
          surfaceAlt: '#30100F',
          border: '#3D1418',
          borderGlow: '#5A1A1E',
          // Primary accent — fire red / crimson
          flame: '#FF3B30',
          flameDeep: '#B91C1C',
          // Ember / orange secondary glow
          ember: '#FF7A18',
          emberSoft: '#F4A340',
          // Forged gold / ram-horn highlight
          gold: '#F5B841',
          // Feedback
          success: '#34D399',
          warning: '#F4A340',
          // Text
          text: '#FFF1EC',
          muted: '#C99A93',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', '"Oswald"', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        emberFloat: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0' },
          '15%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-120px) scale(0.4)', opacity: '0' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '45%': { opacity: '0.82' },
          '55%': { opacity: '0.92' },
          '70%': { opacity: '0.78' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,59,48,0.0)' },
          '50%': { boxShadow: '0 0 40px 6px rgba(255,59,48,0.35)' },
        },
      },
      animation: {
        emberFloat: 'emberFloat 3.5s ease-in infinite',
        flicker: 'flicker 3s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
