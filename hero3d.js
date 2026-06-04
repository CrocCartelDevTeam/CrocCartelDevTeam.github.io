// ============================================================
// 3D hero scene — progressive enhancement.
// Loads Three.js from CDN. If anything fails (offline, blocked,
// reduced-motion, no WebGL), it bails silently and the site is
// unaffected (the WebGL shader + showcase remain).
// ============================================================

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isSmall = window.matchMedia("(max-width: 900px)").matches;
const stage = document.getElementById("threeStage");

if (stage && !prefersReduced && !isSmall) {
  init().catch(() => { /* silent fallback */ });
}

async function init() {
  const THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 9;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  stage.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  // ---- Central crystal: solid core + glowing wireframe shell ----
  const COLORS = { teal: 0x2dd4a7, indigo: 0x6366f1, violet: 0xa855f7, cyan: 0x22d3ee };

  const coreGeo = new THREE.IcosahedronGeometry(2.1, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x0b1220, metalness: 0.85, roughness: 0.25,
    emissive: 0x0a3d36, emissiveIntensity: 0.5, flatShading: true,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Wireframe shells share the SAME geometry detail & orientation as the core,
  // so every edge lines up perfectly with the faceted core: one clean crystal.
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.55, 1)),
    new THREE.LineBasicMaterial({ color: COLORS.teal, transparent: true, opacity: 0.6 })
  );
  group.add(shell);

  const shell2 = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.05, 1)),
    new THREE.LineBasicMaterial({ color: COLORS.violet, transparent: true, opacity: 0.25 })
  );
  group.add(shell2);

  // ---- Lights ----
  scene.add(new THREE.AmbientLight(0x223344, 1.2));
  const l1 = new THREE.PointLight(COLORS.teal, 120, 60); l1.position.set(6, 5, 8); scene.add(l1);
  const l2 = new THREE.PointLight(COLORS.violet, 110, 60); l2.position.set(-7, -4, 6); scene.add(l2);
  const l3 = new THREE.PointLight(COLORS.indigo, 80, 60); l3.position.set(0, 6, -6); scene.add(l3);

  // ---- Depth particle field ----
  const COUNT = 520;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = 7 + Math.random() * 16;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pPos[i * 3 + 2] = r * Math.cos(ph) - 6;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0x6fe9d0, size: 0.05, transparent: true, opacity: 0.65, depthWrite: false })
  );
  scene.add(particles);

  // position the whole cluster to the right so it sits behind the hero showcase
  const reposition = () => {
    const wide = window.innerWidth > 1024;
    group.position.x = wide ? 3.4 : 0;
    particles.position.x = wide ? 1.5 : 0;
  };
  reposition();

  // ---- Interaction ----
  const mouse = { x: 0, y: 0 };
  let tx = 0, ty = 0;
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  });

  // hero parallax on scroll: drift the cluster as you scroll past the hero
  let scrollY = window.scrollY;
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    reposition();
  };
  window.addEventListener("resize", onResize);

  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) requestAnimationFrame(loop); });

  const clock = new THREE.Clock();

  function loop() {
    if (!running) return;
    const t = clock.getElapsedTime();

    tx += (mouse.x - tx) * 0.04;
    ty += (mouse.y - ty) * 0.04;

    // Whole crystal rotates as one rigid body — core + both shells stay aligned.
    group.rotation.y = t * 0.12 + tx * 0.5;
    group.rotation.x = ty * 0.4 + Math.sin(t * 0.3) * 0.08;
    group.rotation.z = Math.sin(t * 0.18) * 0.05;

    // gentle uniform pulse keeps it perfectly symmetric (no warping)
    group.scale.setScalar(1 + Math.sin(t * 0.8) * 0.02);

    particles.rotation.y = t * 0.02;
    // gentle scroll drift + fade with hero exit
    const fade = Math.max(0, 1 - scrollY / (window.innerHeight * 0.9));
    group.position.y = -scrollY * 0.004;
    stage.style.opacity = String(0.25 + 0.75 * fade);

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  // reveal the stage now that it's ready
  stage.classList.add("ready");
  requestAnimationFrame(loop);
}
