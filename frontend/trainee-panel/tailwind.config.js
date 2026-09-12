/** @type {import('tailwindcss').Config} */
// Design tokens mirrored from the Government Portal (gov-portal/src/index.css)
// so all three surfaces read as one platform: IBM Plex, a navy/gov-blue
// palette, tight radii and a near-flat card treatment.
//
// The semantic names (ink / paper / surface / line / accent) are unchanged
// from before, so every existing component picks the new look up automatically.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Institutional navy — sidebar and headings
        navy: {
          900: "#0A1A30",
          800: "#0F2440",
          700: "#163F78",
        },
        // Body text
        ink: "#212A35",
        "ink-soft": "#444F5C",
        "ink-faint": "#7C8794",
        // Surfaces
        paper: "#F5F7FA",
        surface: "#FFFFFF",
        // Government blue replaces the old terracotta accent
        accent: {
          DEFAULT: "#1E56A0",
          dark: "#163F78",
          soft: "#E7F0FB",
        },
        success: {
          DEFAULT: "#1C7A4C",
          soft: "#E4F5EC",
        },
        caution: {
          DEFAULT: "#92720B",
          soft: "#FBF1D3",
        },
        alert: {
          DEFAULT: "#B5560F",
          soft: "#FDEAD9",
        },
        warn: {
          DEFAULT: "#B32424",
          soft: "#FBE3E3",
        },
        line: "#E1E6EC",
        "line-soft": "#EEF1F5",
        // Sidebar-only tones, matching the portal's navy rail
        rail: {
          text: "#B7C4D6",
          muted: "#8FA3BD",
          active: "rgba(30,86,160,0.55)",
          line: "rgba(255,255,255,0.08)",
        },
      },
      fontFamily: {
        // One typeface across the platform, as the portal does. Weight, not a
        // second family, carries the hierarchy.
        display: ["'IBM Plex Sans'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        body: ["'IBM Plex Sans'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        data: ["'IBM Plex Mono'", "SFMono-Regular", "Consolas", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(10, 26, 48, 0.06), 0 1px 0 rgba(10, 26, 48, 0.04)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        blink: {
          "0%, 80%, 100%": { opacity: "0.25" },
          "40%": { opacity: "1" },
        },
        "grow-bar": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.28s ease-out",
        "pop-in": "pop-in 0.2s ease-out",
        blink: "blink 1.2s infinite ease-in-out",
        "grow-bar": "grow-bar 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
