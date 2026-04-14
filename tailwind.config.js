/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          black: 'var(--ink-black)',
          dark: 'var(--ink-dark)',
          panel: 'var(--ink-panel)',
          border: 'var(--ink-border)',
          muted: 'var(--ink-muted)',
          text: 'var(--ink-text)',
          light: 'var(--ink-light)',
          gold: '#D4A843',
          'gold-dim': '#B8922E',
        },
        tag: {
          episode: '#8B5CF6',
          page: '#14B8A6',
          panel: '#D4A843',
          dialogue: '#22C55E',
          caption: '#A78BFA',
          sfx: '#F97316',
        },
        status: {
          submitted: '#3B82F6',
          progress: '#F59E0B',
          draft: '#A78BFA',
          approved: '#22C55E',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up': 'ink-slide-up 200ms ease-out',
        'slide-down': 'ink-slide-down 200ms ease-out',
        'scale-in': 'ink-scale-in 150ms ease-out',
        'toast-in': 'ink-toast-in 300ms ease-out',
        'toast-out': 'ink-toast-out 200ms ease-in forwards',
        'shimmer': 'ink-shimmer 1.5s ease-in-out infinite',
        'pulse-gold': 'ink-pulse-gold 1.5s ease-in-out',
        'slide-in-left': 'ink-slide-in-left 200ms ease-out',
        'slide-in-right': 'ink-slide-in-right 200ms ease-out',
      },
      keyframes: {
        'ink-slide-up': { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'ink-slide-down': { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'ink-scale-in': { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        'ink-toast-in': { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        'ink-toast-out': { from: { opacity: '1', transform: 'translateX(0)' }, to: { opacity: '0', transform: 'translateX(20px)' } },
        'ink-shimmer': { '0%': { 'background-position': '-200% 0' }, '100%': { 'background-position': '200% 0' } },
        'ink-pulse-gold': { '0%, 100%': { 'box-shadow': '0 0 0 0 rgba(212, 168, 67, 0)' }, '50%': { 'box-shadow': '0 0 0 4px rgba(212, 168, 67, 0.15)' } },
        'ink-slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'ink-slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
