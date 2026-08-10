/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sourced from CSS variables (see src/index.css) so a light theme
        // can be added later by overriding the variables — no class changes.
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        muted: 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['"Inter Tight Variable"', 'system-ui', 'sans-serif'],
        // Display serif for the hero name only. A system stack rather than a
        // webfont, so it costs no bytes and no network request — at the price
        // of resolving to a different face per OS.
        display: [
          '"Iowan Old Style"',
          '"Palatino Linotype"',
          'Palatino',
          '"Book Antiqua"',
          'Georgia',
          'serif',
        ],
      },
      maxWidth: {
        content: '720px',
      },
      transitionDuration: {
        150: '150ms',
      },
    },
  },
  plugins: [],
};
