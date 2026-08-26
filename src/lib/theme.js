// Single source of truth for design tokens. Import this everywhere instead of
// hardcoding colors/fonts/spacing — see AGENTS.md styling constraints.
const theme = {
  colors: {
    // Brand — hot pink/magenta from the logo, plus supporting tints/shades
    primary: "#d6006e",
    primaryDark: "#a3004f",
    primaryLight: "#ff4fa0",

    // Softer blush pink, secondary accent
    secondary: "#f6a8cc",
    secondaryLight: "#fce4ef",

    // Surfaces
    background: "#fff8fb",
    surface: "#ffffff",
    surfaceAlt: "#fdf1f6",
    border: "#f2d9e6",

    // Text
    text: "#2c1620",
    textMuted: "#8a6d78",
    textOnPrimary: "#ffffff",

    // Semantic status colors (used for booking statuses, form feedback)
    success: "#2e7d46",
    successBg: "#e5f4ea",
    danger: "#b5384a",
    dangerBg: "#fbe7ea",
    warning: "#9c6b12",
    warningBg: "#fbf0d9",
  },

  fonts: {
    heading: '"Playfair Display", Georgia, serif',
    body: '"Poppins", "Segoe UI", Arial, sans-serif',
  },

  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2.5rem",
    xxl: "4rem",
  },

  radii: {
    sm: "6px",
    md: "12px",
    lg: "20px",
    pill: "999px",
  },

  shadows: {
    sm: "0 1px 4px rgba(214, 0, 110, 0.08)",
    md: "0 6px 20px rgba(214, 0, 110, 0.12)",
    lg: "0 16px 40px rgba(214, 0, 110, 0.18)",
  },

  // Used by useIsDesktop — one mobile-first breakpoint
  breakpoints: {
    desktop: 768,
  },
};

export default theme;
