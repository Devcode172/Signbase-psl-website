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
      <a className="header-cta" href="#/login">
        Start Free Analysis <ArrowUpRight size={14}/>
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

function AnimatedStatCard({ badge, targetNumber, formatValue, label, themeClass, delay = 0 }) {
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
      <div className="stat-number">{formatValue(value, inView)}</div>
      <p className="stat-label">{label}</p>
    </div>
  );
}

function getBoxStreamText(fullText, startMs, durationMs, elapsedMs) {
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

function App() {
  const [siteReady, setSiteReady] = useState(false);
  const [splitCardsInView, setSplitCardsInView] = useState(false);
  const [cardsElapsedMs, setCardsElapsedMs] = useState(0);
  const splitCardsRef = useRef(null);

  useEffect(() => {
    const el = splitCardsRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSplitCardsInView(true);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!splitCardsInView) return undefined;
    let startTime = null;
    let rafId = null;
    const DURATION = 4500; // 4.5 seconds

    setCardsElapsedMs(0);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      setCardsElapsedMs(progress);
      if (progress < DURATION) {
        rafId = requestAnimationFrame(step);
      } else {
        setCardsElapsedMs(DURATION);
      }
    };

    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [splitCardsInView]);

  useEffect(() => {
    // Only activate heading emergence once preloader has finished and the site is visible
    if (!siteReady) return undefined;

    const timer = setTimeout(() => {
      // Select main heading containers across all sections
      const targets = document.querySelectorAll(
        ".hero-statement-inner, .intro-header-wrap, .stack-section-header, .tech-pipeline-header, .orbit-center-hub, .closing-cta-content"
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
        <a className="hero-explore-btn" href="#/login">
          Start Free Analysis <ArrowUpRight size={15}/>
        </a>
      </div>
      <main className="hero hero-centered-stage">
        <div className="hero-visual-fullscreen">
          <WireframeHero startAnimation={siteReady} />
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
          targetNumber={1.5}
          formatValue={(val, active) => active ? <>{val.toFixed(1)}M<em>+</em></> : <>1.5M<em>+</em></>}
          label="Deaf citizens in Pakistan navigating branch banking without sign support."
          themeClass="stat-theme-green"
          delay={0}
        />
        <AnimatedStatCard
          targetNumber={47}
          formatValue={(val, active) => active ? <>{Math.floor(val)}<em> Signs</em></> : <>47<em> Signs</em></>}
          label="Targeted banking vocabulary covering deposits, inquiries, loans & security."
          themeClass="stat-theme-blue"
          delay={120}
        />
        <AnimatedStatCard
          targetNumber={1}
          formatValue={(val, active) => active ? <>&lt;{val.toFixed(1)}<em>s</em></> : <>&lt;1<em>s</em></>}
          label="Real-time gesture analysis to teller screen transcription latency."
          themeClass="stat-theme-cyan"
          delay={240}
        />
        <AnimatedStatCard
          targetNumber={100}
          formatValue={(val, active) => active ? <>{Math.floor(val)}<em>%</em></> : <>100<em>%</em></>}
          label="Financial privacy and autonomous banking without third-party chaperones."
          themeClass="stat-theme-purple"
          delay={360}
        />
      </div>

      {/* Side-by-Side Split Cards: Challenge vs Solution with Writing Animation */}
      <div className="split-cards-container" ref={splitCardsRef}>
        {/* Card 1: The Challenge */}
        {(() => {
          const chDesc = getBoxStreamText("Retail bank branches are designed around verbal interactions. When a Deaf customer steps up to the counter, communication stalls immediately.", 100, 800, cardsElapsedMs);
          const chT1 = getBoxStreamText("Zero Interpreter Availability", 950, 400, cardsElapsedMs);
          const chD1 = getBoxStreamText("Over 98% of physical bank branches have no sign-fluent tellers or on-demand interpreter access.", 1250, 700, cardsElapsedMs);
          const chT2 = getBoxStreamText("Compromised Financial Confidentiality", 2050, 400, cardsElapsedMs);
          const chD2 = getBoxStreamText("Customers must share sensitive balance queries or PIN instructions through relatives or paper notes.", 2350, 700, cardsElapsedMs);
          const chT3 = getBoxStreamText("Banking Terminology Misalignment", 3150, 400, cardsElapsedMs);
          const chD3 = getBoxStreamText("Complex financial terms (clearing, overdraft, remittance, KYC) are difficult to convey via handwritten notes.", 3450, 750, cardsElapsedMs);

          return (
            <div className="challenge-card">
              <h3>Current Branch Reality</h3>
              <p className="challenge-card-desc">
                {chDesc.text}
                {chDesc.isTyping && <span className="typewriter-cursor">|</span>}
              </p>

              <div className="pain-points-list">
                <div className="pain-point-item">
                  <div className="pain-icon-box">1</div>
                  <div className="pain-point-content">
                    <b>
                      {chT1.text}
                      {chT1.isTyping && <span className="typewriter-cursor">|</span>}
                    </b>
                    <p>
                      {chD1.text}
                      {chD1.isTyping && <span className="typewriter-cursor">|</span>}
                    </p>
                  </div>
                </div>

                <div className="pain-point-item">
                  <div className="pain-icon-box">2</div>
                  <div className="pain-point-content">
                    <b>
                      {chT2.text}
                      {chT2.isTyping && <span className="typewriter-cursor">|</span>}
                    </b>
                    <p>
                      {chD2.text}
                      {chD2.isTyping && <span className="typewriter-cursor">|</span>}
                    </p>
                  </div>
                </div>

                <div className="pain-point-item">
                  <div className="pain-icon-box">3</div>
                  <div className="pain-point-content">
                    <b>
                      {chT3.text}
                      {chT3.isTyping && <span className="typewriter-cursor">|</span>}
                    </b>
                    <p>
                      {chD3.text}
                      {chD3.isTyping && <span className="typewriter-cursor">|</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Card 2: The SignBase Solution */}
        {(() => {
          const soDesc = getBoxStreamText("A customer-facing tablet captures Pakistan Sign Language gestures in real time, converting standard banking signs into instant English and Urdu terms on the teller's screen.", 100, 800, cardsElapsedMs);
          const soT1 = getBoxStreamText("47 Standardized PSL Banking Signs", 950, 400, cardsElapsedMs);
          const soD1 = getBoxStreamText("Trained on authentic Pakistan Sign Language dataset curated specifically for counter transactions.", 1250, 700, cardsElapsedMs);
          const soT2 = getBoxStreamText("Complete User Independence", 2050, 400, cardsElapsedMs);
          const soD2 = getBoxStreamText("Empowers the customer to conduct confidential banking without relying on friends, family, or notes.", 2350, 700, cardsElapsedMs);
          const soT3 = getBoxStreamText("Dual-Screen Synchronized Flow", 3150, 400, cardsElapsedMs);
          const soD3 = getBoxStreamText("Signer gets live pose confirmation while the teller receives the verified Urdu and English banking action.", 3450, 750, cardsElapsedMs);

          return (
            <div className="solution-fintech-card">
              <h3>SignBase PSL <em>Approach</em></h3>
              <p className="solution-card-desc">
                {soDesc.text}
                {soDesc.isTyping && <span className="typewriter-cursor">|</span>}
              </p>

              <div className="solution-points-list">
                <div className="solution-point-item">
                  <div className="solution-icon-box">1</div>
                  <div className="solution-point-content">
                    <b>
                      {soT1.text}
                      {soT1.isTyping && <span className="typewriter-cursor">|</span>}
                    </b>
                    <p>
                      {soD1.text}
                      {soD1.isTyping && <span className="typewriter-cursor">|</span>}
                    </p>
                  </div>
                </div>

                <div className="solution-point-item">
                  <div className="solution-icon-box">2</div>
                  <div className="solution-point-content">
                    <b>
                      {soT2.text}
                      {soT2.isTyping && <span className="typewriter-cursor">|</span>}
                    </b>
                    <p>
                      {soD2.text}
                      {soD2.isTyping && <span className="typewriter-cursor">|</span>}
                    </p>
                  </div>
                </div>

                <div className="solution-point-item">
                  <div className="solution-icon-box">3</div>
                  <div className="solution-point-content">
                    <b>
                      {soT3.text}
                      {soT3.isTyping && <span className="typewriter-cursor">|</span>}
                    </b>
                    <p>
                      {soD3.text}
                      {soD3.isTyping && <span className="typewriter-cursor">|</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>

    {/* HOW IT WORKS SECTION — EFFEPINNA STUDIO STICKY STACKING CARDS */}
    <HowItWorksStack />

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
              <span>BS Computer Science (2023–2027)</span>
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
