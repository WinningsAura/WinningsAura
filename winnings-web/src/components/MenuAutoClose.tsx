"use client";

import { useEffect } from "react";

function closeAllOpenMenus(exceptWithin?: HTMLElement | null) {
  const openMenus = document.querySelectorAll<HTMLDetailsElement>("details.group[open]");

  openMenus.forEach((menu) => {
    if (exceptWithin && menu.contains(exceptWithin)) return;
    menu.removeAttribute("open");
  });
}

export default function MenuAutoClose() {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickedInsideOpenMenu = target.closest("details.group[open]");
      if (!clickedInsideOpenMenu) {
        closeAllOpenMenus();
      }
    }

    function onMenuItemClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickedLinkInsideMenu = target.closest("details.group[open] a");
      if (clickedLinkInsideMenu) {
        closeAllOpenMenus();
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAllOpenMenus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("click", onMenuItemClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("click", onMenuItemClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return null;
}
