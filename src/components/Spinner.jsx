import theme from "@/lib/theme";

// Uses the @keyframes spin defined once in GlobalStyles.
export default function Spinner({ size = 18 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `2px solid ${theme.colors.border}`,
        borderTopColor: theme.colors.primary,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
