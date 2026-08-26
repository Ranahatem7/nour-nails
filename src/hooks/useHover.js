"use client";

import { useState } from "react";

// Reusable hover-state pattern: inline styles can't do :hover, so components
// spread `hoverHandlers` onto the element and read `hovered` to swap style values.
export default function useHover() {
  const [hovered, setHovered] = useState(false);

  const hoverHandlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  return [hovered, hoverHandlers];
}
