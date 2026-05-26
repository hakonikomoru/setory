"use client";

import { useEffect, useRef } from "react";

type Props = {
  songId: string;
  line: string;
  className: string;
};

const MARQUEE_SPEED_PX_PER_SEC = 56;
const MIN_DURATION_MS = 6000;

export default function OverlayNowTitleMarquee({ songId, line, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const text = textRef.current;
    if (!track || !text) return;

    let animation: Animation | null = null;

    const stop = () => {
      animation?.cancel();
      animation = null;
      text.style.transform = "";
    };

    const start = () => {
      stop();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const trackWidth = track.clientWidth;
      const textWidth = text.scrollWidth;
      if (trackWidth < 1 || textWidth < 1) return;

      const fromPx = trackWidth;
      const toPx = -textWidth;
      const distance = fromPx - toPx;
      const durationMs = Math.max(
        MIN_DURATION_MS,
        (distance / MARQUEE_SPEED_PX_PER_SEC) * 1000,
      );

      animation = text.animate(
        [
          { transform: `translateX(${fromPx}px)` },
          { transform: `translateX(${toPx}px)` },
        ],
        {
          duration: durationMs,
          iterations: Infinity,
          easing: "linear",
        },
      );
    };

    const scheduleStart = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(start);
      });
    };

    scheduleStart();

    const ro = new ResizeObserver(scheduleStart);
    ro.observe(track);
    ro.observe(text);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", scheduleStart);
    void document.fonts?.ready.then(scheduleStart);

    return () => {
      ro.disconnect();
      mq.removeEventListener("change", scheduleStart);
      stop();
    };
  }, [songId, line]);

  return (
    <div ref={trackRef} className="overlay-now-title-track mt-1">
      <span ref={textRef} key={songId} className={`overlay-now-title-text ${className}`}>
        {line}
      </span>
    </div>
  );
}
