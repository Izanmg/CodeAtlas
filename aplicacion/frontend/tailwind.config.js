/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Marca
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-soft': 'var(--accent-soft)',
        'accent-fg': 'var(--accent-fg)',

        // Superficies
        bg: 'var(--bg)',
        'bg-subtle': 'var(--bg-subtle)',
        'bg-muted': 'var(--bg-muted)',
        'bg-canvas': 'var(--bg-canvas)',
        surface: 'var(--surface)',
        'surface-raised': 'var(--surface-raised)',
        'surface-overlay': 'var(--surface-overlay)',

        // Bordes
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'border-subtle': 'var(--border-subtle)',

        // Texto
        fg: 'var(--fg)',
        'fg-muted': 'var(--fg-muted)',
        'fg-subtle': 'var(--fg-subtle)',
        'fg-faint': 'var(--fg-faint)',
        'fg-inverse': 'var(--fg-inverse)',

        // Semánticos
        success: 'var(--success)',
        'success-bg': 'var(--success-bg)',
        warning: 'var(--warning)',
        'warning-bg': 'var(--warning-bg)',
        danger: 'var(--danger)',
        'danger-bg': 'var(--danger-bg)',
        info: 'var(--info)',
        'info-bg': 'var(--info-bg)',

        // Tipos de bloque del diagrama
        'kind-backend': 'var(--kind-backend)',
        'kind-backend-bg': 'var(--kind-backend-bg)',
        'kind-frontend': 'var(--kind-frontend)',
        'kind-frontend-bg': 'var(--kind-frontend-bg)',
        'kind-screen': 'var(--kind-screen)',
        'kind-screen-bg': 'var(--kind-screen-bg)',
        'kind-database': 'var(--kind-database)',
        'kind-database-bg': 'var(--kind-database-bg)',
        'kind-flow': 'var(--kind-flow)',
        'kind-flow-bg': 'var(--kind-flow-bg)',
        'kind-rules': 'var(--kind-rules)',
        'kind-rules-bg': 'var(--kind-rules-bg)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        xs: '3px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        focus: 'var(--shadow-focus)',
      },
      letterSpacing: {
        tightest: '-0.02em',
        tighter: '-0.015em',
        tight: '-0.01em',
        normal: '-0.005em',
        wide: '0.04em',
        wider: '0.06em',
        widest: '0.08em',
      },
    },
  },
  plugins: [],
}
