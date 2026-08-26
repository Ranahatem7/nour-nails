"use client";

import { useState } from "react";
import theme from "@/lib/theme";

// Styled <select>, sibling to Input — same focus-ring treatment for consistency.
export default function Select({ children, style = {}, onFocus, onBlur, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <select
      {...props}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      style={{
        width: "100%",
        padding: "0.7rem 1rem",
        borderRadius: theme.radii.sm,
        border: `1px solid ${focused ? theme.colors.primary : theme.colors.border}`,
        outline: "none",
        fontFamily: theme.fonts.body,
        fontSize: "0.95rem",
        color: theme.colors.text,
        background: theme.colors.surface,
        boxShadow: focused ? `0 0 0 3px ${theme.colors.secondaryLight}` : "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </select>
  );
}
