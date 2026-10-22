"use client";

import { useEffect, useRef } from "react";
import type * as T3 from "three";

// Escena 3D del hero (dirección aprobada, refinada): un ÚNICO objeto protagonista
// —el "núcleo" del sistema, metálico— flota en oscuridad cálida, con pocos
// nodos-agente conectados por filamentos. Materialidad legible (luz principal +
// contorno, bloom contenido, ember como acento localizado). El movimiento es
// intencional: ensamblado breve → composición clara, parallax sutil y una
// transición de cámara por scroll que revela otra cara del mismo objeto. Con
// prefers-reduced-motion queda ensamblado y quieto. Si WebGL falla, avisa (onError)
// para que el contenedor muestre el respaldo estático.
export function HeroCoreScene({ onError, scrollDriven = true }: { onError?: () => void; scrollDriven?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    (async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        onError?.();
        return;
      }
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

      let renderer: T3.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      } catch {
        onError?.();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w(), h());
      renderer.setClearColor(CANVAS, 1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      // Si el contexto se pierde, mostrar el respaldo.
      renderer.domElement.addEventListener("webglcontextlost", () => onError?.());
      mount.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(CANVAS, 0.06);
      // Reflejos de estudio suaves → materialidad del metal (intensidad moderada).
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.045).texture;

      const camera = new THREE.PerspectiveCamera(46, w() / h(), 0.1, 100);
      const camZ = () => (isMobile() ? 8.2 : 6.2);
      camera.position.set(0, 0, camZ());
      // Altura base: eleva el núcleo al tercio superior, dejando el titular debajo.
      const baseY = () => (isMobile() ? 1.5 : 0.8);

      const root = new THREE.Group();
      scene.add(root);

      // --- Núcleo metálico + aristas ember (acento localizado) ---
      const coreGeo = new THREE.IcosahedronGeometry(1.95, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x40291a, metalness: 0.9, roughness: 0.4,
        emissive: 0x521d05, emissiveIntensity: 0.65, envMapIntensity: 0.78, flatShading: true,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      root.add(core);

      const edgeGeo = new THREE.EdgesGeometry(coreGeo);
      const edgeMat = new THREE.LineBasicMaterial({ color: EMBER, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.scale.setScalar(1.012);
      core.add(edges);

      // Halo interior muy contenido (acento, no fuente de sobreexposición)
      const haloMat = new THREE.MeshBasicMaterial({ color: EMBER, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending });
      const halo = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 24), haloMat);
      core.add(halo);

      // --- Nodos-agente (pocos, ordenados, arco superior para no cruzar el texto) ---
      const NODES = isMobile() ? 5 : 7;
      const nodeGeo = new THREE.OctahedronGeometry(0.15, 0);
      const nodeMat = new THREE.MeshStandardMaterial({ color: CREAM, emissive: EMBER_HI, emissiveIntensity: 1.8, metalness: 0.3, roughness: 0.5 });
      const nodeGroup = new THREE.Group();
      root.add(nodeGroup);

      type Agent = { mesh: T3.Mesh; target: T3.Vector3; start: T3.Vector3; phase: number };
      const agents: Agent[] = [];
      const linePositions = new Float32Array(NODES * 2 * 3);
      for (let i = 0; i < NODES; i++) {
        const t = NODES > 1 ? i / (NODES - 1) : 0.5;
        // Arco superior/derecho (evita el cuadrante inferior izquierdo del titular)
        const theta = -0.35 + t * Math.PI * 1.35;
        const y = 0.35 + t * 2.15;
        const r = 2.45 + Math.sin(t * Math.PI * 2) * 0.3;
        const target = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r * 0.7);
        const start = target.clone().multiplyScalar(2.8).add(new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4));
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

      // --- Luces: principal (cálida) + contorno (ember) + relleno tenue ---
      scene.add(new THREE.AmbientLight(0x3a2c20, 0.42));
      const key = new THREE.DirectionalLight(0xffe4c4, 2.3); key.position.set(-4.5, 5, 5); scene.add(key);
      const rim = new THREE.DirectionalLight(0xff6a2a, 1.7); rim.position.set(5, 0.5, -4.5); scene.add(rim);
      const fill = new THREE.DirectionalLight(0x7a5c42, 0.5); fill.position.set(3, -3, 3); scene.add(fill);
      const emberLight = new THREE.PointLight(EMBER, 2.4, 12, 2); emberLight.position.set(0, 0, 0); root.add(emberLight);

      // --- Postproceso: bloom CONTENIDO (solo lo más brillante) ---
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(w(), h()), 0.42, 0.5, 0.34);
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
        // El contenedor sticky aporta ~0.9vh de recorrido; mapea a 0..1.
        scrollP = Math.max(0, Math.min(1, window.scrollY / (vh * 0.85)));
      };
      if (!reduce && scrollDriven) window.addEventListener("scroll", onScroll, { passive: true });

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

      const INTRO = 2.3;
      const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

      const loop = () => {
        if (disposed || !visible) return;
        // reduced-motion: una sola pasada (ensamblado y quieto), sin bucle continuo.
        if (!reduce) raf = requestAnimationFrame(loop);
        const t = clock.getElapsedTime();
        const intro = reduce ? 1 : Math.min(1, t / INTRO);
        const e = easeOut(intro);

        // Ensamblado: núcleo escala + aristas/halo aparecen (contenidos)
        const coreScale = reduce ? 1 : 0.35 + 0.65 * easeOut(Math.min(1, t / 1.0));
        core.scale.setScalar(coreScale);
        edgeMat.opacity = (0.3 + 0.12 * Math.sin(t * 0.9)) * e;
        haloMat.opacity = (0.16 + 0.07 * Math.sin(t * 1.2)) * e;

        // Nodos vuelan a su órbita; filamentos se dibujan (sutiles)
        const pos = lineGeo.getAttribute("position") as T3.BufferAttribute;
        for (let i = 0; i < agents.length; i++) {
          const a = agents[i];
          const nodeE = reduce ? 1 : easeOut(Math.min(1, Math.max(0, (t - 0.4 - i * 0.08) / 1.2)));
          a.mesh.position.lerpVectors(a.start, a.target, nodeE);
          a.mesh.scale.setScalar(0.001 + nodeE);
          const bob = reduce ? 0 : Math.sin(t * 0.9 + a.phase) * 0.03;
          a.mesh.position.y += bob;
          const m = a.mesh.material as T3.MeshStandardMaterial;
          m.emissiveIntensity = 1.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3 + a.phase));
          pos.setXYZ(i * 2, 0, 0, 0);
          pos.setXYZ(i * 2 + 1, a.mesh.position.x, a.mesh.position.y, a.mesh.position.z);
        }
        pos.needsUpdate = true;
        lineMat.opacity = (0.2 + 0.06 * Math.sin(t * 1.0)) * e;

        // Movimiento idle: lento y coordinado
        if (!reduce) {
          core.rotation.y += 0.0010;
          core.rotation.x = Math.sin(t * 0.18) * 0.07;
          nodeGroup.rotation.y = -t * 0.035;
          emberLight.intensity = 2.4 + 0.4 * Math.sin(t * 1.6);
        }

        // Parallax sutil + transición de cámara por scroll (revela otra cara)
        pointer.x += (pointer.tx - pointer.x) * 0.045;
        pointer.y += (pointer.ty - pointer.y) * 0.045;
        const breathe = reduce ? 0 : Math.sin(t * 0.45) * 0.1;
        camera.position.x = pointer.x * 0.55;
        camera.position.y = -pointer.y * 0.38 + scrollP * 0.5;
        camera.position.z = camZ() + breathe + scrollP * 1.5;
        root.rotation.y = pointer.x * 0.16 + scrollP * 0.85;
        root.rotation.x = pointer.y * 0.09 - scrollP * 0.12;
        root.position.y = baseY() + scrollP * 0.35;
        (root as T3.Group).scale.setScalar(1 - scrollP * 0.07);
        camera.lookAt(0, scrollP * 0.3, 0);

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
  }, [onError, scrollDriven]);

  return <div ref={mountRef} className="hv2-canvas" aria-hidden="true" />;
}
