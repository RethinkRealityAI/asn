"use client";

/**
 * HeroScene — the scroll-scrubbed 3D peppermint-oil bottle.
 *
 * This is the signature premium moment of the storefront. A single warm-lit
 * GLB bottle that reveals, spins, and dollies in as the user scrolls through
 * the hero section.
 *
 * Scroll-scrub contract:
 *   The parent (Hero3D) drives a framer-motion `scrollYProgress` MotionValue
 *   (0 → 1 across the tall hero section) and passes it down. We read it every
 *   frame inside `useFrame` via `progress.get()` — NOT via React state — so
 *   scrubbing is buttery and never triggers re-renders. Mappings:
 *     - reveal : opacity + scale 0.6 → 1 over progress 0 → 0.25
 *     - spin   : rotation.y 0 → 2π (one full turn) over progress 0 → 1
 *     - dolly  : the bottle eases toward the camera (z) as progress increases
 *   Plus a tiny sin(time) idle drift so it feels alive at rest. Everything
 *   lerps toward its target, so scrubbing BACK smoothly reverses.
 *
 * Warmth rule: lighting + environment are warm only. NEVER blue.
 */

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

const MODEL_URL = "/models/peppermint_oil_web.glb";
const DRACO_PATH = "/draco/";

// Preload the model + wire the self-hosted Draco decoder (no runtime CDN).
useGLTF.preload(MODEL_URL, DRACO_PATH);

/** Frame-rate-independent damping toward a target. */
function damp(current: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}

interface BottleProps {
  scrollYProgress: MotionValue<number>;
}

function Bottle({ scrollYProgress }: BottleProps) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);

  // Clone so repeated mounts (e.g. fast-refresh) don't mutate the cached scene.
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        const mat = mesh.material as THREE.Material | THREE.Material[];
        // Allow per-mesh opacity fade-in during the reveal.
        const apply = (m: THREE.Material) => {
          m.transparent = true;
          m.depthWrite = true;
        };
        if (Array.isArray(mat)) mat.forEach(apply);
        else if (mat) apply(mat);
      }
    });
    return clone;
  }, [scene]);

  // Normalize the model: center it and scale to a consistent height so the
  // framing is predictable regardless of the source GLB's authored units.
  const { centeredOffset, baseScale } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    // Target ~2.6 world units tall for a comfortable hero framing.
    const target = 2.6;
    return {
      centeredOffset: center,
      baseScale: target / maxDim,
    };
  }, [model]);

  const outer = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);

  // Smoothed animation state (so scrubbing both ways eases).
  const state = useRef({ reveal: 0, spin: 0, dolly: 0 });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1); // clamp huge frames (tab refocus)
    const p = THREE.MathUtils.clamp(scrollYProgress.get(), 0, 1);

    // ── Targets from scroll progress ───────────────────────────────
    // Reveal: 0 → 1 over the first quarter of the scroll.
    const revealTarget = THREE.MathUtils.clamp(p / 0.25, 0, 1);
    // Spin: one full turn across the whole hero.
    const spinTarget = p * Math.PI * 2;
    // Dolly: bottle eases forward (toward camera) as we scroll in.
    const dollyTarget = p; // 0 → 1, mapped to z below

    const s = state.current;
    s.reveal = damp(s.reveal, revealTarget, 6, dt);
    s.spin = damp(s.spin, spinTarget, 6, dt);
    s.dolly = damp(s.dolly, dollyTarget, 5, dt);

    const t = _.clock.elapsedTime;

    if (outer.current) {
      // Reveal scale: 0.6 → 1, eased.
      const revealScale = 0.6 + s.reveal * 0.4;
      const scl = baseScale * revealScale;
      outer.current.scale.setScalar(scl);

      // Right-lane offset: shift bottle into the right half of the hero so
      // it clears the left-aligned headline CTA card at all scroll positions.
      // +1.5 world units right (at fov=38, camera z=6 → world width ≈ 4.3 at
      // the model plane, so +1.5 is ~35% right of center — comfortably in the
      // right lane without clipping the edge).
      outer.current.position.x = 1.5;

      // Dolly: gentle ease forward — cut from 1.1 to 0.45 so the bottle
      // stays tasteful and never balloons over the left-side headline.
      outer.current.position.z = s.dolly * 0.45;
      // Idle drift — a gentle bob + sway so it breathes at rest.
      outer.current.position.y =
        Math.sin(t * 0.6) * 0.04 + s.dolly * 0.05;
      outer.current.rotation.z = Math.sin(t * 0.4) * 0.015;
    }

    if (spinner.current) {
      // Spin + a whisper of idle yaw drift layered on top.
      spinner.current.rotation.y = s.spin + Math.sin(t * 0.3) * 0.05;
    }

    // Opacity fade-in across all materials during the reveal.
    const op = THREE.MathUtils.clamp(s.reveal, 0, 1);
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => (m.opacity = op));
        else if (mat) mat.opacity = op;
      }
    });
  });

  return (
    <group ref={outer}>
      <group ref={spinner}>
        {/* Inner group re-centers the model around its own bounding box. */}
        <primitive
          object={model}
          position={[
            -centeredOffset.x,
            -centeredOffset.y,
            -centeredOffset.z,
          ]}
        />
      </group>
    </group>
  );
}

interface HeroSceneProps {
  scrollYProgress: MotionValue<number>;
}

export default function HeroScene({ scrollYProgress }: HeroSceneProps) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0, 6], fov: 38, near: 0.1, far: 100 }}
      // Transparent — the hero section provides the warm cream backdrop.
      onCreated={({ gl }) => {
        gl.setClearAlpha(0);
      }}
    >
      {/* Pause render work + drop DPR when the tab/section is idle. */}
      <AdaptiveDpr pixelated={false} />

      {/* ── Warm studio lighting — NEVER blue ─────────────────────── */}
      {/* Soft cream ambient fill */}
      <ambientLight intensity={0.55} color="#F5ECDA" />
      {/* Key light: warm marigold-tinted, from upper right */}
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.1}
        color="#FBE7C2"
      />
      {/* Warm rim/back light for a soft golden edge */}
      <directionalLight
        position={[-5, 2, -4]}
        intensity={1.1}
        color="#EBA52C"
      />
      {/* Gentle clay underglow to ground it warm */}
      <pointLight position={[0, -3, 2]} intensity={0.5} color="#E2742B" />

      {/*
        Procedural warm environment for PBR reflections — built from
        Lightformers so the env map is generated locally with NO runtime CDN
        fetch (drei's HDRI presets pull from a GitHub CDN; we avoid that so the
        hero renders offline / regardless of network). All warm — never blue.
      */}
      <Environment resolution={256} environmentIntensity={0.5}>
        {/* Broad cream softbox from upper-front */}
        <Lightformer
          form="rect"
          intensity={2.2}
          color="#FBE7C2"
          position={[2, 3, 4]}
          scale={[8, 8, 1]}
        />
        {/* Warm marigold side wrap */}
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#EBA52C"
          position={[-4, 1, 2]}
          scale={[5, 6, 1]}
        />
        {/* Clay underglow */}
        <Lightformer
          form="circle"
          intensity={0.8}
          color="#E2742B"
          position={[0, -3, 1]}
          scale={[4, 4, 1]}
        />
        {/* Soft cream backlight rim */}
        <Lightformer
          form="ring"
          intensity={1.0}
          color="#F5ECDA"
          position={[-2, 2, -5]}
          scale={[4, 4, 1]}
        />
      </Environment>

      <Bottle scrollYProgress={scrollYProgress} />
    </Canvas>
  );
}
