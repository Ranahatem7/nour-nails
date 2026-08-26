"use client";

import useHover from "@/hooks/useHover";
import theme from "@/lib/theme";

// One available-time button on the booking page, with hover + selected states.
export default function SlotButton({ time, selected, onClick }) {
  const [hovered, hoverHandlers] = useHover();

  const background = selected
    ? theme.colors.primary
    : hovered
    ? theme.colors.secondaryLight
    : theme.colors.surface;

  return (
    <button
      type="button"
      onClick={onClick}
      {...hoverHandlers}
      style={{
        padding: "0.6rem 1.1rem",
        borderRadius: theme.radii.pill,
        border: `1px solid ${selected ? theme.colors.primary : theme.colors.border}`,
        background,
        color: selected ? theme.colors.textOnPrimary : theme.colors.text,
        fontWeight: selected ? 700 : 500,
        fontFamily: theme.fonts.body,
        fontSize: "0.9rem",
        transition: "background 0.15s ease, border-color 0.15s ease",
      }}
    >
      {time}
    </button>
  );
}
