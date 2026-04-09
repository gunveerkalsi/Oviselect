/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.tsx',
    './*.ts',
    './components/**/*.{tsx,ts}',
    './contexts/**/*.{tsx,ts}',
    './hooks/**/*.{tsx,ts}',
    './lib/**/*.{tsx,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', 'Inter', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        ink:    { DEFAULT: '#F5F0E8', 2: '#F5F0E8', 3: '#D4CFC8', 4: '#D4CFC8' },
        paper:  { DEFAULT: 'rgba(26,26,26,0.55)', 2: 'rgba(26,26,26,0.45)', 3: 'rgba(255,255,255,0.1)' },
        accent: { DEFAULT: '#FFFFFF', light: 'rgba(255,255,255,0.12)' },
        cblue:  { DEFAULT: '#7eb8da', light: 'rgba(126,184,218,0.15)' },
        cgreen: { DEFAULT: '#73bfc4', light: 'rgba(115,191,196,0.15)' },
        camber: { DEFAULT: '#ff810a', light: 'rgba(255,129,10,0.15)' },
      },
    }
  },
  plugins: [],
}
