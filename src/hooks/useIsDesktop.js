"use client";

import { useState, useEffect } from "react";
import theme from "@/lib/theme";

// Mobile-first: defaults to false (mobile) until the effect measures the
// real viewport on the client, then tracks it across resizes.
export default function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= theme.breakpoints.desktop);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return isDesktop;
}
