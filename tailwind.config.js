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
          black: '#0D0D0D',
          dark: '#141414',
          panel: '#1A1A1A',
          border: '#2A2A2A',
          muted: '#555555',
          text: '#8A8A8A',
          light: '#F5F0E8',
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
