import React, { useEffect, useRef } from "react";

/**
 * ParticleNetwork — 3D rotating constellation network inspired by radisist.com
 *
 * Specifics:
 * 1. Nodes colored like the hero page background (#061a33, #082b50, #0c477e)
 * 2. Elegant, compact node sizes (no oversized dots or bloated halos)
 * 3. Soft, imperceptible edge development: lines fade in and dissolve gradually
 *    over several seconds so transitions are silky-smooth and impossible to notice
 * 4. Balanced left and right wings with gentle 3D rotation and cursor-opposite glide
 */
export default function ParticleNetwork({
  nodeCount = 52,
  maxConnectDistance = 210,
  maxEdgesPerNode = 3,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const parent = canvas.parentElement;
    if (!parent) return undefined;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = 0;
    let height = 0;

    // Hero background color palette:
    // radial-gradient(ellipse at 74% 38%, #0c477e 0%, #082b50 34%, #061a33 73%)
    const HERO_COLORS = [
      "#061a33", // Deepest hero midnight navy
      "#082b50", // Mid hero navy
      "#0c477e", // Rich royal navy
      "#072142", // Deep navy shade
      "#0b3a68", // Lighter navy accent
    ];
    const LINE_COLOR_BASE = "rgba(8, 43, 80, ";
    const HALO_COLOR = "rgba(12, 71, 126, 0.16)";

    // Persistent edge alpha map: key -> currentAlpha
    // Ensures edges develop gradually and imperceptibly without popping
    const edgeAlphas = new Map();

    // Cursor tracking with lerp
    const cursor = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
    };

    // 3D rotation & translation state
    const cluster = {
      rotX: 0,
      rotY: 0,
      rotZ: 0,
      targetRotX: 0,
      targetRotY: 0,
      targetRotZ: 0,
      transX: 0,
      transY: 0,
      targetTransX: 0,
      targetTransY: 0,
      ambientAngle: 0,
    };

    let nodes = [];

    function resize() {
      const rect = parent.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
      initCluster();
    }

    function initCluster() {
      nodes = [];
      const spreadX = Math.min(width * 0.48, 580);
      const spreadY = 310;
      const spreadZ = 260;
      const minSeparation = 62; // Minimum distance between nodes

      // Balanced left, right, and bridge node counts
      const wingCount = Math.floor((nodeCount - 4) / 2); // 24 left, 24 right
      const bridgeCount = nodeCount - wingCount * 2; // 4 in center

      function createNode(bx, by, bz, idx) {
        const isProminent = idx % 8 === 0;
        const isMedium = idx % 3 === 0;

        return {
          baseX: bx,
          baseY: by,
          baseZ: bz,
          x: bx,
          y: by,
          z: bz,
          screenX: 0,
          screenY: 0,
          scale: 1,
          // Very gentle, imperceptible drift
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          vz: (Math.random() - 0.5) * 0.08,
          // Compact, elegant node sizes
          radius: isProminent ? 2.5 : isMedium ? 1.8 : 1.25,
          isProminent,
          color: HERO_COLORS[Math.floor(Math.random() * HERO_COLORS.length)],
          baseAlpha: isProminent ? 0.95 : 0.75 + Math.random() * 0.2,
          pulseSpeed: 0.01 + Math.random() * 0.015,
          pulseOffset: Math.random() * Math.PI * 2,
        };
      }

      // 1. Generate Left Wing Nodes (bx < -40)
      for (let i = 0; i < wingCount; i++) {
        let bx = 0;
        let by = 0;
        let bz = 0;
        for (let attempt = 0; attempt < 45; attempt++) {
          const theta = Math.PI * 0.55 + Math.random() * Math.PI * 0.9;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 0.30 + 0.70 * Math.pow(Math.random(), 0.85);

          bx = -Math.abs(Math.sin(phi) * Math.cos(theta) * spreadX * r) - 45;
          by = Math.sin(phi) * Math.sin(theta) * spreadY * r;
          bz = Math.cos(phi) * spreadZ * r;

          let tooClose = false;
          for (let j = 0; j < nodes.length; j++) {
            const ex = nodes[j].baseX;
            const ey = nodes[j].baseY;
            const ez = nodes[j].baseZ;
            if (
              Math.sqrt((bx - ex) ** 2 + (by - ey) ** 2 + (bz - ez) ** 2) <
              minSeparation
            ) {
              tooClose = true;
              break;
            }
          }
          if (!tooClose) break;
        }
        nodes.push(createNode(bx, by, bz, nodes.length));
      }

      // 2. Generate Right Wing Nodes (bx > +45)
      for (let i = 0; i < wingCount; i++) {
        let bx = 0;
        let by = 0;
        let bz = 0;
        for (let attempt = 0; attempt < 45; attempt++) {
          const theta = -Math.PI * 0.45 + Math.random() * Math.PI * 0.9;
          const phi = Math.acos(2 * Math.random() - 1);
          const r = 0.30 + 0.70 * Math.pow(Math.random(), 0.85);

          bx = Math.abs(Math.sin(phi) * Math.cos(theta) * spreadX * r) + 45;
          by = Math.sin(phi) * Math.sin(theta) * spreadY * r;
          bz = Math.cos(phi) * spreadZ * r;

          let tooClose = false;
          for (let j = 0; j < nodes.length; j++) {
            const ex = nodes[j].baseX;
            const ey = nodes[j].baseY;
            const ez = nodes[j].baseZ;
            if (
              Math.sqrt((bx - ex) ** 2 + (by - ey) ** 2 + (bz - ez) ** 2) <
              minSeparation
            ) {
              tooClose = true;
              break;
            }
          }
          if (!tooClose) break;
        }
        nodes.push(createNode(bx, by, bz, nodes.length));
      }

      // 3. Generate Central Bridge Nodes (-40 to +40)
      for (let i = 0; i < bridgeCount; i++) {
        const bx = (Math.random() - 0.5) * 80;
        const by = (Math.random() - 0.5) * spreadY * 0.65;
        const bz = (Math.random() - 0.5) * spreadZ * 0.65;
        nodes.push(createNode(bx, by, bz, nodes.length));
      }
    }

    function handleMouseMove(e) {
      const rect = parent.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      cursor.targetX = deltaX;
      cursor.targetY = deltaY;

      // Smooth, gentle parallax in opposite direction of cursor
      cluster.targetTransX = -deltaX * 0.06;
      cluster.targetTransY = -deltaY * 0.06;

      // Subtle 3D rotation with cursor movement
      cluster.targetRotY = -deltaX * 0.00075;
      cluster.targetRotZ = -deltaX * 0.0002;
      cluster.targetRotX = deltaY * 0.00075;
    }

    function handleMouseLeave() {
      cursor.targetX = 0;
      cursor.targetY = 0;
      cluster.targetTransX = 0;
      cluster.targetTransY = 0;
      cluster.targetRotX = 0;
      cluster.targetRotY = 0;
      cluster.targetRotZ = 0;
    }

    let time = 0;

    function render() {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Dynamic center calculation: align behind Research & Innovation hub
      const hubEl =
        parent.querySelector(".orbit-center-hub") ||
        parent.querySelector(".research-orbit-system");
      let centerX = width / 2;
      let centerY = Math.min(height * 0.38, 410);

      if (hubEl) {
        const hubRect = hubEl.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        centerX = hubRect.left - parentRect.left + hubRect.width / 2;
        centerY = hubRect.top - parentRect.top + hubRect.height / 2;
      }

      // Smooth slow interpolation for peaceful motion
      cluster.transX += (cluster.targetTransX - cluster.transX) * 0.035;
      cluster.transY += (cluster.targetTransY - cluster.transY) * 0.035;
      cluster.rotX += (cluster.targetRotX - cluster.rotX) * 0.035;
      cluster.rotY += (cluster.targetRotY - cluster.rotY) * 0.035;
      cluster.rotZ += (cluster.targetRotZ - cluster.rotZ) * 0.035;

      // Slow, majestic ambient rotation
      cluster.ambientAngle += 0.0006;
      const totalRotY = cluster.rotY + cluster.ambientAngle;
      const totalRotX = cluster.rotX + Math.sin(time * 0.25) * 0.04;
      const totalRotZ = cluster.rotZ;

      const cosY = Math.cos(totalRotY);
      const sinY = Math.sin(totalRotY);
      const cosX = Math.cos(totalRotX);
      const sinX = Math.sin(totalRotX);
      const cosZ = Math.cos(totalRotZ);
      const sinZ = Math.sin(totalRotZ);

      // Camera focal distance for 3D perspective projection
      const cameraDistance = 750;

      // 1. Update 3D positions and project to 2D screen
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Soft internal drift within anchor range
        n.x += n.vx;
        n.y += n.vy;
        n.z += n.vz;

        const ddx = n.x - n.baseX;
        const ddy = n.y - n.baseY;
        const ddz = n.z - n.baseZ;

        if (Math.abs(ddx) > 30) n.vx *= -1;
        if (Math.abs(ddy) > 25) n.vy *= -1;
        if (Math.abs(ddz) > 30) n.vz *= -1;

        // 3D Euler Rotation
        const x1 = n.x * cosY + n.z * sinY;
        const y1 = n.y;
        const z1 = -n.x * sinY + n.z * cosY;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const x3 = x2 * cosZ - y2 * sinZ;
        const y3 = x2 * sinZ + y2 * cosZ;
        const z3 = z2;

        // Clamped 3D perspective projection: prevents nodes from ballooning when close
        const rawScale = cameraDistance / (cameraDistance + z3);
        const scale = Math.min(1.18, Math.max(0.68, rawScale));
        n.scale = scale;
        n.screenX = centerX + cluster.transX + x3 * scale;
        n.screenY = centerY + cluster.transY + y3 * scale;
      }

      // 2. Determine target edge connections with maxEdgesPerNode capping
      const candidateEdges = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          const dx = a.screenX - b.screenX;
          const dy = a.screenY - b.screenY;
          const dist2D = Math.sqrt(dx * dx + dy * dy);

          const avgScale = (a.scale + b.scale) * 0.5;
          const maxDistProjected = maxConnectDistance * avgScale;

          if (dist2D < maxDistProjected) {
            candidateEdges.push({
              i,
              j,
              dist: dist2D,
              maxDist: maxDistProjected,
              avgScale,
              a,
              b,
            });
          }
        }
      }

      // Sort candidate edges so closest neighbors are preferred
      candidateEdges.sort((e1, e2) => e1.dist - e2.dist);

      const edgeCounts = new Uint8Array(nodes.length);
      const activeKeys = new Set();

      for (let k = 0; k < candidateEdges.length; k++) {
        const edge = candidateEdges[k];
        const { i, j, dist, maxDist, avgScale, a, b } = edge;

        if (
          edgeCounts[i] >= maxEdgesPerNode ||
          edgeCounts[j] >= maxEdgesPerNode
        ) {
          continue;
        }

        edgeCounts[i]++;
        edgeCounts[j]++;

        const key = `${i}-${j}`;
        activeKeys.add(key);

        const proximity = 1 - dist / maxDist;
        const depthFactor = Math.max(0.25, avgScale);
        const targetAlpha = proximity * 0.32 * depthFactor;

        // Smooth gradual fade in: edges develop so slowly that no one notices
        const prevAlpha = edgeAlphas.get(key) || 0;
        const newAlpha = prevAlpha + (targetAlpha - prevAlpha) * 0.025;
        edgeAlphas.set(key, newAlpha);

        if (newAlpha > 0.01) {
          ctx.beginPath();
          ctx.moveTo(a.screenX, a.screenY);
          ctx.lineTo(b.screenX, b.screenY);
          ctx.strokeStyle = `${LINE_COLOR_BASE}${newAlpha})`;
          ctx.lineWidth = proximity > 0.65 ? 1.0 * avgScale : 0.65 * avgScale;
          ctx.stroke();
        }
      }

      // Smooth gradual fade out for disconnected edges
      edgeAlphas.forEach((alpha, key) => {
        if (!activeKeys.has(key)) {
          const newAlpha = alpha * 0.96; // fade out gradually
          if (newAlpha < 0.008) {
            edgeAlphas.delete(key);
          } else {
            edgeAlphas.set(key, newAlpha);
            const [iStr, jStr] = key.split("-");
            const a = nodes[Number(iStr)];
            const b = nodes[Number(jStr)];
            if (a && b) {
              const avgScale = (a.scale + b.scale) * 0.5;
              ctx.beginPath();
              ctx.moveTo(a.screenX, a.screenY);
              ctx.lineTo(b.screenX, b.screenY);
              ctx.strokeStyle = `${LINE_COLOR_BASE}${newAlpha})`;
              ctx.lineWidth = 0.65 * avgScale;
              ctx.stroke();
            }
          }
        }
      });

      // 3. Draw nodes with hero background colors & subtle halos
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const pulse = Math.sin(time * n.pulseSpeed * 60 + n.pulseOffset) * 0.12;
        const currentRadius = Math.max(0.8, (n.radius + pulse) * n.scale);

        // Subtle, tight halo ring on prominent nodes (capped size, no bloated circles)
        if (n.isProminent) {
          ctx.beginPath();
          ctx.arc(n.screenX, n.screenY, currentRadius + 2.0, 0, Math.PI * 2);
          ctx.fillStyle = HALO_COLOR;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(n.screenX, n.screenY, currentRadius + 1.4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(8, 43, 80, 0.22)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Main node circle
        ctx.beginPath();
        ctx.arc(n.screenX, n.screenY, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = Math.min(1.0, n.baseAlpha * n.scale);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    }

    resize();
    render();

    window.addEventListener("resize", resize, { passive: true });
    parent.addEventListener("mousemove", handleMouseMove, { passive: true });
    parent.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [nodeCount, maxConnectDistance, maxEdgesPerNode]);

  return (
    <canvas
      ref={canvasRef}
      className="particle-network-canvas"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
      aria-hidden="true"
    />
  );
}
