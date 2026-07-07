/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          "primary-fixed-dim": "#a1d494",
          "surface-container-highest": "#d9e3f4",
          "on-surface-variant": "#42493e",
          "on-secondary-fixed": "#2f1500",
          "secondary-container": "#fe932c",
          "primary-container": "#2d5a27",
          "primary": "#154212",
          "secondary": "#904d00",
          "surface-container-low": "#eef4ff",
          "on-surface": "#121c28",
          "outline-variant": "#c2c9bb",
          "on-primary-container": "#9dd090",
          "background": "#f8f9ff",
          "error": "#ba1a1a",
          "surface-bright": "#f8f9ff",
          "on-primary-fixed-variant": "#23501e",
          "inverse-on-surface": "#eaf1ff",
          "on-tertiary": "#ffffff",
          "tertiary": "#002c99",
          "on-primary-fixed": "#002201",
          "tertiary-container": "#2546b4",
          "surface": "#f8f9ff",
          "on-primary": "#ffffff",
          "surface-tint": "#3b6934",
          "surface-variant": "#d9e3f4",
          "on-tertiary-container": "#b3c0ff",
          "on-error-container": "#93000a",
          "on-tertiary-fixed-variant": "#173bab",
          "surface-container": "#e5eeff",
          "secondary-fixed": "#ffdcc3",
          "inverse-surface": "#27313e",
          "surface-container-high": "#dfe9fa",
          "on-background": "#121c28",
          "primary-fixed": "#bcf0ae",
          "secondary-fixed-dim": "#ffb77d",
          "surface-container-lowest": "#ffffff",
          "tertiary-fixed": "#dde1ff",
          "error-container": "#ffdad6",
          "inverse-primary": "#a1d494",
          "on-secondary-fixed-variant": "#6e3900",
          "surface-dim": "#d1dbec",
          "on-secondary": "#ffffff",
          "on-error": "#ffffff",
          "on-tertiary-fixed": "#001453",
          "on-secondary-container": "#663500",
          "outline": "#72796e",
          "tertiary-fixed-dim": "#b8c4ff"
      },
      borderRadius: {
          "DEFAULT": "0.25rem",
          "lg": "0.5rem",
          "xl": "0.75rem",
          "full": "9999px"
      },
      spacing: {
          "gutter": "16px",
          "margin-mobile": "20px",
          "base": "8px",
          "touch-target-min": "48px",
          "margin-desktop": "40px"
      },
      fontFamily: {
          "headline-md": ["Plus Jakarta Sans", "sans-serif"],
          "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
          "label-lg": ["Inter", "sans-serif"],
          "headline-lg-mobile": ["Plus Jakarta Sans", "sans-serif"],
          "button": ["Inter", "sans-serif"],
          "body-lg": ["Inter", "sans-serif"],
          "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
          "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
          "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
          "label-lg": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "600" }],
          "headline-lg-mobile": ["28px", { lineHeight: "36px", fontWeight: "700" }],
          "button": ["18px", { lineHeight: "24px", fontWeight: "600" }],
          "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
          "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
