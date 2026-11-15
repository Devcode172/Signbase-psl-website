import React, { useState, useEffect, useRef } from "react";
import { Hand } from "lucide-react";
import "./preloader.css";

export default function Preloader({ onComplete }) {
  const [phase, setPhase] = useState(1); // 1: 0-0.5s, 2: 0.5-1.5s, 3: 1.5-2.5s, 4: 2.5s+, 5: fadeout
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING PSL SYSTEM...");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [flyTransform, setFlyTransform] = useState(null);

  const handRef = useRef(null);

  useEffect(() => {
    const start = performance.now();

    // 1. 0–0.5s: Dark navy background fades in
    // 2. 0.5–1.5s: Glowing blue/cyan circular rings appear and rotate
    const timerRings = setTimeout(() => {
      setPhase(2);
    }, 500);

    // 3. 1.5–2.5s: Hand/sign-language icon appears with subtle scanning effect
    const timerHand = setTimeout(() => {
      setPhase(3);
    }, 1500);

    // 4. 2.5s onward: Progress bar fills while the website loads
    const timerProgress = setTimeout(() => {
      setPhase(4);
    }, 2500);

    let raf;
    let flightTriggered = false;

    function updateProgress(now) {
      const elapsed = (now - start) / 1000; // in seconds

      if (elapsed >= 2.5) {
        // Progress ramps from 0% at 2.5s to 100% at 4.2s
        const p = Math.min(100, Math.floor(((elapsed - 2.5) / 1.7) * 100));
        setProgress(p);

        if (p < 35) {
          setStatusText("INITIALIZING NEURAL PSL ENGINE...");
        } else if (p < 70) {
          setStatusText("CALIBRATING 47 BANKING SIGNS...");
        } else if (p < 95) {
          setStatusText("CONFIGURING 3D WIREFRAME MODEL...");
        } else {
          setStatusText("SYSTEM READY • ACCESS GRANTED");
        }

        // 5. When loading animation completes:
        // First expand logo 4.8x in center, then smoothly fly and shrink into header logo position
        if (p >= 100 && !flightTriggered) {
          flightTriggered = true;
          setIsFadingOut(true);

          // Phase 1: Expand logo 3x in the center
          setIsExpanding(true);

          // Phase 2: After expansion peak, fly and decrease size into hero section logo
          setTimeout(() => {
            const target = document.querySelector(".brand-mark");
            if (target && handRef.current) {
              const targetRect = target.getBoundingClientRect();
              const handRect = handRef.current.getBoundingClientRect();

              const startX = handRect.left + handRect.width / 2;
              const startY = handRect.top + handRect.height / 2;
              const endX = targetRect.left + targetRect.width / 2;
              const endY = targetRect.top + targetRect.height / 2;

              const deltaX = endX - startX;
              const deltaY = endY - startY;

              // Scale down to match target header logo size
              const finalScale = (targetRect.width || 42) / 52;

              setIsExpanding(false);
              setFlyTransform(`translate3d(${deltaX.toFixed(1)}px, ${deltaY.toFixed(1)}px, 0) scale(${finalScale.toFixed(3)})`);
            }

            // Phase 3: Complete transition when logo lands in the hero header
            setTimeout(() => {
              setIsDone(true);
              if (onComplete) onComplete();
            }, 900);
          }, 480);

          return;
        }
      }

      if (!isDone) {
        raf = requestAnimationFrame(updateProgress);
      }
    }

    raf = requestAnimationFrame(updateProgress);

    return () => {
      clearTimeout(timerRings);
      clearTimeout(timerHand);
      clearTimeout(timerProgress);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (isDone) return null;

  return (
    <div
      className={`preloader-overlay ${isFadingOut ? "preloader-fadeout" : ""} phase-${phase}`}
      aria-label="Loading SignBase PSL"
    >
      {/* Smooth fading backdrop covering screen during load */}
      <div className="preloader-backdrop" />

      {/* Background cyber radial glow */}
      <div className="preloader-bg-glow" />
      <div className="preloader-bg-grid" />

      <div className="preloader-content">
        {/* Step 2 & 3: Circular rotating rings & hand icon */}
        <div className={`preloader-rings-wrap ${phase >= 2 ? "rings-active" : ""}`}>
          <div className="preloader-ring ring-outer" />
          <div className="preloader-ring ring-middle" />
          <div className="preloader-ring ring-inner" />

          {/* Hand icon: scans in center, then flies to the logo upon completion */}
          <div
            ref={handRef}
            className={`preloader-hand-wrap ${phase >= 3 ? "hand-active" : ""} ${isExpanding ? "hand-expanding" : ""} ${flyTransform ? "hand-flying" : ""}`}
            style={flyTransform ? { transform: flyTransform } : undefined}
          >
            <img src={`${import.meta.env.BASE_URL}psl-emblem-white.png`} alt="PSL" className="preloader-psl-logo" />
            {!isExpanding && !flyTransform && <div className="preloader-scan-beam" />}
            {!isExpanding && !flyTransform && <div className="preloader-scan-dot" />}
          </div>
        </div>

        {/* Step 4: Progress bar and status indicators (2.5s onward) */}
        <div className={`preloader-progress-wrap ${phase >= 4 ? "progress-active" : ""}`}>
          <div className="preloader-info-row">
            <span className="preloader-status-tag">
              <span className="preloader-status-dot" />
              {statusText}
            </span>
            <span className="preloader-percent">{progress}%</span>
          </div>

          <div className="preloader-bar-track">
            <div
              className="preloader-bar-fill"
              style={{ width: `${progress}%` }}
            >
              <span className="preloader-bar-glint" />
            </div>
          </div>

          <div className="preloader-subtext">
            <span>SIGNBASE PSL</span>
            <span>ACCESSIBILITY FOR BANKING</span>
          </div>
        </div>
      </div>
    </div>
  );
}
