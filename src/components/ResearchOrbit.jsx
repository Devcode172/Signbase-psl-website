import React, { useState } from "react";
import {
  Hand,
  Users,
  Layers3,
  CheckCircle2,
  Database,
  ShieldCheck,
  Award,
  Activity,
  ArrowRight
} from "lucide-react";
import "./ResearchOrbit.css";

const RESEARCH_PILLARS = [
  {
    id: 1,
    title: "Domain-Specific Dataset",
    shortBadge: "47 Signs",
    sub: "Multi-signer corpus",
    icon: Hand,
    colorClass: "circle-card-1",
    tagColor: "#059669",
    tagBg: "#f0fdf4",
    tagBorder: "#bbf7d0",
    description:
      "A custom dataset focused on banking-related PSL vocabulary, collected across 10 diverse native and fluent signers under authentic counter conditions to mirror real-world branch interactions.",
    chips: [
      "47 Banking Classes (Withdrawal, Deposit, PIN)",
      "10 Diverse Signers (Balanced Gender & Hand Dominance)",
      "2,350 Clips Recorded at 60 FPS under Counter Lighting"
    ]
  },
  {
    id: 2,
    title: "Signer-Independent Evaluation",
    shortBadge: "LOSO 94.8%",
    sub: "Leave-One-Signer-Out",
    icon: Users,
    colorClass: "circle-card-2",
    tagColor: "#0284c7",
    tagBg: "#f0f7ff",
    tagBorder: "#bae6fd",
    description:
      "Evaluation strictly considers signers completely withheld during training to study how models generalize to new deaf customers approaching the counter for the very first time.",
    chips: [
      "94.8% Top-1 Unseen Signer Accuracy",
      "Zero Data Leakage Cross-Validation",
      "Inter-Signer Performance Variance < ±2.8%"
    ]
  },
  {
    id: 3,
    title: "Comparative Approaches",
    shortBadge: "Benchmark",
    sub: "Optimal architecture",
    icon: Layers3,
    colorClass: "circle-card-3",
    tagColor: "#7c3aed",
    tagBg: "#faf5ff",
    tagBorder: "#ddd6fe",
    description:
      "Landmark-based, 3D-CNN, and RGB transfer-learning architectures were evaluated to find the Pareto-optimal balance of sub-40ms latency and 100% customer facial privacy.",
    chips: [
      "MediaPipe + BiLSTM (Proposed: 94.8%, 32ms)",
      "Spatial 3D-CNN ResNet3D (91.2%, 145ms)",
      "100% Privacy-Preserving Landmark Pipeline"
    ]
  }
];

export default function ResearchOrbit() {
  const [selectedPillarId, setSelectedPillarId] = useState(1);
  const activePillar =
    RESEARCH_PILLARS.find((p) => p.id === selectedPillarId) || RESEARCH_PILLARS[0];

  return (
    <section className="research-orbit-section" id="research">
      {/* Ambient Radial Lighting Glow */}
      <div className="orbit-ambient-glow" />

      {/* Planetary Orbit Arena */}
      <div className="research-orbit-system">
        {/* Concentric Decorative Rings */}
        <div className="orbit-ring-outer" />
        <div className="orbit-ring-inner" />
        <div className="orbit-pulse-wave" />

        {/* ── CENTER HUB: "RESEARCH & INNOVATION" ─────────────── */}
        <div className="orbit-center-hub">
          <h2>Research &amp; Innovation</h2>
          <p>
            Evaluating recognition approaches for banking-domain PSL signs under authentic counter constraints.
          </p>
        </div>

        {/* ── ROTATING ORBIT TRACK (Revolves continuously) ────── */}
        <div className="orbit-track">
          {/* Node 1: Domain-Specific Dataset (Top: 0% / 50%) */}
          <div className="orbit-node-slot orbit-node-slot-1">
            <div className="orbit-circle">
              <div
                className="orbit-circle-card circle-card-1"
                onClick={() => setSelectedPillarId(1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedPillarId(1)}
              >
                <div className="orbit-circle-icon">
                  <Hand size={22} />
                </div>
                <h3>Domain-Specific Dataset</h3>
                <span className="orbit-circle-sub">Multi-signer corpus</span>
              </div>
            </div>
          </div>

          {/* Node 2: Signer-Independent Evaluation (Bottom Right) */}
          <div className="orbit-node-slot orbit-node-slot-2">
            <div className="orbit-circle">
              <div
                className="orbit-circle-card circle-card-2"
                onClick={() => setSelectedPillarId(2)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedPillarId(2)}
              >
                <div className="orbit-circle-icon">
                  <Users size={22} />
                </div>
                <h3>Signer-Independent Evaluation</h3>
                <span className="orbit-circle-sub">Unseen signers</span>
              </div>
            </div>
          </div>

          {/* Node 3: Comparative Approaches (Bottom Left) */}
          <div className="orbit-node-slot orbit-node-slot-3">
            <div className="orbit-circle">
              <div
                className="orbit-circle-card circle-card-3"
                onClick={() => setSelectedPillarId(3)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSelectedPillarId(3)}
              >
                <div className="orbit-circle-icon">
                  <Layers3 size={22} />
                </div>
                <h3>Comparative Approaches</h3>
                <span className="orbit-circle-sub">Optimal architecture</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Pillar Switcher Tabs */}
      <div className="orbit-pillar-tabs">
        {RESEARCH_PILLARS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`orbit-tab-btn ${selectedPillarId === p.id ? "active" : ""}`}
            onClick={() => setSelectedPillarId(p.id)}
          >
            <p.icon size={14} />
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* Active Pillar Detail Console */}
      <div className="orbit-active-drawer">
        <div className="active-drawer-header">
          <div className="active-drawer-title-wrap">
            <div
              className="active-drawer-icon"
              style={{
                background: activePillar.tagBg,
                color: activePillar.tagColor,
                border: `1px solid ${activePillar.tagBorder}`
              }}
            >
              <activePillar.icon size={18} />
            </div>
            <h4>{activePillar.title}</h4>
          </div>

          <span
            className="active-drawer-badge"
            style={{
              color: activePillar.tagColor,
              background: activePillar.tagBg,
              border: `1px solid ${activePillar.tagBorder}`
            }}
          >
            {activePillar.sub}
          </span>
        </div>

        <p className="active-drawer-desc">{activePillar.description}</p>

        <div className="active-drawer-chips">
          {activePillar.chips.map((chip, idx) => (
            <span key={idx} className="active-drawer-chip">
              <CheckCircle2 size={14} />
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
