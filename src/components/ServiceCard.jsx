"use client";

import useHover from "@/hooks/useHover";
import theme from "@/lib/theme";

// Service card with a hover lift. Used on the services page grid and the
// homepage services teaser.
export default function ServiceCard({ service }) {
  const [hovered, hoverHandlers] = useHover();

  return (
    <div
      {...hoverHandlers}
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radii.md,
        overflow: "hidden",
        border: `1px solid ${theme.colors.border}`,
        boxShadow: hovered ? theme.shadows.lg : theme.shadows.sm,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      {service.image_url ? (
        <img
          src={service.image_url}
          alt={service.name}
          style={{ width: "100%", height: "190px", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "190px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.colors.surfaceAlt,
            color: theme.colors.textMuted,
            fontFamily: theme.fonts.heading,
            fontSize: "1.1rem",
            textAlign: "center",
            padding: "1rem",
          }}
        >
          {service.name}
        </div>
      )}

      <div style={{ padding: "1.25rem" }}>
        <h3
          style={{
            fontFamily: theme.fonts.heading,
            color: theme.colors.text,
            margin: "0 0 0.4rem",
            fontSize: "1.15rem",
          }}
        >
          {service.name}
        </h3>

        {service.description && (
          <p
            style={{
              color: theme.colors.textMuted,
              fontSize: "0.9rem",
              margin: "0 0 0.9rem",
              lineHeight: 1.5,
            }}
          >
            {service.description}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: theme.colors.primary, fontWeight: 700, fontSize: "1.1rem" }}>
            {service.price} EGP
          </span>
          <span style={{ color: theme.colors.textMuted, fontSize: "0.85rem" }}>
            {service.duration_minutes} min
          </span>
        </div>
      </div>
    </div>
  );
}
