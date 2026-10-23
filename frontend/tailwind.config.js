/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090d16',        # Deep navy/charcoal background
          card: '#121b2d',      # Card background
          border: '#1e2d4a',    # Accent border
          hover: '#1a2740',     # Card hover state
          text: '#f8fafc',      # Primary text color
          muted: '#94a3b8'      # Muted gray text
        },
        light: {
          bg: '#f8fafc',        # Clean light gray background
          card: '#ffffff',      # Pure white card
          border: '#e2e8f0',    # Subtle border
          hover: '#f1f5f9',     # Hover background
          text: '#0f172a',      # Slate-900 primary text
          muted: '#64748b'      # Muted slate text
        },
        accent: {
          primary: '#4f46e5',   # Indigo accent
          primaryHover: '#4338ca',
          secondary: '#06b6d4', # Cyan accent
          secondaryHover: '#0891b2',
          success: '#10b981',   # Green state
          error: '#ef4444',     # Red state
          warning: '#f59e0b'    # Amber state
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      }
    },
  }
  plugins: [],
}
