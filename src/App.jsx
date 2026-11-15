import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronDown, Cpu, Hand,
  Landmark, Menu, Monitor, ScanFace, ShieldCheck, Sparkles, Users, Video,
  X, Github, Linkedin, Mail, GraduationCap, Layers3, Workflow, HeartHandshake,
  Clock, Lock, FileText, XCircle, AlertCircle
} from "lucide-react";
import WireframeHero from "./components/WireframeHero";
import Preloader from "./components/Preloader";
import HowItWorksStack from "./components/HowItWorksStack";
import ResearchOrbit from "./components/ResearchOrbit";
import "./hero-heading.css";
import "./hero-mission.css";
import "./navbar.css";
import "./buttons.css";
import "./challenge-section.css";
import "./product-experience.css";
import "./technology-section.css";
import "./research-section.css";
import "./footer.css";
import "./heading-emerge.css";

function Header({ logoArrived }) {
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [["How it works", "#workflow"], ["Technology", "#technology"], ["Research", "#research"]];

  return (
    <header className={`site-header${scrolled ? " site-header--scrolled" : ""}`}>
      <a className="brand" href="#home">
        <span className={`brand-mark ${logoArrived ? "brand-mark-arrived" : "brand-mark-waiting"}`}>
          <img src={`${import.meta.env.BASE_URL}psl-emblem-white.png`} alt="Pakistan Sign Language Logo" className="brand-psl-logo" />
        </span>
        <span>SignBase <b>PSL</b></span>
      </a>
      <nav className={open ? "nav-links open" : "nav-links"}>
        {links.map(([label, href]) => (
          <a key={href} href={href} className="nav-link" onClick={() => setOpen(false)}>
            <span className="nav-link-text">{label}</span>
            <span className="nav-link-line" aria-hidden="true"/>
          </a>
        ))}
      </nav>
      <a className="header-cta" href="#technology">
        Explore the technology <ArrowUpRight size={14}/>
      </a>
      <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
        {open ? <X/> : <Menu/>}
      </button>
    </header>
  );
}

function SectionHeading({ eyebrow, title, text, centered = false }) {
  return <div className={`section-heading ${centered ? "centered" : ""}`}>
    <span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{text && <p>{text}</p>}
  </div>;
}

function AnimatedStatCard({ icon: Icon, badge, targetNumber, formatValue, label, themeClass, delay = 0 }) {
  const [value, setValue] = useState(0);
  const [inView, setInView] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return undefined;
    const duration = 1500;
    let startTime;
    let raf;

    const animateCount = (now) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(targetNumber * ease);
      if (progress < 1) {
        raf = requestAnimationFrame(animateCount);
      } else {
        setValue(targetNumber);
      }
    };

    const timer = setTimeout(() => {
      raf = requestAnimationFrame(animateCount);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [inView, targetNumber, delay]);

  return (
    <div
      ref={cardRef}
      className={`stat-metric-card ${themeClass} ${inView ? "stat-in-view" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="stat-top-row">
        <div className="stat-icon-wrap"><Icon size={18}/></div>
      </div>
      <div className="stat-number">{formatValue(value, inView)}</div>
      <p className="stat-label">{label}</p>
      <div className="stat-card-glow-bg" />
      <div className="stat-card-sheen" />
    </div>
  );
}

function App() {
  const [siteReady, setSiteReady] = useState(false);

  useEffect(() => {
    // Only activate heading emergence once preloader has finished and the site is visible
    if (!siteReady) return undefined;

    const timer = setTimeout(() => {
      // Select main heading containers across all sections
      const targets = document.querySelectorAll(
        ".hero-statement-inner, .intro-header-wrap, .stack-section-header, .pe-header-copy, .tech-pipeline-header, .orbit-center-hub, .closing-cta-content"
      );

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("emerged");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -40px 0px"
        }
      );

      targets.forEach((el) => {
        el.classList.add("heading-emerge-wrap");
        observer.observe(el);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [siteReady]);

  return (
    <>
      <Preloader onComplete={() => setSiteReady(true)} />
      <div className="app-shell">
    {/* HERO SECTION — 3D HUMAN & LAPTOP ANIMATION ONLY (CENTERED & ENLARGED) */}
    <div className="hero-wrap" id="home">
      <div className="hero-glow glow-one"/><div className="hero-glow glow-two"/>
      <Header logoArrived={siteReady} />
      <div className="hero-explore-banner">
        <a className="hero-explore-btn" href="#technology">
          Explore the technology <ArrowUpRight size={15}/>
        </a>
      </div>
      <main className="hero hero-centered-stage">
        <div className="hero-visual-fullscreen">
          <WireframeHero/>
        </div>
      </main>
    </div>

    {/* NEW SECTION AFTER HERO: HERO MISSION STATEMENT & ACTIONS */}
    <section className="hero-statement-section" id="about">
      <div className="hero-statement-inner">
        <h2>
          Breaking the communication barrier at the <span>bank counter.</span>
        </h2>
        <p className="hero-statement-desc">
          SignBase PSL explores AI-powered recognition of Pakistan Sign Language, helping customers communicate their banking needs through a focused vocabulary of 47 banking-related signs.
        </p>
        <div className="hero-statement-actions">
          <a className="button button-primary" href="#workflow">See how it works <ArrowRight size={17}/></a>
          <a className="button button-outline-fintech" href="#research">Explore the research</a>
        </div>
      </div>
    </section>

    {/* REDESIGNED SECTION AFTER HERO: MODERN FINTECH SPLIT CARDS */}
    <section className="fintech-intro-section" id="problem">
      <div className="intro-header-wrap">
        <h2>
          Bridging the silence between <span>customer and counter.</span>
        </h2>
        <p>
          Over 1.5 million Deaf Pakistanis encounter barriers when accessing everyday banking services. SignBase PSL replaces guesswork with immediate, AI-driven sign language understanding.
        </p>
      </div>

      {/* 4-Stat Metric Quick Facts with Live Count & Hover Animations */}
      <div className="intro-stats-grid">
        <AnimatedStatCard
          icon={Users}
          targetNumber={1.5}
          formatValue={(val, active) => active ? <>{val.toFixed(1)}M<em>+</em></> : <>1.5M<em>+</em></>}
          label="Deaf citizens in Pakistan navigating branch banking without sign support."
          themeClass="stat-theme-green"
          delay={0}
        />
        <AnimatedStatCard
          icon={Hand}
          targetNumber={47}
          formatValue={(val, active) => active ? <>{Math.floor(val)}<em> Signs</em></> : <>47<em> Signs</em></>}
          label="Targeted banking vocabulary covering deposits, inquiries, loans & security."
          themeClass="stat-theme-blue"
          delay={120}
        />
        <AnimatedStatCard
          icon={Clock}
          targetNumber={1.2}
          formatValue={(val, active) => active ? <>&lt;{val.toFixed(1)}<em>s</em></> : <>&lt;1.2<em>s</em></>}
          label="Real-time gesture analysis to teller screen transcription latency."
          themeClass="stat-theme-cyan"
          delay={240}
        />
        <AnimatedStatCard
          icon={ShieldCheck}
          targetNumber={100}
          formatValue={(val, active) => active ? <>{Math.floor(val)}<em>%</em></> : <>100<em>%</em></>}
          label="Financial privacy and autonomous banking without third-party chaperones."
          themeClass="stat-theme-purple"
          delay={360}
        />
      </div>

      {/* Side-by-Side Split Cards: Challenge vs Solution */}
      <div className="split-cards-container">
        {/* Card 1: The Challenge */}
        <div className="challenge-card">
          <h3>Current Branch Reality</h3>
          <p className="challenge-card-desc">
            Retail bank branches are designed around verbal interactions. When a Deaf customer steps up to the counter, communication stalls immediately.
          </p>

          <div className="pain-points-list">
            <div className="pain-point-item">
              <div className="pain-icon-box"><XCircle size={17}/></div>
              <div className="pain-point-content">
                <b>Zero Interpreter Availability</b>
                <p>Over 98% of physical bank branches have no sign-fluent tellers or on-demand interpreter access.</p>
              </div>
            </div>

            <div className="pain-point-item">
              <div className="pain-icon-box"><Lock size={17}/></div>
              <div className="pain-point-content">
                <b>Compromised Financial Confidentiality</b>
                <p>Customers must share sensitive balance queries or PIN instructions through relatives or paper notes.</p>
              </div>
            </div>

            <div className="pain-point-item">
              <div className="pain-icon-box"><FileText size={17}/></div>
              <div className="pain-point-content">
                <b>Banking Terminology Misalignment</b>
                <p>Complex financial terms (clearing, overdraft, remittance, KYC) are difficult to convey via handwritten notes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: The SignBase Solution */}
        <div className="solution-fintech-card">
          <h3>SignBase PSL <em>Approach</em></h3>
          <p className="solution-card-desc">
            A customer-facing tablet captures Pakistan Sign Language gestures in real time, converting standard banking signs into instant English and Urdu terms on the teller's screen.
          </p>

          <div className="solution-points-list">
            <div className="solution-point-item">
              <div className="solution-icon-box"><CheckCircle2 size={17}/></div>
              <div className="solution-point-content">
                <b>47 Standardized PSL Banking Signs</b>
                <p>Trained on authentic Pakistan Sign Language dataset curated specifically for counter transactions.</p>
              </div>
            </div>

            <div className="solution-point-item">
              <div className="solution-icon-box"><ShieldCheck size={17}/></div>
              <div className="solution-point-content">
                <b>Complete User Independence</b>
                <p>Empowers the customer to conduct confidential banking without relying on friends, family, or notes.</p>
              </div>
            </div>

            <div className="solution-point-item">
              <div className="solution-icon-box"><Cpu size={17}/></div>
              <div className="solution-point-content">
                <b>Dual-Screen Synchronized Flow</b>
                <p>Signer gets live pose confirmation while the teller receives the verified Urdu and English banking action.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* HOW IT WORKS SECTION — EFFEPINNA STUDIO STICKY STACKING CARDS */}
    <HowItWorksStack />

    {/* PRODUCT EXPERIENCE SECTION — REDESIGNED WITH SPLIT GRADIENT PRESERVED */}
    <section className="product-experience-section" id="product">
      <div className="pe-header-wrap">
        <div className="pe-header-copy">
          <div className="pe-eyebrow">
            <span className="pe-eyebrow-dot" />
            PRODUCT EXPERIENCE
          </div>
          <h2>
            Two interfaces.<br />
            <span>One connected experience.</span>
          </h2>
          <p>
            The proposed system bridges the accessibility divide at bank counters by pairing a high-responsiveness customer tablet terminal with an intuitive teller workstation.
          </p>
        </div>
        <div className="pe-sync-badge">
          <span className="pe-sync-dot" />
          Encrypted WebSocket Stream · &lt;1.2s Latency
        </div>
      </div>

      <div className="pe-stage-grid">
        {/* Customer Panel */}
        <div className="pe-panel-card pe-panel-customer">
          <div className="pe-device-meta">
            <span className="pe-device-tag">01 / Customer Interface</span>
            <span className="pe-device-os">Flutter · Android Tablet</span>
          </div>
          <h3>Tablet application</h3>
          <p className="pe-panel-desc">
            Self-service counter terminal with low-latency edge landmark extraction and privacy-first visual guidance.
          </p>

          <div className="pe-tablet-chassis">
            <div className="pe-tablet-notch" />
            <div className="pe-tablet-screen">
              <div className="pe-screen-top-bar">
                <span>SIGNBASE <b>PSL</b></span>
                <span>CAM 1080P · 30 FPS</span>
              </div>
              <div className="pe-cam-viewfinder">
                <div className="pe-landmark-container">
                  <span className="pe-landmark-point lm-1" />
                  <span className="pe-landmark-point lm-2" />
                  <span className="pe-landmark-point lm-3" />
                  <span className="pe-landmark-point lm-4" />
                  <span className="pe-landmark-point lm-5" />
                  <Hand size={44} className="pe-hand-icon" />
                </div>
                <span className="pe-screen-prompt">Place hands inside frame</span>
              </div>
              <div className="pe-screen-bottom-hud">
                <span className="pe-hud-status"><span /> Ready to capture</span>
                <span>21 MediaPipe Landmarks</span>
              </div>
            </div>
          </div>

          <div className="pe-features-list">
            <div className="pe-feature-item">
              <span className="pe-feature-check"><Check size={12} /></span>
              Real-time video input with live frame alignment guidance
            </div>
            <div className="pe-feature-item">
              <span className="pe-feature-check"><Check size={12} /></span>
              Continuous 21-point hand landmark extraction
            </div>
            <div className="pe-feature-item">
              <span className="pe-feature-check"><Check size={12} /></span>
              Instant visual feedback without requiring spoken audio
            </div>
          </div>
        </div>

        {/* Teller Panel */}
        <div className="pe-panel-card pe-panel-teller">
          <div className="pe-device-meta">
            <span className="pe-device-tag">02 / Teller Workstation</span>
            <span className="pe-device-os">React · Web Dashboard</span>
          </div>
          <h3>Teller web interface</h3>
          <p className="pe-panel-desc">
            Real-time desktop dashboard translating incoming customer sign sequences directly into actionable banking commands.
          </p>

          <div className="pe-monitor-frame">
            <div className="pe-monitor-screen">
              <div className="pe-monitor-top">
                <span>ACTIVE COUNTER SESSION · #042</span>
                <span className="pe-verified-badge"><CheckCircle2 size={12} /> LIVE SYNCED</span>
              </div>
              <div className="pe-teller-verified-card">
                <div className="pe-verified-header">
                  <span>RECOGNIZED BANKING ACTION</span>
                  <span className="pe-confidence-pill">98.4% CONFIDENCE</span>
                </div>
                <h4 className="pe-verified-title">Account Inquiry / Statement</h4>
                <p className="pe-verified-desc">Customer requested transaction history and account balance verification.</p>
              </div>
              <div className="pe-monitor-actions">
                <div className="pe-btn-process">Process Request</div>
                <div className="pe-btn-token">Print Slip #42</div>
              </div>
            </div>
          </div>
          <div className="pe-monitor-stand" />

          <div className="pe-features-list">
            <div className="pe-feature-item">
              <span className="pe-feature-check"><Check size={12} /></span>
              Zero-install web dashboard for counter PCs
            </div>
            <div className="pe-feature-item">
              <span className="pe-feature-check"><Check size={12} /></span>
              Decoded banking lexicon with confidence scoring
            </div>
            <div className="pe-feature-item">
              <span className="pe-feature-check"><Check size={12} /></span>
              Integrated action shortcuts for rapid transaction service
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* TECHNOLOGY PIPELINE SECTION — UNBOXED OPEN HORIZONTAL FLOW */}
    <section className="tech-pipeline-section" id="technology">
      <div className="tech-pipeline-header">
        <h2>Technology</h2>
        <p>The proposed architecture connects video input, a recognition backend and a teller-facing interface.</p>
      </div>

      <div className="tech-flow-track">
        {/* Step 01 */}
        <div className="tech-flow-node">
          <div className="tech-node-top">
            <div className="tech-node-emblem">
              <Video size={24} />
            </div>
            <div className="tech-connector-line">
              <div className="tech-connector-pulse" />
              <div className="tech-connector-arrow" />
            </div>
          </div>
          <h3 className="tech-node-title">Customer tablet app</h3>
          <span className="tech-node-stack">Flutter · Camera input</span>
          <p className="tech-node-desc">
            Captures front-facing video feed and extracts 21-point hand landmarks directly on the counter device.
          </p>
        </div>

        {/* Step 02 */}
        <div className="tech-flow-node">
          <div className="tech-node-top">
            <div className="tech-node-emblem">
              <Workflow size={24} />
            </div>
            <div className="tech-connector-line">
              <div className="tech-connector-pulse" />
              <div className="tech-connector-arrow" />
            </div>
          </div>
          <h3 className="tech-node-title">Recognition backend</h3>
          <span className="tech-node-stack">Python · FastAPI</span>
          <p className="tech-node-desc">
            Ingests landmark streams via secure WebSockets, running sequence buffering and temporal normalization.
          </p>
        </div>

        {/* Step 03 */}
        <div className="tech-flow-node tech-node-highlight">
          <div className="tech-node-top">
            <div className="tech-node-emblem">
              <Cpu size={24} />
            </div>
            <div className="tech-connector-line">
              <div className="tech-connector-pulse" />
              <div className="tech-connector-arrow" />
            </div>
          </div>
          <h3 className="tech-node-title">Selected recognition model</h3>
          <span className="tech-node-stack">Chosen through comparative evaluation</span>
          <p className="tech-node-desc">
            Evaluates landmark-based and frame-based models to classify domain-specific Pakistani Sign Language terms.
          </p>
        </div>

        {/* Step 04 */}
        <div className="tech-flow-node">
          <div className="tech-node-top">
            <div className="tech-node-emblem">
              <Monitor size={24} />
            </div>
          </div>
          <h3 className="tech-node-title">Teller web application</h3>
          <span className="tech-node-stack">React · Recognized terms</span>
          <p className="tech-node-desc">
            Surfaces recognized banking actions and verified confidence levels to counter staff in real time.
          </p>
        </div>
      </div>
    </section>

    {/* RESEARCH & INNOVATION SECTION — PLANETARY ORBITAL REVOLUTION */}
    <ResearchOrbit />

    <section className="closing-cta">
      <div className="closing-cta-content">
        <h2>Communication should have no barriers.</h2>
      </div>
      <a className="button button-light" href="#home">Back to top <ArrowUpRight size={16}/></a>
    </section>

    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-col-brand">
            <a className="footer-brand-link" href="#home">
              <span className="footer-brand-mark">
                <img src={`${import.meta.env.BASE_URL}psl-emblem-white.png`} alt="Pakistan Sign Language Logo" className="footer-psl-logo" />
              </span>
              <span>SignBase <b>PSL</b></span>
            </a>
            <p className="footer-tagline">
              Real-time Pakistan Sign Language recognition for accessible counter banking transactions.
            </p>
          </div>

          {/* Navigation Col */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#workflow">How It Works</a></li>
              <li><a href="#technology">Technology</a></li>
              <li><a href="#research">Research</a></li>
            </ul>
          </div>

          {/* Academic Institution Col */}
          <div className="footer-col">
            <h4 className="footer-col-title">Institution</h4>
            <div className="footer-info-block">
              <b>Department of Computer Science</b>
              <span>University of the Punjab</span>
              <span>Allama Iqbal Campus, Lahore</span>
            </div>
          </div>

          {/* Research & Supervision Col */}
          <div className="footer-col">
            <h4 className="footer-col-title">Project Oversight</h4>
            <div className="footer-info-block">
              <b>Supervised by Dr. Irfana Bibi</b>
              <span>BS Computer Science (2022–2026)</span>
              <span>Lahore, Pakistan</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-bottom-left">
            <span>© {new Date().getFullYear()} SignBase PSL. Developed for inclusive financial accessibility.</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
  </>);
}

export default App;
