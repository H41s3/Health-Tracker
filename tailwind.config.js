/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Night Owl Color Palette
        nightowl: {
          // Backgrounds
          bg: '#011627',
          'bg-light': '#0b2942',
          surface: '#1d3b53',
          'surface-light': '#234d6b',
          
          // Text
          text: '#d6deeb',
          'text-muted': '#7fdbca',
          'text-dim': '#5f7e97',
          
          // Accent Colors
          cyan: '#7fdbca',
          purple: '#c792ea',
          orange: '#f78c6c',
          yellow: '#ffcb6b',
          blue: '#82aaff',
          green: '#addb67',
          red: '#ff5874',
          pink: '#ff6ac1',
          magenta: '#c792ea',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(127, 219, 202, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(127, 219, 202, 0.5)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(127, 219, 202, 0.3)',
        'glow-purple': '0 0 20px rgba(199, 146, 234, 0.3)',
        'glow-orange': '0 0 20px rgba(247, 140, 108, 0.3)',
        'night': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'night-lg': '0 8px 40px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
};
