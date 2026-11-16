import React from "react";
import {
  ScanFace,
  Hand
} from "lucide-react";
import "./HowItWorksStack.css";

export default function HowItWorksStack() {
  return (
    <section className="how-it-works-stack-section" id="workflow">
      {/* Editorial Section Header */}
      <div className="stack-section-header">
        <div className="stack-header-left">
          <h2>
            From a sign to a <span>shared understanding.</span>
          </h2>
          <p>
            An intelligent 3-step pipeline designed specifically for physical banking counters — connecting customer tablet capture to teller verification in under 1.2 seconds.
          </p>
        </div>
      </div>

      {/* Overlapping Sticky Stacking Cards Track (effepinnastudio style) */}
      <div className="stack-cards-track">
        {/* ── CARD 01: Capture ──────────────────────────────── */}
        <article className="stack-row-card stack-card-1">
          <div className="stack-copy">
            <div className="stack-card-meta-top">
              <span className="stack-step-tag">01</span>
            </div>

            <h3>Customer Signs at Counter</h3>

            <p>
              The customer performs a supported Pakistan Sign Language banking sign in front of the counter-mounted tablet. High-frame-rate capture isolates hand articulation while preserving facial privacy.
            </p>

            <div className="stack-tags-row">
              <span className="stack-tag">60 FPS Capture</span>
              <span className="stack-tag">Privacy-Preserving</span>
              <span className="stack-tag">Motion Trigger</span>
            </div>
          </div>

          <div className="stack-visual-pane">
            <div className="sim-window">
              <div className="sim-header">
                <div className="sim-header-left">
                  <span className="sim-header-title">LIVE CAM</span>
                </div>
                <div className="sim-header-right">
                  <span>60 FPS</span>
                  <span>CONFIDENCE 99.4%</span>
                </div>
              </div>

              <div className="sim-stage-capture">
                <div className="viewfinder-box">
                  <div className="viewfinder-scan-line" />
                  <Hand size={84} className="viewfinder-hand-icon" strokeWidth={1.5} />
                  <div className="viewfinder-coords">LANDMARK 21-PT SKELETON (ACTIVE)</div>
                </div>
              </div>

              <div className="sim-footer">
                <span className="sim-footer-status">
                  GESTURE POSITION STABILIZED
                </span>
                <span>STATUS: READY FOR INFERENCE</span>
              </div>
            </div>
          </div>
        </article>

        {/* ── CARD 02: Neural Recognition ──────────────────── */}
        <article className="stack-row-card stack-card-2">
          <div className="stack-copy">
            <div className="stack-card-meta-top">
              <span className="stack-step-tag">02</span>
            </div>

            <h3>AI Analyzes &amp; Classifies</h3>

            <p>
              Temporal landmark sequences are evaluated against the 47-class PSL banking dictionary. The deep learning model identifies gesture trajectories, handshapes, and orientation in real time.
            </p>

            <div className="stack-tags-row">
              <span className="stack-tag">Deep Learning Engine</span>
              <span className="stack-tag">&lt;14ms Inference</span>
              <span className="stack-tag">47 Banking Classes</span>
            </div>
          </div>

          <div className="stack-visual-pane">
            <div className="sim-window">
              <div className="sim-header">
                <div className="sim-header-left">
                  <span className="sim-header-title">SIGNBASE-CNN-LSTM</span>
                </div>
                <div className="sim-header-right">
                  <span>LATENCY 14MS</span>
                  <span>ACCURACY 96.8%</span>
                </div>
              </div>

              <div className="sim-stage-ai">
                <div className="neural-rings-wrap">
                  <div className="n-ring n-ring-1" />
                  <div className="n-ring n-ring-2" />
                  <div className="n-ring n-ring-3" />
                  <ScanFace size={64} className="neural-center-icon" strokeWidth={1.5} />
                </div>

                <div className="neural-confidence-box">
                  <div className="conf-item">
                    <small>TOP PREDICTION</small>
                    <b>Account Inquiry</b>
                  </div>
                  <div className="conf-item" style={{borderLeft:"1px solid rgba(100,200,255,0.2)", paddingLeft:"14px"}}>
                    <small>PROBABILITY</small>
                    <b>98.7% MATCH</b>
                  </div>
                </div>
              </div>

              <div className="sim-footer">
                <span className="sim-footer-status">
                  CLASSIFICATION RESOLVED: "ACCOUNT" #7180
                </span>
                <span>DISPATCHING WEBSOCKET PAYLOAD</span>
              </div>
            </div>
          </div>
        </article>

        {/* ── CARD 03: Teller Display ───────────────────────── */}
        <article className="stack-row-card stack-card-3">
          <div className="stack-copy">
            <div className="stack-card-meta-top">
              <span className="stack-step-tag">03</span>
            </div>

            <h3>Teller Receives Verified Term</h3>

            <p>
              The translated request is immediately displayed on the teller's screen in verified English. The teller proceeds with the customer's request without verbal friction or interpreter delays.
            </p>

            <div className="stack-tags-row">
              <span className="stack-tag">Dual-Screen Sync</span>
              <span className="stack-tag">Verified Output</span>
              <span className="stack-tag">Immediate Service</span>
            </div>
          </div>

          <div className="stack-visual-pane">
            <div className="sim-window">
              <div className="sim-header">
                <div className="sim-header-left">
                  <span className="sim-header-title">TELLER DESKTOP TERMINAL</span>
                </div>
                <div className="sim-header-right">
                  <span>SESSION #418</span>
                  <span>ENCRYPTED</span>
                </div>
              </div>

              <div className="sim-stage-teller">
                <div className="teller-terminal-card">
                  <div className="teller-terminal-top">
                    <span>INCOMING REQUEST</span>
                    <span className="teller-status-pill">VERIFIED PSL</span>
                  </div>

                  <div className="teller-terminal-body">
                    <span className="teller-label">RECOGNIZED BANKING ACTION</span>
                    <div className="teller-recognized-term">
                      <h4>Account Inquiry</h4>
                    </div>

                    <div className="teller-desc-box">
                      Customer is inquiring about account balance or statement details.
                    </div>

                    <div className="teller-actions-row">
                      <div className="teller-btn-primary">
                        Accept &amp; Process Request
                      </div>
                      <div className="teller-btn-secondary">
                        Print Slip
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sim-footer">
                <span className="sim-footer-status">
                  SERVICE IN PROGRESS (ZERO BARRIER)
                </span>
                <span>AUDIT LOGGED</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
