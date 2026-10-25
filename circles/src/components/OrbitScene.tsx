"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/** Fired by the calculator's circle-size control: `detail` is the member count. */
export const MEMBERS_EVENT = "circles:members";

const MODEL_URL = "/models/circle-diamond.glb";
const HDR_URL = "/models/studio.hdr";
const ORBIT = 2.85;
const DIP = 1.5;

type Token = { mesh: THREE.Mesh; angle: number; target: number; scale: number };
type Band = { pivot: THREE.Object3D; axis: THREE.Vector3; speed: number };

export default function OrbitScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      // Opaque, in the page's ground colour: the stones need a real backdrop to refract.
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch {
      return; // No WebGL: the plain ground colour stays behind the page.
    }
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(getComputedStyle(document.body).backgroundColor || "#dde3e5");

    const pmrem = new THREE.PMREMGenerator(renderer);
    // Soft fallback first; the studio HDRI replaces it once it arrives.
    let envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    new RGBELoader().load(HDR_URL, (hdr) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      const next = pmrem.fromEquirectangular(hdr).texture;
      hdr.dispose();
      envMap.dispose();
      envMap = next;
      scene.environment = next;
      if (still) frame(0);
    });

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0.2, 12.5);

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 6);
    scene.add(key);

    const rig = new THREE.Group();
    scene.add(rig);

    // Gold and diamond are set here rather than taken from the file, so they match the web renderer.
    const gold = new THREE.MeshPhysicalMaterial({
      color: 0xf6c35c,
      metalness: 1,
      roughness: 0.14,
      clearcoat: 0.4,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.35,
    });
    const diamond = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 1,
      thickness: 1.6,
      ior: 2.42,
      dispersion: 6,
      iridescence: 0.35,
      iridescenceIOR: 1.6,
      specularIntensity: 1,
      envMapIntensity: 2.2,
      flatShading: true,
    });

    const piece = new THREE.Group();
    // Modelled table-up in Blender (Z up becomes Y up in glTF); turn it to face the viewer, a little tipped.
    piece.rotation.set(Math.PI / 2 - 0.32, 0, 0.1);
    rig.add(piece);

    const bands: Band[] = [];
    let stoneGeo: THREE.BufferGeometry | null = null;

    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        const root = gltf.scene;
        root.traverse((o) => {
          if (!(o instanceof THREE.Mesh)) return;
          const name = (Array.isArray(o.material) ? o.material[0] : o.material)?.name ?? "";
          o.material = /diamond/i.test(name) ? diamond : gold;
          if (/diamond/i.test(name) && !stoneGeo) stoneGeo = o.geometry;
        });
        // Each band gets its own pivot so it can precess slowly around a tilted axis.
        root.children
          .filter((c) => c.name.startsWith("Band_"))
          .forEach((band, i) => {
            const pivot = new THREE.Object3D();
            root.add(pivot);
            pivot.add(band);
            const axis = new THREE.Vector3(Math.sin(i * 1.7), Math.cos(i * 1.3), 0.6 + 0.2 * Math.sin(i)).normalize();
            bands.push({ pivot, axis, speed: (i % 2 ? -1 : 1) * (0.05 + 0.02 * i) });
          });
        piece.add(root);
        setMembers(members);
        canvas.dataset.ready = "true";
        if (still) frame(0);
      },
      undefined,
      () => {
        canvas.dataset.ready = "error";
      },
    );

    // Members of the circle: small stones orbiting the piece. The first one, in gold, is you.
    const orbit = new THREE.Group();
    orbit.rotation.set(0.38, 0, -0.2);
    rig.add(orbit);
    const you = new THREE.MeshPhysicalMaterial({ color: 0xffb000, metalness: 1, roughness: 0.18, envMapIntensity: 1.4 });

    const tokens: Token[] = [];
    let members = 8;
    const setMembers = (n: number) => {
      members = Math.max(3, Math.min(24, Math.round(n)));
      if (!stoneGeo) return;
      while (tokens.length < members) {
        const first = tokens.length === 0;
        const mesh = new THREE.Mesh(first ? new THREE.SphereGeometry(1, 32, 16) : stoneGeo, first ? you : diamond);
        mesh.scale.setScalar(0.001);
        orbit.add(mesh);
        const last = tokens[tokens.length - 1];
        tokens.push({ mesh, angle: last ? last.angle : 0, target: 0, scale: 1 });
      }
      tokens.forEach((t, i) => {
        t.scale = i < members ? (i === 0 ? 0.1 : 0.16) : 0;
        t.target = (i / members) * Math.PI * 2;
      });
      if (still) frame(0);
    };

    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const wide = w / h > 1.1;
      rig.position.set(wide ? 1.7 : 0, wide ? 0 : -0.5, 0);
      rig.scale.setScalar(wide ? 0.95 : 0.7);
      if (still) frame(0);
    };

    let scrollT = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollT = max > 0 ? window.scrollY / max : 0;
      if (still) frame(0);
    };

    let pointerX = 0;
    let pointerY = 0;
    const onPointer = (e: PointerEvent) => {
      pointerX = e.clientX / w - 0.5;
      pointerY = e.clientY / h - 0.5;
    };

    const onMembers = (e: Event) => setMembers((e as CustomEvent<number>).detail);

    // One member at a time dips toward the stone and comes back: a loan out, a repayment in.
    let dipIndex = -1;
    let dipStart = 0;
    const DIP_EVERY = 5.5;
    const DIP_FOR = 2.6;

    const clock = new THREE.Clock();
    const q = new THREE.Quaternion();
    let raf = 0;
    let spin = 0;

    function frame(dt: number) {
      const t = clock.elapsedTime;
      if (!still) {
        spin += dt * 0.16;
        for (const b of bands) b.pivot.quaternion.multiply(q.setFromAxisAngle(b.axis, b.speed * dt));
        if (t - dipStart > DIP_EVERY && tokens.length) {
          const live = tokens.filter((x) => x.scale > 0);
          dipIndex = tokens.indexOf(live[Math.floor(Math.random() * live.length)]);
          dipStart = t;
        }
      }
      piece.rotation.z = 0.1 + scrollT * Math.PI * 0.8;
      orbit.rotation.y = spin + scrollT * Math.PI * 1.2;
      rig.rotation.x = THREE.MathUtils.lerp(rig.rotation.x, pointerY * 0.22, 0.05);
      rig.rotation.y = THREE.MathUtils.lerp(rig.rotation.y, pointerX * 0.35, 0.05);

      tokens.forEach((tk, i) => {
        const k = still ? 1 : Math.min(1, dt * 4);
        tk.angle += (tk.target - tk.angle) * k;
        const s = tk.mesh.scale.x + (Math.max(tk.scale, 0.001) - tk.mesh.scale.x) * k;
        tk.mesh.scale.setScalar(s);
        let r = ORBIT;
        if (i === dipIndex) {
          const p = (t - dipStart) / DIP_FOR;
          if (p < 1) r = ORBIT - (ORBIT - DIP) * Math.sin(p * Math.PI);
        }
        tk.mesh.position.set(Math.cos(tk.angle) * r, Math.sin(tk.angle * 2) * 0.12, Math.sin(tk.angle) * r);
        tk.mesh.lookAt(0, 0, 0);
        tk.mesh.rotateX(-Math.PI / 2); // stones present their table outward
      });
      renderer.render(scene, camera);
    }

    const loop = () => {
      raf = requestAnimationFrame(loop);
      frame(Math.min(clock.getDelta(), 0.05));
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !still) {
        clock.getDelta();
        loop();
      }
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener(MEMBERS_EVENT, onMembers);
    document.addEventListener("visibilitychange", onVisibility);
    if (still) frame(0);
    else loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener(MEMBERS_EVENT, onMembers);
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) o.geometry.dispose();
      });
      [gold, diamond, you].forEach((m) => m.dispose());
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="orbit" aria-hidden="true" />;
}
