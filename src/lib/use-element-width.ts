"use client";

import { useEffect, useRef, useState } from "react";

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [widthPx, setWidthPx] = useState<number | undefined>();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function measure() {
      const node = ref.current;
      if (!node) return;
      setWidthPx(Math.round(node.getBoundingClientRect().width));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, widthPx };
}
