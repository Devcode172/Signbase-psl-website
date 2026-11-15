import React, { useMemo } from "react";
import "./HeroBubbles.css";

// Deterministic pseudo-random so SSR/hydration is stable
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function HeroBubbles({ count = 38 }) {
  const bubbles = useMemo(() => {
    const rand = seededRand(42);
    return Array.from({ length: count }, (_, i) => {
      const size   = 4 + rand() * 18;          // 4px – 22px
      const left   = rand() * 100;              // 0% – 100% across full hero width
      const delay  = rand() * 8;               // 0s – 8s delay
      const dur    = 7 + rand() * 10;          // 7s – 17s rise duration
      const opacity= 0.08 + rand() * 0.22;     // subtle; not distracting
      const wobble = rand() * 28 - 14;         // ± 14px horizontal drift
      const blur   = rand() > 0.65 ? 1 : 0;   // some are softly blurred

      return { id: i, size, left, delay, dur, opacity, wobble, blur };
    });
  }, [count]);

  return (
    <div className="hero-bubbles-layer" aria-hidden="true">
      {bubbles.map(b => (
        <span
          key={b.id}
          className="hb"
          style={{
            width:  `${b.size}px`,
            height: `${b.size}px`,
            left:   `${b.left}%`,
            animationDelay:    `${b.delay.toFixed(2)}s`,
            animationDuration: `${b.dur.toFixed(2)}s`,
            opacity: b.opacity,
            filter:  b.blur ? `blur(${b.blur}px)` : undefined,
            "--wobble": `${b.wobble.toFixed(1)}px`,
          }}
        />
      ))}
    </div>
  );
}
