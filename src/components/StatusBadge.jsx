import theme from "@/lib/theme";

const STYLES = {
  confirmed: { bg: theme.colors.secondaryLight, color: theme.colors.primaryDark, label: "Confirmed" },
  completed: { bg: theme.colors.successBg, color: theme.colors.success, label: "Completed" },
  cancelled: { bg: theme.colors.dangerBg, color: theme.colors.danger, label: "Cancelled" },
};

// Booking status pill — confirmed/completed/cancelled each get a distinct,
// on-brand color pulled from the theme so it stays consistent everywhere.
export default function StatusBadge({ status }) {
  const s = STYLES[status] || { bg: theme.colors.border, color: theme.colors.textMuted, label: status };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: theme.radii.pill,
        fontSize: "0.7rem",
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}
