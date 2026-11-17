import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function WireframeHero({ startAnimation = true }) {
  const mountRef = useRef(null);
  const introStartRef = useRef(null);
  const startAnimationRef = useRef(startAnimation);
  const modelReadyRef = useRef(false);

  useEffect(() => {
    startAnimationRef.current = startAnimation;
    if (startAnimation && modelReadyRef.current && introStartRef.current === null) {
      introStartRef.current = performance.now();
    }
  }, [startAnimation]);

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
    renderer.localClippingEnabled = true;
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

    const auraCanvas = document.createElement("canvas");
    auraCanvas.width = 256;
    auraCanvas.height = 256;
    const auraContext = auraCanvas.getContext("2d");
    const auraGradient = auraContext.createRadialGradient(128, 128, 8, 128, 128, 128);
    auraGradient.addColorStop(0, "rgba(104, 72, 255, 0.08)");
    auraGradient.addColorStop(0.28, "rgba(100, 92, 255, 0.44)");
    auraGradient.addColorStop(0.6, "rgba(56, 120, 255, 0.22)");
    auraGradient.addColorStop(1, "rgba(56, 120, 255, 0)");
    auraContext.fillStyle = auraGradient;
    auraContext.fillRect(0, 0, auraCanvas.width, auraCanvas.height);
    const auraTexture = new THREE.CanvasTexture(auraCanvas);
    auraTexture.colorSpace = THREE.SRGBColorSpace;
    const auraMaterial = new THREE.SpriteMaterial({
      map: auraTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const robotAura = new THREE.Sprite(auraMaterial);
    robotAura.position.set(-0.55, 0.9, -0.8);
    robotAura.scale.set(0.1, 0.1, 1);
    scene.add(robotAura);

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

    const buildParticleCount = 110;
    const buildParticlePositions = new Float32Array(buildParticleCount * 3);
    const buildParticleOffsets = new Float32Array(buildParticleCount * 3);
    for (let i = 0; i < buildParticleCount; i++) {
      const index = i * 3;
      buildParticleOffsets[index] = Math.random() * 2 - 1;
      buildParticleOffsets[index + 1] = Math.random() * 2 - 1;
      buildParticleOffsets[index + 2] = Math.random() * Math.PI * 2;
    }
    const buildParticleGeo = new THREE.BufferGeometry();
    buildParticleGeo.setAttribute("position", new THREE.BufferAttribute(buildParticlePositions, 3));
    const buildParticleMat = new THREE.PointsMaterial({
      color: 0xcbbcff,
      size: 0.022,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const buildParticles = new THREE.Points(buildParticleGeo, buildParticleMat);
    scene.add(buildParticles);

    const lightningMainSegments = 26;
    const lightningBranchCount = 12;
    const lightningBranches = Array.from({ length: lightningBranchCount }, () => ({
      ratio: 0.07 + Math.random() * 0.86,
      side: Math.random() < 0.5 ? -1 : 1,
      lengthScale: 0.55 + Math.random() * 0.9,
      widthScale: 0.6 + Math.random() * 0.6,
    })).sort((a, b) => a.ratio - b.ratio);
    const lightningMaxSegments = lightningMainSegments + lightningBranchCount * 2;
    const lightningGeometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);
    const lightningHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0x3e58ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const lightningGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x725cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const lightningCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0xf7f3ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const lightningHalo = new THREE.InstancedMesh(
      lightningGeometry,
      lightningHaloMaterial,
      lightningMaxSegments
    );
    const lightningGlow = new THREE.InstancedMesh(
      lightningGeometry,
      lightningGlowMaterial,
      lightningMaxSegments
    );
    const lightningCore = new THREE.InstancedMesh(
      lightningGeometry,
      lightningCoreMaterial,
      lightningMaxSegments
    );
    lightningHalo.count = 0;
    lightningGlow.count = 0;
    lightningCore.count = 0;
    lightningHalo.frustumCulled = false;
    lightningGlow.frustumCulled = false;
    lightningCore.frustumCulled = false;
    lightningHalo.renderOrder = -3;
    lightningGlow.renderOrder = -2;
    lightningCore.renderOrder = -1;
    scene.add(lightningHalo, lightningGlow, lightningCore);
    const lightningLight = new THREE.PointLight(0x8c73ff, 0, 1.8, 2);
    scene.add(lightningLight);

    // --- Laptop Construction (Realistic solid silver/grey — no wireframe trim) ---
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0.50, 0.80, 0.18);
    laptopGroup.rotation.set(0.04, -0.52, 0.0);
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

        // "Accuracy: 98.6%" line below
        ctx.fillStyle = "#94a3b8";
        ctx.font = "400 32px 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText("Accuracy: 98.6%", cx, cy + 93);
      }

      ctx.restore();
      screenTexture.needsUpdate = true;
    }

    drawScreen(0, 0);

    // --- Loading 3D Model: Rigged Wireframe Human Figure ---
    const gltfLoader = new GLTFLoader();
    let modelBones = null;
    let humanModel = null;
    let modelBounds = null;
    let modelSize = null;
    let modelCenter = null;
    const robotSolidPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const robotHologramPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    const laptopMaterializationPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    laptopGroup.traverse((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        material.clippingPlanes = [laptopMaterializationPlane];
      }
    });

    // Glowing Wireframe Materials matching the user's reference image
    const bodyWireMaterial = new THREE.MeshBasicMaterial({
      color: 0x65d9e8,
      wireframe: true,
      transparent: true,
      opacity: 0.10,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      clippingPlanes: [robotSolidPlane],
    });

    const bodyInnerMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x465d75,
      emissive: 0x061a2c,
      emissiveIntensity: 0.18,
      roughness: 0.33,
      metalness: 0.65,
      clearcoat: 0.75,
      clearcoatRoughness: 0.22,
      transparent: true,
      opacity: 1,
      depthWrite: true,
      clippingPlanes: [robotSolidPlane],
    });

    const hologramWireMaterial = new THREE.MeshBasicMaterial({
      color: 0xa59cff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      clippingPlanes: [robotHologramPlane],
    });

    const jointGeometry = new THREE.SphereGeometry(0.014, 10, 8);
    const jointMaterial = new THREE.MeshBasicMaterial({
      color: 0x9deaff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      clippingPlanes: [robotSolidPlane],
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

            const hologramClone = obj.clone();
            hologramClone.material = hologramWireMaterial;
            hologramClone.frustumCulled = false;
            hologramClone.bind(obj.skeleton, obj.bindMatrix);
            obj.parent.add(hologramClone);
          }
        });

        modelBones = bones;
        humanModel = model;

        // Position human SIDE-BY-SIDE on the LEFT, oriented towards laptop and screen
        model.position.set(-0.55, 0.0, 0.0);
        // Turned towards laptop (right) while still facing towards the screen
        model.rotation.y = 0.42;
        scene.add(model);
        model.updateMatrixWorld(true);
        modelBounds = new THREE.Box3().setFromObject(model);
        modelSize = modelBounds.getSize(new THREE.Vector3());
        modelCenter = modelBounds.getCenter(new THREE.Vector3());
        robotSolidPlane.constant = -modelBounds.max.y;
        robotHologramPlane.constant = modelBounds.max.y;
        laptopMaterializationPlane.constant = modelBounds.min.y;
        model.visible = false;

        modelReadyRef.current = true;
        if (startAnimationRef.current && introStartRef.current === null) {
          introStartRef.current = performance.now();
        }

        const jointBoneNames = [
          "mixamorigLeftArm",
          "mixamorigLeftForeArm",
          "mixamorigRightArm",
          "mixamorigRightForeArm",
          "mixamorigSpine",
          "mixamorigSpine1",
          "mixamorigLeftHand",
          "mixamorigRightHand",
        ];
        for (const boneName of jointBoneNames) {
          const bone = bones[boneName];
          if (!bone) continue;
          const joint = new THREE.Mesh(jointGeometry, jointMaterial);
          if (boneName.includes("Spine")) joint.scale.setScalar(1.35);
          bone.add(joint);
        }

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
    const introDuration = 3200;
    const cycleDuration = 8400; // 8.4s total cinematic cycle

    const smoothstep = (min, max, val) => {
      const x = Math.max(0, Math.min(1, (val - min) / (max - min)));
      return x * x * (3 - 2 * x);
    };

    const lightningPoints = Array.from(
      { length: lightningMainSegments + 1 },
      () => new THREE.Vector3()
    );
    const branchStart = new THREE.Vector3();
    const branchMid = new THREE.Vector3();
    const branchEnd = new THREE.Vector3();
    const boltDirection = new THREE.Vector3();
    const boltMidpoint = new THREE.Vector3();
    const boltScale = new THREE.Vector3();
    const boltQuaternion = new THREE.Quaternion();
    const boltMatrix = new THREE.Matrix4();
    const boltUnitY = new THREE.Vector3(0, 1, 0);
    const lightningClippedStart = new THREE.Vector3();
    const lightningClippedEnd = new THREE.Vector3();

    const lightningNoise = (pointIndex, axis, now) => {
      const step = Math.floor(now / 90);
      const phase = (now / 90) % 1;
      const blend = phase * phase * (3 - 2 * phase);
      const sample = (sampleStep) => {
        const value = Math.sin(
          pointIndex * 127.1 + axis * 311.7 + sampleStep * 74.7
        ) * 43758.5453;
        return value - Math.floor(value) - 0.5;
      };
      return THREE.MathUtils.lerp(sample(step), sample(step + 1), blend);
    };

    const setLightningSegment = (mesh, index, start, end, radius) => {
      boltDirection.subVectors(end, start);
      const length = boltDirection.length();
      if (length < 0.001) {
        boltQuaternion.identity();
        boltMidpoint.copy(start);
        boltScale.set(0, 0, 0);
        boltMatrix.compose(boltMidpoint, boltQuaternion, boltScale);
        mesh.setMatrixAt(index, boltMatrix);
        return;
      }
      boltDirection.normalize();
      boltQuaternion.setFromUnitVectors(boltUnitY, boltDirection);
      boltMidpoint.addVectors(start, end).multiplyScalar(0.5);
      boltScale.set(radius, length, radius);
      boltMatrix.compose(boltMidpoint, boltQuaternion, boltScale);
      mesh.setMatrixAt(index, boltMatrix);
    };

    function animate(now) {
      if (!isVisible) return;
      raf = requestAnimationFrame(animate);
      const buildProgress = introStartRef.current === null
        ? 0
        : THREE.MathUtils.clamp((now - introStartRef.current) / introDuration, 0, 1);
      const elapsed = introStartRef.current === null
        ? 0
        : Math.max(0, now - introStartRef.current - introDuration);
      const progress = (elapsed % cycleDuration) / cycleDuration; // 0.0 to 1.0

      if (modelBounds && modelSize && modelCenter) {
        const laptopSweepProgress = smoothstep(0, 1, buildProgress);
        const robotSweepProgress = 1 - laptopSweepProgress;
        const robotSweepY = THREE.MathUtils.lerp(
          modelBounds.min.y,
          modelBounds.max.y,
          robotSweepProgress
        );
        const laptopSweepY = THREE.MathUtils.lerp(
          modelBounds.min.y,
          modelBounds.max.y,
          laptopSweepProgress
        );
        robotSolidPlane.constant = -robotSweepY;
        robotHologramPlane.constant = robotSweepY;
        laptopMaterializationPlane.constant = laptopSweepY;
        if (humanModel) humanModel.visible = introStartRef.current !== null;
        bodyWireMaterial.opacity = 0.015 +
          0.10 * (1 - smoothstep(0.7, 1, buildProgress));
        bodyInnerMaterial.opacity = 0.72 + 0.28 * smoothstep(0.88, 1, buildProgress);
        hologramWireMaterial.opacity = 0.25 * (1 - smoothstep(0.92, 1, buildProgress));

        const particleFade = smoothstep(0.015, 0.10, buildProgress) *
          (1 - smoothstep(0.82, 1, buildProgress));
        buildParticleMat.opacity = 0.95 * particleFade;

        const heightRatio = robotSweepProgress;
        const widthRatio = heightRatio < 0.12 ? 0.18
          : heightRatio < 0.42 ? 0.32
            : heightRatio < 0.64 ? 0.48
              : heightRatio < 0.78 ? 0.92
                : heightRatio < 0.90 ? 0.34 : 0.24;
        const modelOffsetX = humanModel ? humanModel.position.x - (-0.55) : 0;
        const modelOffsetZ = humanModel ? humanModel.position.z : 0;
        const electricityFade = smoothstep(0.005, 0.06, buildProgress);
        const electricityFlicker = 0.82 +
          Math.sin(now * 0.061) * 0.13 +
          Math.sin(now * 0.173) * 0.05;
        const electricity = electricityFade * electricityFlicker;

        const auraFade = 1 - smoothstep(0.82, 1, buildProgress);
        auraMaterial.opacity = 0.56 * electricity * auraFade;
        robotAura.position.set(
          modelCenter.x + modelOffsetX,
          modelCenter.y,
          modelCenter.z + modelOffsetZ - 0.8
        );
        robotAura.scale.set(modelSize.x * 2.4, modelSize.y * 1.3, 1);

        lightningHaloMaterial.opacity = 0.18 * electricity;
        lightningGlowMaterial.opacity = 0.82 * electricity;
        lightningCoreMaterial.opacity = electricity;
        const lightningX = humanModel
          ? humanModel.position.x
          : modelCenter.x + modelOffsetX;
        const lightningZ = modelBounds.min.z + modelOffsetZ - 0.10;
        const lightningTopY = modelBounds.max.y + 0.035;
        const lightningBottomY = modelBounds.min.y - 0.035;
        const lightningFadeY = THREE.MathUtils.lerp(
          modelBounds.min.y - modelSize.y * 0.04,
          modelBounds.max.y + modelSize.y * 0.04,
          robotSweepProgress
        );
        const activeMainSegments = electricity > 0
          ? lightningMainSegments
          : 0;

        for (let i = 0; i <= activeMainSegments; i++) {
          const ratio = activeMainSegments > 0 ? i / activeMainSegments : 0;
          const isEndpoint = i === 0 || i === activeMainSegments;
          const jitterX = isEndpoint ? 0 : lightningNoise(i, 0, now) * 0.08;
          const jitterZ = isEndpoint ? 0 : lightningNoise(i, 1, now) * 0.05;
          lightningPoints[i].set(
            lightningX + jitterX,
            THREE.MathUtils.lerp(lightningTopY, lightningBottomY, ratio),
            lightningZ + jitterZ
          );
        }

        let lightningSegmentIndex = 0;
        const addVisibleLightningSegment = (start, end, haloRadius, glowRadius, coreRadius) => {
          if (start.y >= lightningFadeY && end.y >= lightningFadeY) return;
          lightningClippedStart.copy(start);
          lightningClippedEnd.copy(end);
          if (start.y >= lightningFadeY) {
            const ratio = (lightningFadeY - start.y) / (end.y - start.y);
            lightningClippedStart.lerpVectors(start, end, ratio);
          } else if (end.y >= lightningFadeY) {
            const ratio = (lightningFadeY - start.y) / (end.y - start.y);
            lightningClippedEnd.lerpVectors(start, end, ratio);
          }
          if (lightningClippedStart.distanceToSquared(lightningClippedEnd) < 0.000001) return;
          setLightningSegment(lightningHalo, lightningSegmentIndex, lightningClippedStart, lightningClippedEnd, haloRadius);
          setLightningSegment(lightningGlow, lightningSegmentIndex, lightningClippedStart, lightningClippedEnd, glowRadius);
          setLightningSegment(lightningCore, lightningSegmentIndex, lightningClippedStart, lightningClippedEnd, coreRadius);
          lightningSegmentIndex += 1;
        };
        for (let i = 0; i < activeMainSegments; i++) {
          const haloRadius = 0.03 + (i % 4 === 0 ? 0.008 : 0);
          const glowRadius = 0.014 + (i % 4 === 0 ? 0.005 : 0);
          const coreRadius = 0.007 + (i % 5 === 0 ? 0.002 : 0);
          addVisibleLightningSegment(
            lightningPoints[i],
            lightningPoints[i + 1],
            haloRadius,
            glowRadius,
            coreRadius
          );
        }

        const activeBranches = electricity > 0
          ? lightningBranchCount
          : 0;
        for (let i = 0; i < activeBranches; i++) {
          const branch = lightningBranches[i];
          const branchPointIndex = Math.round(branch.ratio * lightningMainSegments);
          const branchLength = Math.max(modelSize.x * 0.11, 0.06) * branch.lengthScale;
          const branchJitter = lightningNoise(lightningMainSegments + i, 2, now) * 0.025;
          branchStart.copy(lightningPoints[branchPointIndex]);
          branchMid.set(
            branchStart.x + branch.side * branchLength * 0.48,
            branchStart.y - branchLength * 0.42 + branchJitter,
            branchStart.z + lightningNoise(lightningMainSegments + i, 3, now) * 0.015
          );
          branchEnd.set(
            branchStart.x + branch.side * branchLength,
            branchStart.y - branchLength * 0.95 + branchJitter * 1.3,
            branchStart.z + lightningNoise(lightningMainSegments + i, 4, now) * 0.025
          );
          const branchHaloRadius = 0.016 * branch.widthScale;
          const branchGlowRadius = 0.009 * branch.widthScale;
          const branchCoreRadius = 0.0045 * branch.widthScale;
          addVisibleLightningSegment(
            branchStart,
            branchMid,
            branchHaloRadius,
            branchGlowRadius,
            branchCoreRadius
          );
          addVisibleLightningSegment(
            branchMid,
            branchEnd,
            branchHaloRadius * 0.72,
            branchGlowRadius * 0.72,
            branchCoreRadius * 0.72
          );
        }

        lightningHalo.count = lightningSegmentIndex;
        lightningGlow.count = lightningSegmentIndex;
        lightningCore.count = lightningSegmentIndex;
        lightningHalo.instanceMatrix.needsUpdate = true;
        lightningGlow.instanceMatrix.needsUpdate = true;
        lightningCore.instanceMatrix.needsUpdate = true;
        lightningLight.position.set(lightningX, modelCenter.y, lightningZ + 0.06);
        lightningLight.intensity = 3.5 * electricity * (1 - buildProgress);

        const positions = buildParticleGeo.attributes.position.array;
        for (let i = 0; i < buildParticleCount; i++) {
          const index = i * 3;
          const phase = buildParticleOffsets[index + 2];
          positions[index] = modelCenter.x + modelOffsetX +
            buildParticleOffsets[index] * modelSize.x * widthRatio * 0.5;
          positions[index + 1] = robotSweepY + Math.sin(now * 0.007 + phase) * 0.035;
          positions[index + 2] = modelCenter.z + modelOffsetZ +
            buildParticleOffsets[index + 1] * Math.max(modelSize.z * 0.55, 0.04) + 0.025;
        }
        buildParticleGeo.attributes.position.needsUpdate = true;

      }

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
      laptopGroup.rotation.y = THREE.MathUtils.lerp(-0.52, -0.08, forwardFactor);

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

    animate(performance.now());

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
      buildParticleGeo.dispose();
      buildParticleMat.dispose();
      auraTexture.dispose();
      auraMaterial.dispose();
      lightningGeometry.dispose();
      lightningHaloMaterial.dispose();
      lightningGlowMaterial.dispose();
      lightningCoreMaterial.dispose();
      bodyWireMaterial.dispose();
      bodyInnerMaterial.dispose();
      hologramWireMaterial.dispose();
      jointGeometry.dispose();
      jointMaterial.dispose();
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
