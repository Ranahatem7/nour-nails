import theme from "@/lib/theme";

// The one place a <style> tag exists: font import, CSS reset, and @keyframes
// (things inline styles can't express). Mounted once in the root layout.
export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Poppins:wght@300;400;500;600;700&display=swap');

      *, *::before, *::after {
        box-sizing: border-box;
      }

      html, body {
        margin: 0;
        padding: 0;
        max-width: 100vw;
        overflow-x: hidden;
      }

      body {
        min-height: 100vh;
        font-family: ${theme.fonts.body};
        color: ${theme.colors.text};
        background: ${theme.colors.background};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      button, input, select, textarea {
        font-family: inherit;
      }

      button {
        cursor: pointer;
      }

      img {
        max-width: 100%;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  );
}
