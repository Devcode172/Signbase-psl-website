import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function WireframeHero() {
  const mountRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x061426, 0.065);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    // Positioned so human and laptop are centered & enlarged
    camera.position.set(-0.025, 1.15, 2.28);
    camera.lookAt(-0.025, 1.08, 0.10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mount.appendChild(renderer.domElement);

    // --- Lighting ---
    // Deep blue ambient light
    const ambient = new THREE.AmbientLight(0x0a2f52, 2.4);
    scene.add(ambient);

    // Key light focused on human and laptop front
    const keyLight = new THREE.DirectionalLight(0x38bdf8, 3.4);
    keyLight.position.set(1.2, 3.2, 2.6);
    scene.add(keyLight);

    // Cyan rim light from behind for silhouette wireframe glow
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 4.0);
    rimLight.position.set(-2.5, 2.5, -2.0);
    scene.add(rimLight);

    // Bottom blue fill
    const fillLight = new THREE.PointLight(0x1d4ed8, 2.2, 8);
    fillLight.position.set(0, 0.2, 1.5);
    scene.add(fillLight);

    // Holographic floor grid
    const grid = new THREE.GridHelper(12, 32, 0x00f0ff, 0x07355e);
    grid.position.y = 0;
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    scene.add(grid);

    // Floating cyber particles
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 4.6;
      particlePos[i + 1] = Math.random() * 2.2;
      particlePos[i + 2] = (Math.random() - 0.5) * 3.2;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.022,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Laptop Construction (Realistic solid silver/grey — no wireframe trim) ---
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.50, 0.80, 0.18);
    laptopGroup.rotation.set(0.04, -0.32, 0.0);
    scene.add(laptopGroup);

    // Space-grey aluminium body
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x9aa0a6,       // space grey
      metalness: 0.92,
      roughness: 0.18,
    });

    // Slightly darker underside / inner surfaces
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x6b7280,
      metalness: 0.70,
      roughness: 0.30,
    });

    // Keyboard deck — slightly recessed dark surface
    const keyboardMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c1e,
      metalness: 0.4,
      roughness: 0.6,
    });

    // Trackpad — smooth glass-like surface
    const trackpadMat = new THREE.MeshStandardMaterial({
      color: 0x8e9499,
      metalness: 0.95,
      roughness: 0.08,
    });

    // ── Base chassis ──────────────────────────────────────────
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.016, 0.44), bodyMat);
    laptopGroup.add(baseMesh);

    // Thin rubber-feet strip on bottom edge (dark strip)
    const feetMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9, metalness: 0 });
    const feet = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.003, 0.004), feetMat);
    feet.position.set(0, -0.009, 0.21);
    laptopGroup.add(feet);

    // Keyboard area
    const keyboard = new THREE.Mesh(new THREE.PlaneGeometry(0.60, 0.22), keyboardMat);
    keyboard.rotation.x = -Math.PI / 2;
    keyboard.position.set(0, 0.009, -0.04);
    laptopGroup.add(keyboard);

    // Key rows — subtle raised rows for realism
    const keyRowMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, metalness: 0.3, roughness: 0.7 });
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 12; c++) {
        const key = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.003, 0.034), keyRowMat);
        key.position.set(-0.255 + c * 0.046, 0.011, -0.14 + r * 0.048);
        laptopGroup.add(key);
      }
    }

    // Trackpad
    const trackpad = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.12), trackpadMat);
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, 0.009, 0.14);
    laptopGroup.add(trackpad);

    // Thin trackpad border
    const tpBorderMat = new THREE.MeshStandardMaterial({ color: 0x555c63, metalness: 0.8, roughness: 0.2 });
    const tpBorder = new THREE.Mesh(new THREE.PlaneGeometry(0.228, 0.128), tpBorderMat);
    tpBorder.rotation.x = -Math.PI / 2;
    tpBorder.position.set(0, 0.0088, 0.14);
    laptopGroup.add(tpBorder);

    // ── Screen Lid ────────────────────────────────────────────
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.008, -0.21);
    lidGroup.rotation.x = -0.22;
    laptopGroup.add(lidGroup);

    // Lid outer shell — space grey aluminium back
    const lidOuter = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.42, 0.012), bodyMat);
    lidOuter.position.set(0, 0.21, 0);
    lidGroup.add(lidOuter);

    // Lid inner bezel — dark matte frame around screen
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.1, roughness: 0.95 });
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.40, 0.004), bezelMat);
    bezel.position.set(0, 0.21, 0.008);
    lidGroup.add(bezel);

    // Hinge bar — darker aluminium strip at bottom of lid
    const hingeMat = new THREE.MeshStandardMaterial({ color: 0x636a71, metalness: 0.95, roughness: 0.12 });
    const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.012, 0.016), hingeMat);
    hinge.position.set(0, 0.006, 0);
    lidGroup.add(hinge);

    // Apple-logo-style emblem on lid back (subtle circle)
    const emblemMat = new THREE.MeshStandardMaterial({ color: 0xb0b8bf, metalness: 1.0, roughness: 0.05 });
    const emblem = new THREE.Mesh(new THREE.CircleGeometry(0.035, 32), emblemMat);
    emblem.position.set(0, 0.21, -0.007);
    emblem.rotation.y = Math.PI;
    lidGroup.add(emblem);

    // Webcam — tiny dark dot centred on bezel top
    const camDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.006, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.3, roughness: 0.8 })
    );
    camDot.position.set(0, 0.407, 0.009);
    lidGroup.add(camDot);

    // Webcam green active LED
    const camLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.003, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x22c55e })
    );
    camLed.position.set(0.012, 0.407, 0.009);
    lidGroup.add(camLed);

    // ── Thin hinge connector between base and lid ─────────────
    const hingeBarMat = new THREE.MeshStandardMaterial({ color: 0x555c63, metalness: 0.95, roughness: 0.1 });
    const hingeBar = new THREE.Mesh(new THREE.BoxGeometry(0.60, 0.010, 0.012), hingeBarMat);
    hingeBar.position.set(0, 0.011, -0.21);
    laptopGroup.add(hingeBar);

    // ── Subtle shadow plane under laptop ─────────────────────
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.80, 0.55), shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -0.008, 0);
    laptopGroup.add(shadowPlane);

    // ── Futuristic pedestal/stand beneath the laptop ──────────
    const standMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      wireframe: true,
      transparent: true,
      opacity: 0.32
    });
    const standStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.44, 8), standMat);
    standStem.position.set(0, -0.22, 0);
    laptopGroup.add(standStem);

    const standBase = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.28, 24), standMat);
    standBase.rotation.x = -Math.PI / 2;
    standBase.position.set(0, -0.44, 0);
    laptopGroup.add(standBase);

    // Glowing holographic base ring on the floor beneath laptop
    const holoRing = new THREE.Mesh(
      new THREE.RingGeometry(0.25, 0.42, 32),
      new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      })
    );
    holoRing.rotation.x = -Math.PI / 2;
    holoRing.position.set(0.50, 0.002, 0.18);
    scene.add(holoRing);

    // --- Dynamic Laptop Screen Canvas ---
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1024;
    screenCanvas.height = 640;
    const ctx = screenCanvas.getContext("2d");
    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;
    screenTexture.generateMipmaps = false;

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.66, 0.38),
      new THREE.MeshBasicMaterial({ map: screenTexture })
    );
    screenMesh.position.set(0, 0.21, 0.012);
    lidGroup.add(screenMesh);

    // Function to render the screen based on recognition state
    // state: 0 = Standby/Empty, 1 = Tracking gesture, 2 = RECOGNIZED ("Account" / "کھاتہ")
    function drawScreen(state, timeMs, confidence = 0) {
      const w = 1024;
      const h = 640;

      // Dark futuristic background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#030814");
      bgGrad.addColorStop(1, "#07172e");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle horizontal scanline grid
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Top Header Status Bar
      ctx.fillStyle = "rgba(7, 26, 52, 0.75)";
      ctx.fillRect(24, 18, w - 48, 48);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.28)";
      ctx.strokeRect(24, 18, w - 48, 48);

      // Live pulse dot
      const pulsePhase = (Math.sin(timeMs * 0.005) + 1) / 2;
      ctx.beginPath();
      ctx.arc(52, 42, 6, 0, Math.PI * 2);
      ctx.fillStyle = state >= 2 ? "#22c55e" : "#38bdf8";
      ctx.shadowColor = state >= 2 ? "#22c55e" : "#38bdf8";
      ctx.shadowBlur = 10 + pulsePhase * 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#e0f2fe";
      ctx.font = "700 17px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("SIGNBASE PSL", 72, 48);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "600 13px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText("AI RECOGNITION SYSTEM", 215, 48);

      ctx.textAlign = "right";
      ctx.fillStyle = state >= 2 ? "#4ade80" : "#94a3b8";
      ctx.font = "600 13px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(state >= 2 ? "SIGN COMPLETE • VERIFIED" : "CAM: ACTIVE • 60 FPS", w - 48, 48);

      // Screen Content
      if (state === 0) {
        // --- STATE 0: EMPTY / STANDBY ---
        // At first there should be nothing on laptop
        ctx.textAlign = "center";

        const cx = w / 2;
        const cy = h / 2 + 15;
        ctx.beginPath();
        ctx.arc(cx, cy, 65, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.18)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 42, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Sweep line
        const sweepAngle = (timeMs * 0.002) % (Math.PI * 2);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * 65, cy + Math.sin(sweepAngle) * 65);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#64748b";
        ctx.font = "600 14px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("STANDBY • AWAITING SIGN GESTURE", cx, cy + 115);

        ctx.fillStyle = "#334155";
        ctx.font = "500 12px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("Ready to capture Pakistan Sign Language input", cx, cy + 138);

      } else if (state === 1) {
        // --- STATE 1: GESTURE COMPLETE & HANDS DOWN -> PROGRESS BAR PROCESSING ---
        const cx = w / 2;
        const cy = h / 2;

        ctx.textAlign = "center";
        ctx.fillStyle = "#38bdf8";
        ctx.font = "700 21px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("PROCESSING CAPTURED SIGN...", cx, cy - 25);

        // Progress bar filling after hands are down
        const barW = 420;
        const barH = 10;
        ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
        ctx.fillRect(cx - barW / 2, cy + 10, barW, barH);
        ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
        ctx.strokeRect(cx - barW / 2, cy + 10, barW, barH);

        const prog = Math.min(1, Math.max(0, confidence));
        const fillW = barW * prog;
        const progGrad = ctx.createLinearGradient(cx - barW / 2, 0, cx - barW / 2 + fillW, 0);
        progGrad.addColorStop(0, "#0284c7");
        progGrad.addColorStop(1, "#38bdf8");
        ctx.fillStyle = progGrad;
        ctx.fillRect(cx - barW / 2 + 2, cy + 12, fillW - 4, barH - 4);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 14px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("Classifying motion trajectory & handshape against PSL database...", cx, cy + 50);

        const percent = Math.floor(prog * 100);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "700 13px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(`${percent}% MATCHING`, cx, cy + 74);

      } else {
        // --- STATE 2: SIGN COMPLETED — show only sign name + "Sign detected" ---
        const cx = w / 2;
        const cy = h / 2;

        ctx.textAlign = "center";

        // Sign name — large, crisp, glowing
        ctx.fillStyle = "#ffffff";
        ctx.font = "800 96px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.shadowColor = "rgba(0, 229, 255, 0.85)";
        ctx.shadowBlur = 28;
        ctx.fillText("Account", cx, cy - 20);
        ctx.shadowBlur = 0;

        // "Sign detected" label below
        ctx.fillStyle = "#4ade80";
        ctx.font = "600 26px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("Sign detected", cx, cy + 55);
      }

      ctx.restore();
      screenTexture.needsUpdate = true;
    }

    drawScreen(0, 0);

    // --- Loading 3D Model: Rigged Wireframe Human Figure ---
    const gltfLoader = new GLTFLoader();
    let modelBones = null;
    let humanModel = null;

    // Glowing Wireframe Materials matching the user's reference image
    const bodyWireMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const bodyInnerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x041936,
      emissive: 0x05264a,
      emissiveIntensity: 0.45,
      roughness: 0.25,
      metalness: 0.5,
      transparent: true,
      opacity: 0.88,
      depthWrite: true
    });

    const eyeGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });

    gltfLoader.load(
      `${import.meta.env.BASE_URL}assets/Xbot.glb`,
      (gltf) => {
        const model = gltf.scene;

        // Collect all bones
        const bones = {};
        model.traverse((obj) => {
          if (obj.isBone) {
            bones[obj.name] = obj;
          }
          if (obj.isSkinnedMesh) {
            // Apply inner anatomical body volume
            obj.material = bodyInnerMaterial;
            obj.frustumCulled = false;

            // Clone mesh for the electric glowing wireframe pass
            const wireClone = obj.clone();
            wireClone.material = bodyWireMaterial;
            wireClone.frustumCulled = false;
            wireClone.bind(obj.skeleton, obj.bindMatrix);
            obj.parent.add(wireClone);
          }
        });

        modelBones = bones;
        humanModel = model;

        // Position human SIDE-BY-SIDE on the LEFT, oriented towards laptop and screen
        model.position.set(-0.55, 0.0, 0.0);
        // Turned towards laptop (right) while still facing towards the screen
        model.rotation.y = 0.42;
        scene.add(model);

        // Add Glowing Eyes to character head (matching the user's reference image!)
        const leftEyeBone = bones["mixamorigLeftEye"];
        const rightEyeBone = bones["mixamorigRightEye"];
        if (leftEyeBone && rightEyeBone) {
          const eyeGeo = new THREE.SphereGeometry(0.016, 12, 12);

          const leftEyeMesh = new THREE.Mesh(eyeGeo, eyeGlowMaterial);
          leftEyeMesh.position.set(0, 0, 0.02);
          leftEyeBone.add(leftEyeMesh);

          const rightEyeMesh = new THREE.Mesh(eyeGeo, eyeGlowMaterial);
          rightEyeMesh.position.set(0, 0, 0.02);
          rightEyeBone.add(rightEyeMesh);

          // Eye light for intense glowing eyes
          const eyeLight = new THREE.PointLight(0x00f0ff, 1.8, 0.6);
          eyeLight.position.set(0, 0, 0.08);
          leftEyeBone.add(eyeLight);
        }

        setModelLoaded(true);
      },
      undefined,
      (err) => {
        console.warn("Could not load local GLTF model:", err);
      }
    );

    // --- Animation Loop ---
    let raf;
    let isVisible = true;
    let lastScreenDrawTime = 0;
    let lastScreenState = -1;
    const startTime = performance.now();
    const cycleDuration = 8400; // 8.4s total cinematic cycle

    const smoothstep = (min, max, val) => {
      const x = Math.max(0, Math.min(1, (val - min) / (max - min)));
      return x * x * (3 - 2 * x);
    };

    function animate(now) {
      if (!isVisible) return;
      raf = requestAnimationFrame(animate);
      const elapsed = now - startTime;
      const progress = (elapsed % cycleDuration) / cycleDuration; // 0.0 to 1.0

      // Spatial Choreography Timing:
      // 0.00 - 0.44: Human performs sign in front. Laptop rests on side in standby.
      // 0.44 - 0.56: Sign completes -> Human goes behind into the depth.
      // 0.54 - 0.70: Laptop moves to front of screen (resolution increases) -> processing progress fills.
      // 0.70 - 0.88: Laptop is in full front view -> recognized text "Account" / "کھاتہ" displays!
      // 0.88 - 1.00: Smooth return reset for the next loop.
      const tGoBehind = smoothstep(0.44, 0.56, progress);
      const tLaptopForward = smoothstep(0.54, 0.68, progress);
      const tReset = smoothstep(0.88, 1.00, progress);

      const behindFactor = tGoBehind * (1.0 - tReset);
      const forwardFactor = tLaptopForward * (1.0 - tReset);

      const isNarrow = camera.aspect < 1.15;

      // On mobile view: add a comfortable extra gap while the human performs the sign so they don't look cramped
      const signActive = smoothstep(0.10, 0.26, progress) * (1.0 - smoothstep(0.44, 0.54, progress));
      const mobileSignGap = isNarrow ? signActive * 0.05 : 0;

      const hBaseX = isNarrow ? (-0.32 - mobileSignGap) : -0.55;
      const hBackX = isNarrow ? -0.38 : -0.70;
      const lBaseX = isNarrow ? (0.30 + mobileSignGap) : 0.50;
      const lForwardX = isNarrow ? 0.02 : 0.12;

      // 1. Human depth position: starts in front, goes behind after sign, then returns
      if (humanModel) {
        humanModel.position.x = THREE.MathUtils.lerp(hBaseX, hBackX, behindFactor);
        humanModel.position.z = THREE.MathUtils.lerp(0.0, -0.55, behindFactor);
        humanModel.rotation.y = THREE.MathUtils.lerp(0.42, 0.28, behindFactor);
      }

      // 2. Laptop foreground position: glides gracefully forward at comfortable size, then returns
      const floatY = Math.sin(elapsed * 0.002) * 0.004;
      laptopGroup.position.x = THREE.MathUtils.lerp(lBaseX, lForwardX, forwardFactor);
      laptopGroup.position.y = THREE.MathUtils.lerp(0.80, 0.88, forwardFactor) + floatY;
      laptopGroup.position.z = THREE.MathUtils.lerp(0.18, 0.65, forwardFactor);

      laptopGroup.rotation.x = THREE.MathUtils.lerp(0.04, 0.02, forwardFactor);
      laptopGroup.rotation.y = THREE.MathUtils.lerp(-0.32, -0.08, forwardFactor);

      if (holoRing) {
        holoRing.position.x = laptopGroup.position.x;
        holoRing.position.z = laptopGroup.position.z;
      }

      // 3. Laptop Screen State Timing:
      let screenState = 0;
      let conf = 0;
      if (progress < 0.54) {
        screenState = 0; // Standby while human performs sign
        conf = 0;
      } else if (progress < 0.70) {
        screenState = 1; // Laptop comes forward, progress bar matches
        conf = smoothstep(0.54, 0.70, progress);
      } else if (progress < 0.88) {
        screenState = 2; // Laptop in front: RECOGNIZED TEXT displays!
        conf = 1.0;
      } else {
        screenState = 0; // Resetting back
        conf = 0;
      }

      // Throttled canvas texture upload: ~30 FPS or when state changes to prevent GPU bus stalls
      if (now - lastScreenDrawTime > 33 || screenState !== lastScreenState) {
        drawScreen(screenState, elapsed, conf);
        lastScreenDrawTime = now;
        lastScreenState = screenState;
      }

      // --- Animate 3D Human Bones for PSL "Account" Sign ---
      if (modelBones) {
        const {
          mixamorigLeftArm: leftArm,
          mixamorigLeftForeArm: leftForeArm,
          mixamorigLeftHand: leftHand,
          mixamorigRightArm: rightArm,
          mixamorigRightForeArm: rightForeArm,
          mixamorigRightHand: rightHand,
          mixamorigSpine: spine,
          mixamorigSpine1: spine1,
          mixamorigHead: head
        } = modelBones;

        // Subtle idle breathing
        const breath = Math.sin(elapsed * 0.0016) * 0.02;
        if (spine) spine.rotation.x = breath * 0.5;
        if (spine1) spine1.rotation.x = breath * 0.4;
        // Head looks towards the laptop on the right!
        if (head) {
          head.rotation.y = 0.22 + Math.sin(elapsed * 0.001) * 0.02;
          head.rotation.x = -0.06 - breath * 0.3;
        }

        // Poses for the PSL sign:
        // 1. REST POSE (Hands at rest beside body/waist)
        // 2. UPPER POSE (Both hands at upper chest, index fingers pointing horizontally towards each other)
        // 3. LOWER POSE (Both hands stroked straight DOWNWARDS to lower chest/stomach - THE SIGN)
        // 4. RETURN POSE (Hands return smoothly down to rest)

        let tRaise = 0;
        let tStroke = 0;
        let tReturn = 0;

        if (progress < 0.10) {
          // Standing ready / breathing (hands down)
          tRaise = 0;
          tStroke = 0;
          tReturn = 0;
        } else if (progress < 0.28) {
          // Raising arms to upper chest
          tRaise = smoothstep(0.10, 0.28, progress);
          tStroke = 0;
          tReturn = 0;
        } else if (progress < 0.44) {
          // Performing the DOWNWARD stroke (the defining PSL sign of "Account")
          tRaise = 1;
          tStroke = smoothstep(0.28, 0.44, progress);
          tReturn = 0;
        } else if (progress < 0.54) {
          // Returning hands smoothly back down to rest
          tRaise = 1;
          tStroke = 1;
          tReturn = smoothstep(0.44, 0.54, progress);
        } else {
          // Sign is completely finished and hands are fully DOWN at rest!
          tRaise = 1;
          tStroke = 1;
          tReturn = 1;
        }

        // Rest angles (hands at sides/waist):
        const r_la  = [0.15, 0.1, -1.35];
        const r_lfa = [0.1,  0.2, -0.3];
        const r_lh  = [0.0,  0.0,  0.0];

        // ── PSL "Account" (کھاتہ) sign ──────────────────────────────────────────
        // Loose fists, only index fingers extended.
        // Index tips almost touching (~1-2 cm apart) in front of CHEST.
        // Palms face DOWN, angled slightly toward body → backs of hands face UP & outward.
        // Thumbs rest against curled fingers.
        // Forearms roughly parallel to ground. Wrists level with or slightly below knuckles.
        //
        // u_la  X=-1.0  → arms raised to CHEST level (not face)
        // u_la  Z=-0.40 → elbows slightly out from body, ~90° bend
        // u_lfa Y=-0.30 → slight supination: palm mostly DOWN, slight inward angle toward body
        // u_lfa Z=-1.50 → forearms cross far inward → index tips ~1-2 cm apart
        // u_lh  X=+0.10 → wrist sits slightly below knuckle line
        const u_la  = [-1.0,  0.08, -0.40];
        const u_lfa = [-0.08, -0.30, -1.50];
        const u_lh  = [0.10,  0.0,   0.0];

        // LOWER — straight vertical drop to stomach, every angle identical (pure vertical stroke):
        const d_la  = [-0.42, 0.08, -0.40];
        const d_lfa = [-0.08, -0.30, -1.50];
        const d_lh  = [0.10,  0.0,   0.0];

        // Compute current left arm angles via multi-stage lerp
        const cur_la = [0, 0, 0];
        const cur_lfa = [0, 0, 0];
        const cur_lh = [0, 0, 0];

        for (let i = 0; i < 3; i += 1) {
          const toUpper_la = THREE.MathUtils.lerp(r_la[i], u_la[i], tRaise);
          const toUpper_lfa = THREE.MathUtils.lerp(r_lfa[i], u_lfa[i], tRaise);
          const toUpper_lh = THREE.MathUtils.lerp(r_lh[i], u_lh[i], tRaise);

          const toLower_la = THREE.MathUtils.lerp(toUpper_la, d_la[i], tStroke);
          const toLower_lfa = THREE.MathUtils.lerp(toUpper_lfa, d_lfa[i], tStroke);
          const toLower_lh = THREE.MathUtils.lerp(toUpper_lh, d_lh[i], tStroke);

          cur_la[i] = THREE.MathUtils.lerp(toLower_la, r_la[i], tReturn);
          cur_lfa[i] = THREE.MathUtils.lerp(toLower_lfa, r_lfa[i], tReturn);
          cur_lh[i] = THREE.MathUtils.lerp(toLower_lh, r_lh[i], tReturn);
        }

        // Apply Left Arm & Wrist
        if (leftArm) leftArm.rotation.set(cur_la[0], cur_la[1], cur_la[2]);
        if (leftForeArm) leftForeArm.rotation.set(cur_lfa[0], cur_lfa[1], cur_lfa[2]);
        if (leftHand) leftHand.rotation.set(cur_lh[0], cur_lh[1], cur_lh[2]);

        // Right side is mirrored
        if (rightArm) rightArm.rotation.set(cur_la[0], -cur_la[1], -cur_la[2]);
        if (rightForeArm) rightForeArm.rotation.set(cur_lfa[0], -cur_lfa[1], -cur_lfa[2]);
        if (rightHand) rightHand.rotation.set(cur_lh[0], -cur_lh[1], -cur_lh[2]);

        // Hand fingers:
        // When active (tRaise > 0), Middle, Ring, Pinky are curled INTO fist (inward toward palm),
        // and Index finger is straight, pointing across horizontally toward the other hand.
        const fingerCurl = THREE.MathUtils.lerp(0.0, -1.35, tRaise * (1 - tReturn)); // negative = curl inward for left hand
        const indexCurl  = THREE.MathUtils.lerp(0.0, -0.05, tRaise * (1 - tReturn)); // near-zero = stays straight (index extended)
        const thumbCurl  = THREE.MathUtils.lerp(0.0,  0.90, tRaise * (1 - tReturn)); // thumb tucks against curled fingers

        // Left fingers — negative Z curls toward palm (inward)
        for (let j = 1; j <= 3; j += 1) {
          const lIndex = modelBones[`mixamorigLeftHandIndex${j}`];
          const lMiddle = modelBones[`mixamorigLeftHandMiddle${j}`];
          const lRing = modelBones[`mixamorigLeftHandRing${j}`];
          const lPinky = modelBones[`mixamorigLeftHandPinky${j}`];
          const lThumb = modelBones[`mixamorigLeftHandThumb${j}`];

          if (lIndex) lIndex.rotation.z = indexCurl;
          if (lMiddle) lMiddle.rotation.z = fingerCurl;
          if (lRing) lRing.rotation.z = fingerCurl;
          if (lPinky) lPinky.rotation.z = fingerCurl;
          if (lThumb) lThumb.rotation.y = thumbCurl;

          // Right fingers — positive Z curls toward palm (inward, mirrored from left)
          const rIndex = modelBones[`mixamorigRightHandIndex${j}`];
          const rMiddle = modelBones[`mixamorigRightHandMiddle${j}`];
          const rRing = modelBones[`mixamorigRightHandRing${j}`];
          const rPinky = modelBones[`mixamorigRightHandPinky${j}`];
          const rThumb = modelBones[`mixamorigRightHandThumb${j}`];

          if (rIndex) rIndex.rotation.z = -indexCurl;
          if (rMiddle) rMiddle.rotation.z = -fingerCurl;
          if (rRing) rRing.rotation.z = -fingerCurl;
          if (rPinky) rPinky.rotation.z = -fingerCurl;
          if (rThumb) rThumb.rotation.y = -thumbCurl;
        }
      }

      // Subtle particle float
      const positions = particles.geometry.attributes.position.array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] += 0.0008;
        if (positions[i] > 2.2) positions[i] = 0.1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate(startTime);

    // Responsive resize
    const handleResize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      const aspect = w / h;
      camera.aspect = aspect;

      // Keep human and laptop large, prominent, and perfectly framed on both mobile & desktop
      const isNarrow = aspect < 1.15;
      camera.position.z = isNarrow ? 2.44 : 2.28;
      camera.position.y = isNarrow ? 1.08 : 1.15;
      camera.lookAt(-0.02, isNarrow ? 1.05 : 1.08, 0.10);
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);
    handleResize();

    // Pause rendering when hero is scrolled out of view to eliminate scroll stutter
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          lastScreenDrawTime = performance.now();
          raf = requestAnimationFrame(animate);
        } else if (!isVisible && wasVisible) {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(mount);

    return () => {
      cancelAnimationFrame(raf);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      renderer.dispose();
      screenTexture.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className="wireframe-stage"
      ref={mountRef}
      aria-label="3D wireframe human performing Pakistan Sign Language for Account side-by-side with a laptop"
    />
  );
}
