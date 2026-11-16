import React, { useState, useEffect, useRef } from "react";
import ParticleNetwork from "./ParticleNetwork";
import {
  Hand,
  Users,
  Layers3,
  CheckCircle2,
  Database,
  ShieldCheck,
  Award,
  Activity,
  ArrowRight,
  Sparkles
} from "lucide-react";
import "./ResearchOrbit.css";

const RESEARCH_TABLES = [
  {
    id: 1,
    title: "Domain-Specific Dataset",
    sub: "Multi-signer corpus",
    icon: Hand,
    colorClass: "circle-card-1",
    tagColor: "#059669",
    tagBg: "#f0fdf4",
    tagBorder: "#bbf7d0",
    description:
      "A custom dataset focused on banking-related PSL vocabulary, collected across 10 diverse native and fluent signers under authentic counter conditions to mirror real-world branch interactions.",
    columns: ["Focus Area", "Specification", "Counter Context"],
    rows: [
      {
        col1: "Banking Classes",
        col2: "47 Classes",
        col3: "Withdrawal, Deposit, PIN"
      },
      {
        col1: "Signer Demographics",
        col2: "10 Diverse Signers",
        col3: "Balanced Gender & Hand Dominance"
      },
      {
        col1: "Corpus Volume",
        col2: "2,350 Clips",
        col3: "Recorded at 60 FPS under Counter Lighting"
      }
    ]
  },
  {
    id: 2,
    title: "Signer-Independent Evaluation",
    sub: "Leave-One-Signer-Out",
    icon: Users,
    colorClass: "circle-card-2",
    tagColor: "#0284c7",
    tagBg: "#f0f7ff",
    tagBorder: "#bae6fd",
    description:
      "Evaluation strictly considers signers completely withheld during training to study how models generalize to new deaf customers approaching the counter for the very first time.",
    columns: ["Metric", "Result", "Protocol Scope"],
    rows: [
      {
        col1: "Generalization Accuracy",
        col2: "94.8% Top-1 Accuracy",
        col3: "Unseen Signer Accuracy"
      },
      {
        col1: "Validation Method",
        col2: "Zero Data Leakage",
        col3: "Leave-One-Signer-Out Cross-Validation"
      },
      {
        col1: "Signer Consistency",
        col2: "< ±2.8% Variance",
        col3: "Inter-Signer Performance Variance"
      }
    ]
  },
  {
    id: 3,
    title: "Comparative Approaches",
    sub: "Optimal architecture",
    icon: Layers3,
    colorClass: "circle-card-3",
    tagColor: "#6366f1",
    tagBg: "#faf5ff",
    tagBorder: "#ddd6fe",
    description:
      "Landmark-based, 3D-CNN, and RGB transfer-learning architectures were evaluated to find the Pareto-optimal balance of sub-40ms latency and 100% customer facial privacy.",
    columns: ["Architecture", "Performance", "Privacy & Feature Profile"],
    rows: [
      {
        col1: "MediaPipe + BiLSTM",
        col2: "94.8% (32ms)",
        col3: "Proposed Optimal Architecture"
      },
      {
        col1: "Spatial 3D-CNN ResNet3D",
        col2: "91.2% (145ms)",
        col3: "Volumetric Video Benchmark"
      },
      {
        col1: "Landmark Pipeline",
        col2: "100% Privacy",
        col3: "Preserving Customer Facial Identity"
      }
    ]
  }
];

function getCellTyping(fullText, startMs, durationMs, elapsedMs) {
  if (elapsedMs < startMs) {
    return { text: "", isTyping: false };
  }
  if (elapsedMs >= startMs + durationMs) {
    return { text: fullText, isTyping: false };
  }
  const ratio = (elapsedMs - startMs) / durationMs;
  const count = Math.max(1, Math.floor(fullText.length * ratio));
  return {
    text: fullText.slice(0, count),
    isTyping: true,
  };
}

export default function ResearchOrbit() {
  const [selectedTableId, setSelectedTableId] = useState(1);
  const [tableInView, setTableInView] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const cardRef = useRef(null);

  // Trigger typewriter writing animation when table enters viewport
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTableInView(true);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animate writing of table data over 4.5s
  useEffect(() => {
    if (!tableInView) return undefined;
    let startTime = null;
    let rafId = null;
    const TOTAL_DURATION = 4500; // 4.5 seconds

    setElapsedMs(0);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      setElapsedMs(progress);

      if (progress < TOTAL_DURATION) {
        rafId = requestAnimationFrame(step);
      } else {
        setElapsedMs(TOTAL_DURATION);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [selectedTableId, tableInView]);

  const activeTable =
    RESEARCH_TABLES.find((t) => t.id === selectedTableId) || RESEARCH_TABLES[0];

  return (
    <section className="research-orbit-section" id="research">
      {/* Background Animated Particle Network (radisist.com style) */}
      <ParticleNetwork />

      {/* Ambient Radial Lighting Glow */}
      <div className="orbit-ambient-glow" />

      {/* Planetary Orbit Arena */}
      <div className="research-orbit-system">
        {/* ── CENTER HUB: "RESEARCH & INNOVATION" ─────────────── */}
        <div className="orbit-center-hub">
          <h2>Research &amp; Innovation</h2>
          <p>
            Evaluating recognition approaches for banking-domain PSL signs under authentic counter constraints.
          </p>
        </div>

        {/* ── Node 1: Domain-Specific Dataset (Fixed distance, 0° start) ── */}
        <div className="orbit-node orbit-node-1">
          <div
            className="orbit-circle-card circle-card-1"
            onClick={() => setSelectedTableId(1)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelectedTableId(1)}
          >
            <div className="orbit-circle-icon">
              <Hand size={20} />
            </div>
            <h3>Domain-Specific Dataset</h3>
            <span className="orbit-circle-sub">Multi-signer corpus</span>
          </div>
        </div>

        {/* ── Node 2: Signer-Independent Evaluation (Fixed distance, 120° offset) ── */}
        <div className="orbit-node orbit-node-2">
          <div
            className="orbit-circle-card circle-card-2"
            onClick={() => setSelectedTableId(2)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelectedTableId(2)}
          >
            <div className="orbit-circle-icon">
              <Users size={20} />
            </div>
            <h3>Signer-Independent Evaluation</h3>
            <span className="orbit-circle-sub">Unseen signers</span>
          </div>
        </div>

        {/* ── Node 3: Comparative Approaches (Fixed distance, 240° offset) ── */}
        <div className="orbit-node orbit-node-3">
          <div
            className="orbit-circle-card circle-card-3"
            onClick={() => setSelectedTableId(3)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setSelectedTableId(3)}
          >
            <div className="orbit-circle-icon">
              <Layers3 size={20} />
            </div>
            <h3>Comparative Approaches</h3>
            <span className="orbit-circle-sub">Optimal architecture</span>
          </div>
        </div>
      </div>

      {/* ── RESEARCH TABLES CONSOLE ─────────────────────────── */}
      <div className="research-tables-console">
        {/* Table Selector Tabs */}
        <div className="research-table-tabs" role="tablist">
          {RESEARCH_TABLES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selectedTableId === t.id}
              className={`table-segment-tab ${selectedTableId === t.id ? "tab-active" : ""}`}
              onClick={() => setSelectedTableId(t.id)}
            >
              <t.icon size={15} />
              <span className="tab-text-title">{t.title}</span>
            </button>
          ))}
        </div>

        {/* Clean Human-Designed Table Card */}
        <div className="research-data-card" ref={cardRef}>
          <div className="data-card-header">
            <div className="data-card-title-group">
              <h3 className="data-table-heading">{activeTable.title}</h3>
              <p className="data-table-summary">{activeTable.description}</p>
            </div>
          </div>

          {/* Responsive Table with 4-5s Data Writing Animation */}
          <div className="research-table-responsive">
            <table className="human-research-table">
              <thead>
                <tr>
                  {activeTable.columns.map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeTable.rows.map((row, idx) => {
                  const rowStart = idx * 1450;
                  const c1 = getCellTyping(row.col1, rowStart, 450, elapsedMs);
                  const c2 = getCellTyping(row.col2, rowStart + 420, 450, elapsedMs);
                  const c3 = getCellTyping(row.col3, rowStart + 840, 560, elapsedMs);

                  return (
                    <tr key={idx}>
                      <td className="cell-primary">
                        <b>{c1.text}</b>
                        {c1.isTyping && <span className="table-typing-cursor">|</span>}
                      </td>
                      <td className="cell-spec">
                        <span className="cell-val">{c2.text}</span>
                        {c2.isTyping && <span className="table-typing-cursor">|</span>}
                      </td>
                      <td className="cell-context">
                        <span>{c3.text}</span>
                        {c3.isTyping && <span className="table-typing-cursor">|</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
