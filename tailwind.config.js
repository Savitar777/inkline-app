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
    },
  },
  plugins: [],
}
