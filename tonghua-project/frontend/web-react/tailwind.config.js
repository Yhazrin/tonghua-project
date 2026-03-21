/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'paper': '#F5F0E8',
        'aged-stock': '#EDE6D6',
        'warm-gray': '#D4CFC4',
        'ink': '#1A1A16',
        'ink-faded': '#4A4540',
        'sepia-mid': '#5C4D3D',
        'rust': '#8B3A2A',
        'archive-brown': '#5C4033',
        'pale-gold': '#C4A45A',
        'olive-green': '#6B7C3E',
        'eco-green': '#5a7a5a',
      },
      fontFamily: {
        'display': ['"Playfair Display"', 'Georgia', 'serif'],
        'body': ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
        'ui': ['Inter', '"Source Sans Pro"', 'sans-serif'],
      },
      fontSize: {
        'hero': 'clamp(56px, 10vw, 120px)',
        'display': 'clamp(40px, 7vw, 80px)',
        'h1': 'clamp(32px, 5vw, 56px)',
        'h2': 'clamp(24px, 3.5vw, 40px)',
        'h3': 'clamp(20px, 2.5vw, 28px)',
        'h4': 'clamp(16px, 1.5vw, 20px)',
        'body-lg': '18px',
        'body': '16px',
        'body-sm': '14px',
        'caption': '12px',
        'label': '11px',
        'overline': '10px',
      },
      zIndex: {
        'base': '1',
        'dropdown': '10',
        'sticky': '20',
        'overlay': '50',
        'modal': '100',
        'tooltip': '150',
        'toast': '200',
        'grain': '9999',
      },
      boxShadow: {
        'cert': '0 4px 20px color-mix(in srgb, var(--color-rust), transparent 92%)',
      },
    },
  },
  plugins: [],
};
