/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Mode clair (Charte graphique)
        background: "#fffffe",
        surface: "#fffffe",
        "surface-alt": "#e3f6f5",
        "surface-tertiary": "#bae8e8",
        "text-primary": "#272343",
        "text-secondary": "#2d334a",
        accent: "#ffd803",
        border: "#dfe5f2",
        
        // Mode sombre (Charte graphique)
        dark: {
          background: "#0f0e17",
          surface: "#0f0e17",
          "surface-alt": "#1b1926",
          accent: "#ff8906",
          text: "#fffffe",
        },

        // Couleurs d'état
        success: "#42c88f",
        warning: "#ffd803",
        error: "#f25f4c",
        info: "#bae8e8",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        display: ["Recoleta", "serif"],
      },
      borderRadius: {
        lg: "20px",
        md: "calc(20px - 2px)",
        sm: "calc(20px - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
