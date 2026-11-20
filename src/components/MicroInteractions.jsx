import { useEffect } from "react";

export default function MicroInteractions() {
  useEffect(() => {
    const handlePointerDown = (event) => {
      const button = event.target.closest("button, .btn, [role='button']");
      if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const bounds = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "interaction-ripple";
      ripple.style.left = `${event.clientX - bounds.left}px`;
      ripple.style.top = `${event.clientY - bounds.top}px`;
      button.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return null;
}
