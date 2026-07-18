/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Global Command Center Palette
        background: "#050810",
        secBg: "#0B1120",
        cardBg: "#111827",
        panelBg: "#151D2E",
        
        // Accents
        primary: "#2170e4", // Electric Blue
        secondary: "#8455ef", // Violet (AI accent)
        success: "#10B981", // Emerald
        warning: "#F59E0B", // Amber
        error: "#ba1a1a", // Red
        info: "#06B6D4", // Cyan
        
        // Text states
        textPrimary: "#ffffff",
        textSecondary: "#c2c6d6",
        textMuted: "#727785",
        
        // Borders
        borderSubtle: "rgba(255, 255, 255, 0.08)"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "16px",
        full: "9999px"
      },
      spacing: {
        "margin-desktop": "32px",
        "gutter": "24px",
        "margin-mobile": "16px",
        "grid-columns": "12",
        "base": "4px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      }
    },
  },
  plugins: [],
}
