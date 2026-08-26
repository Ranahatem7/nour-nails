"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useHover from "@/hooks/useHover";
import theme from "@/lib/theme";

// Nav link with an underline that appears on hover or when it's the active route.
export default function NavLink({ href, children }) {
  const pathname = usePathname();
  const [hovered, hoverHandlers] = useHover();
  const active = pathname === href;

  return (
    <Link
      href={href}
      {...hoverHandlers}
      style={{
        color: active ? theme.colors.primary : theme.colors.text,
        fontWeight: active ? 600 : 500,
        fontFamily: theme.fonts.body,
        fontSize: "0.95rem",
        paddingBottom: "4px",
        borderBottom: `2px solid ${active || hovered ? theme.colors.primary : "transparent"}`,
        transition: "border-color 0.2s ease, color 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
}
