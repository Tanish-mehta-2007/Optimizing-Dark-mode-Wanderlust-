/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{components,contexts,pages,services,types,utils}/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'hsl(var(--brand-hue) var(--brand-saturation) var(--brand-lightness))',
          light: 'hsl(var(--brand-hue) var(--brand-saturation) calc(var(--brand-lightness) + 15%))',
          dark: 'hsl(var(--brand-hue) var(--brand-saturation) calc(var(--brand-lightness) - 10%))',
          darker: 'hsl(var(--brand-hue) var(--brand-saturation) calc(var(--brand-lightness) - 20%))',
        },
        // Light theme semantic colors (already defined in index.html, but good for Tailwind intellisense)
        'color-primary': 'var(--color-primary)',
        'color-primary-hover': 'var(--color-primary-hover)',
        'color-background': 'var(--color-background)',
        'color-foreground': 'var(--color-foreground)',
        'color-card-background': 'var(--color-card-background)',
        'color-border': 'var(--color-border)',
        // Dark theme semantic colors (for Tailwind intellisense, actual values in index.html)
        'dark-color-background': 'var(--dark-color-background)',
        'dark-color-foreground': 'var(--dark-color-foreground)',
        'dark-color-card-background': 'var(--dark-color-card-background)',
        'dark-color-border': 'var(--dark-color-border)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans', 'sans-serif'],
      },
      height: {
        'header': 'var(--header-height)',
      },
      backgroundColor: { // For explicit dark mode usage if needed beyond text/border
        'card-dark': 'var(--dark-color-card-background)',
        'body-dark': 'var(--dark-color-background)',
      },
      textColor: {
        'default-dark': 'var(--dark-color-foreground)',
      },
      borderColor: {
        'default-dark': 'var(--dark-color-border)',
      }
    },
  },
  plugins: [],
}
