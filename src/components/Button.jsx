"use client";

import Link from "next/link";
import useHover from "@/hooks/useHover";
import theme from "@/lib/theme";

const VARIANTS = {
  primary: {
    bg: theme.colors.primary,
    bgHover: theme.colors.primaryDark,
    color: theme.colors.textOnPrimary,
    border: "none",
  },
  secondary: {
    bg: theme.colors.secondaryLight,
    bgHover: theme.colors.secondary,
    color: theme.colors.primaryDark,
    border: "none",
  },
  outline: {
    bg: "transparent",
    bgHover: theme.colors.surfaceAlt,
    color: theme.colors.primary,
    border: `1px solid ${theme.colors.primary}`,
  },
  danger: {
    bg: theme.colors.dangerBg,
    bgHover: theme.colors.danger,
    color: theme.colors.danger,
    colorHover: theme.colors.textOnPrimary,
    border: `1px solid ${theme.colors.dangerBg}`,
  },
  ghost: {
    bg: "transparent",
    bgHover: theme.colors.surfaceAlt,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
  },
};

const SIZES = {
  sm: { padding: "0.4rem 0.9rem", fontSize: "0.85rem" },
  md: { padding: "0.65rem 1.4rem", fontSize: "0.95rem" },
  lg: { padding: "0.9rem 2.2rem", fontSize: "1.05rem" },
};

// Reusable button/link with the shared hover pattern baked in — used for every
// CTA, form submit, and admin action across the app so hover/disabled states
// stay consistent without repeating onMouseEnter/onMouseLeave everywhere.
export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  type = "button",
  fullWidth = false,
  style = {},
  ...rest
}) {
  const [hovered, hoverHandlers] = useHover();
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    width: fullWidth ? "100%" : "auto",
    padding: s.padding,
    fontSize: s.fontSize,
    borderRadius: theme.radii.pill,
    fontFamily: theme.fonts.body,
    fontWeight: 600,
    border: v.border,
    background: disabled ? theme.colors.border : hovered ? v.bgHover : v.bg,
    color: disabled ? theme.colors.textMuted : hovered && v.colorHover ? v.colorHover : v.color,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: hovered && !disabled && variant === "primary" ? theme.shadows.md : "none",
    transform: hovered && !disabled ? "translateY(-1px)" : "translateY(0)",
    textAlign: "center",
    ...style,
  };

  if (href && !disabled) {
    return (
      <Link href={href} style={baseStyle} {...hoverHandlers} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      {...hoverHandlers}
      {...rest}
    >
      {children}
    </button>
  );
}
