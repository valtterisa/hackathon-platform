"use client";

import { useEffect } from "react";

export function RevealInit() {
  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>(".reveal");
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    nodes.forEach((n, i) => {
      n.style.transitionDelay = `${(i % 4) * 70}ms`;
      io.observe(n);
    });
    return () => io.disconnect();
  }, []);
  return null;
}
