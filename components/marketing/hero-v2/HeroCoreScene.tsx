"use client";

import { useEffect, useRef } from "react";
import type * as T3 from "three";

// Escena 3D del hero (propuesta nueva, inspirada en ORYZO): un ÚNICO objeto
// protagonista —un "núcleo" del sistema— flotando en oscuridad cálida, con
// nodos-agente conectados por filamentos de luz ember. Materialidad e
// iluminación reales (three.js + bloom). El movimiento TRANSFORMA la composición
// (ensamblado de los nodos) y muestra profundidad (parallax + órbita + respiración
// de cámara). Con prefers-reduced-motion queda ensamblado y quieto.
export function HeroCoreScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      const THREE = await import("three");
      const { EffectComposer } = await import("three/examples/jsm/postprocessing/EffectComposer.js");
      const { RenderPass } = await import("three/examples/jsm/postprocessing/RenderPass.js");
      const { UnrealBloomPass } = await import("three/examples/jsm/postprocessing/UnrealBloomPass.js");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const CANVAS = 0x120a05;
      const EMBER = 0xdc5000;
      const EMBER_HI = 0xff7a33;
      const CREAM = 0xffedd7;

      const w = () => mount.clientWidth || window.innerWidth;
      const h = () => mount.clientHeight || window.innerHeight;
      const isMobile = () => w() < 760;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w(), h());
      renderer.setClearColor(CANVAS, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(CANVAS, 0.07);
      // Reflejos de estudio → materialidad del metal del núcleo.
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new THREE.PerspectiveCamera(46, w() / h(), 0.1, 100);
      const camZ = () => (isMobile() ? 8.0 : 6.5);
      camera.position.set(0, 0, camZ());
      // Altura base: eleva el núcleo al tercio superior, dejando el titular debajo.
      const baseY = () => (isMobile() ? 1.75 : 0.9);

      // --- Grupo raíz (para parallax/rotación global) ---
      const root = new THREE.Group();
      scene.add(root);

      // --- Núcleo: icosaedro metálico oscuro + aristas ember "en construcción" ---
      const coreGeo = new THREE.IcosahedronGeometry(1.95, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x3a2616, metalness: 0.92, roughness: 0.26,
        emissive: 0x7a3209, emissiveIntensity: 0.9, envMapIntensity: 1.25, flatShading: true,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      root.add(core);

      const edgeGeo = new THREE.EdgesGeometry(coreGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: EMBER, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.scale.setScalar(1.012);
      core.add(edges);

      // Halo interior (fuente de bloom)
      const haloMat = new THREE.MeshBasicMaterial({ color: EMBER_HI, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.82, 24, 24), haloMat);
      core.add(halo);

      // --- Nodos-agente + filamentos ---
      const NODES = isMobile() ? 8 : 11;
      const nodeGeo = new THREE.OctahedronGeometry(0.15, 0);
      const nodeMat = new THREE.MeshStandardMaterial({ color: CREAM, emissive: EMBER_HI, emissiveIntensity: 2.4, metalness: 0.3, roughness: 0.5 });
      const nodeGroup = new THREE.Group();
      root.add(nodeGroup);

      type Agent = { mesh: T3.Mesh; target: T3.Vector3; start: T3.Vector3; phase: number };
      const agents: Agent[] = [];
      const linePositions = new Float32Array(NODES * 2 * 3);
      for (let i = 0; i < NODES; i++) {
        const t = i / NODES;
        const theta = t * Math.PI * 2 * 2.4 + 0.5;
        const y = (t - 0.5) * 4.1;
        const r = 3.2 + Math.sin(t * Math.PI * 3) * 0.45;
        const target = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);
        const start = target.clone().multiplyScalar(3.4).add(new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6));
        const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
        mesh.position.copy(reduce ? target : start);
        mesh.scale.setScalar(reduce ? 1 : 0.001);
        nodeGroup.add(mesh);
        agents.push({ mesh, target, start, phase: Math.random() * Math.PI * 2 });
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: EMBER, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      nodeGroup.add(lines);

      // --- Luces ---
      scene.add(new THREE.AmbientLight(0x4a3322, 0.5));
      const key = new THREE.DirectionalLight(0xffe3c0, 3.2); key.position.set(-4, 5, 5); scene.add(key);
      const rim = new THREE.DirectionalLight(0xffb070, 2.0); rim.position.set(5, -1, -4); scene.add(rim);
      const emberLight = new THREE.PointLight(EMBER, 9, 16, 2); emberLight.position.set(0, 0, 0); root.add(emberLight);

      // --- Postproceso: bloom cinematográfico ---
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(w(), h()), 0.82, 0.6, 0.2);
      composer.addPass(bloom);
      composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      composer.setSize(w(), h());

      // --- Interacción / estado ---
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
      const onPointer = (e: PointerEvent) => {
        const r = mount.getBoundingClientRect();
        pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      if (!reduce) window.addEventListener("pointermove", onPointer, { passive: true });

      let scrollP = 0;
      const onScroll = () => {
        const vh = window.innerHeight || 1;
        scrollP = Math.max(0, Math.min(1, window.scrollY / vh));
      };
      if (!reduce) window.addEventListener("scroll", onScroll, { passive: true });

      const onResize = () => {
        camera.aspect = w() / h();
        camera.position.z = camZ();
        camera.updateProjectionMatrix();
        renderer.setSize(w(), h());
        composer.setSize(w(), h());
      };
      window.addEventListener("resize", onResize);

      // --- Loop ---
      const clock = new THREE.Clock();
      let raf = 0;
      let visible = true;
      const onVis = () => { visible = document.visibilityState === "visible"; if (visible) loop(); };
      document.addEventListener("visibilitychange", onVis);

      const INTRO = 2.6;
      const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

      const loop = () => {
        if (disposed || !visible) return;
        raf = requestAnimationFrame(loop);
        const t = clock.getElapsedTime();
        const intro = reduce ? 1 : Math.min(1, t / INTRO);
        const e = easeOut(intro);

        // Ensamblado: núcleo escala + aristas/halo aparecen
        const coreScale = reduce ? 1 : 0.2 + 0.8 * easeOut(Math.min(1, t / 1.1));
        core.scale.setScalar(coreScale);
        edgeMat.opacity = (0.62 + 0.25 * Math.sin(t * 1.2)) * e;
        haloMat.opacity = (0.5 + 0.2 * Math.sin(t * 1.6)) * e;

        // Nodos vuelan a su órbita; filamentos se dibujan
        const pos = lineGeo.getAttribute("position") as T3.BufferAttribute;
        for (let i = 0; i < agents.length; i++) {
          const a = agents[i];
          const nodeE = reduce ? 1 : easeOut(Math.min(1, Math.max(0, (t - 0.3 - i * 0.05) / 1.3)));
          a.mesh.position.lerpVectors(a.start, a.target, nodeE);
          a.mesh.scale.setScalar(0.001 + nodeE);
          // bob sutil
          const bob = reduce ? 0 : Math.sin(t * 1.3 + a.phase) * 0.06;
          a.mesh.position.y += bob;
          const m = a.mesh.material as T3.MeshStandardMaterial;
          m.emissiveIntensity = 1.8 + 1.4 * (0.5 + 0.5 * Math.sin(t * 2 + a.phase));
          pos.setXYZ(i * 2, 0, 0, 0);
          pos.setXYZ(i * 2 + 1, a.mesh.position.x, a.mesh.position.y, a.mesh.position.z);
        }
        pos.needsUpdate = true;
        lineMat.opacity = (0.34 + 0.16 * Math.sin(t * 1.4)) * e;

        // Movimiento idle: rotación núcleo + contrarrotación de nodos
        if (!reduce) {
          core.rotation.y += 0.0016;
          core.rotation.x = Math.sin(t * 0.25) * 0.12;
          nodeGroup.rotation.y = -t * 0.08;
          emberLight.intensity = 6.5 + Math.sin(t * 2.2) * 1.3;
        }

        // Parallax + profundidad (cámara) + empuje por scroll
        pointer.x += (pointer.tx - pointer.x) * 0.05;
        pointer.y += (pointer.ty - pointer.y) * 0.05;
        const breathe = reduce ? 0 : Math.sin(t * 0.5) * 0.15;
        camera.position.x = pointer.x * 0.9;
        camera.position.y = -pointer.y * 0.6;
        camera.position.z = camZ() + breathe + scrollP * 2.2;
        root.rotation.y = pointer.x * 0.25;
        root.rotation.x = pointer.y * 0.12;
        root.position.y = baseY() + scrollP * 0.6;
        (root as T3.Group).scale.setScalar(1 - scrollP * 0.12);
        camera.lookAt(0, 0, 0);

        composer.render();
      };
      loop();

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        document.removeEventListener("visibilitychange", onVis);
        composer.dispose();
        pmrem.dispose();
        renderer.dispose();
        scene.traverse((o) => {
          const any = o as unknown as { geometry?: { dispose(): void }; material?: { dispose(): void } | Array<{ dispose(): void }> };
          any.geometry?.dispose?.();
          const mat = any.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat?.dispose?.();
        });
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      });
    })();

    return () => {
      disposed = true;
      cleanups.forEach((c) => c());
    };
  }, []);

  return <div ref={mountRef} className="hv2-canvas" aria-hidden="true" />;
}
