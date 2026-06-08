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
  // Narrow FOV (closer to orthographic) so the off-center crystal doesn't get
  // perspective-stretched near the frame edge — keeps it visually symmetric.
  const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 13.5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(window.innerWidth, window.innerHeight);
  stage.appendChild(renderer.domElement);

  const group = new THREE.Group();
  scene.add(group);

  // ---- Central crystal: a transparent faceted shell with glowing atoms inside ----
  const COLORS = { teal: 0x2dd4a7, indigo: 0x6366f1, violet: 0xa855f7, cyan: 0x22d3ee };

  // Transparent glass body — you see straight through it to the atoms within.
  const glass = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.2, 2),
    new THREE.MeshPhongMaterial({
      color: 0x0d2535, transparent: true, opacity: 0.1,
      shininess: 90, specular: 0x6affe6, side: THREE.DoubleSide, depthWrite: false,
    })
  );
  group.add(glass);

  // Clean, regular icosahedron cage (detail 0) — 30 identical edges, so the
  // wireframe is perfectly symmetric from every angle (no geodesic noise).
  const shell = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.55, 0)),
    new THREE.LineBasicMaterial({ color: COLORS.teal, transparent: true, opacity: 0.6 })
  );
  group.add(shell);

  const shell2 = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.05, 0)),
    new THREE.LineBasicMaterial({ color: COLORS.violet, transparent: true, opacity: 0.25 })
  );
  group.add(shell2);

  // ---- Glowing atoms bouncing inside the sphere ----
  const ATOM_R = 1.95; // containment radius (sits just inside the glass body)
  const ATOM_COUNT = 30;
  const atomPalette = [0x6fe9d0, 0x22d3ee, 0xa855f7, 0x6366f1, 0x2dd4a7];
  const atomGeo = new THREE.SphereGeometry(1, 14, 14);
  const atoms = [];
  for (let i = 0; i < ATOM_COUNT; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: atomPalette[i % atomPalette.length],
      transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const m = new THREE.Mesh(atomGeo, mat);
    const base = 0.05 + Math.random() * 0.08;
    m.scale.setScalar(base);
    const rr = Math.cbrt(Math.random()) * ATOM_R * 0.9;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    m.position.set(rr * Math.sin(ph) * Math.cos(th), rr * Math.sin(ph) * Math.sin(th), rr * Math.cos(ph));
    const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .normalize().multiplyScalar(0.012 + Math.random() * 0.016);
    atoms.push({ m, v, base });
    group.add(m);
  }

  // ---- Dynamic bonds between nearby atoms (molecular look) ----
  const MAX_BONDS = 90, BOND_DIST = 1.25;
  const bondPos = new Float32Array(MAX_BONDS * 2 * 3);
  const bondGeo = new THREE.BufferGeometry();
  bondGeo.setAttribute("position", new THREE.BufferAttribute(bondPos, 3));
  const bonds = new THREE.LineSegments(
    bondGeo,
    new THREE.LineBasicMaterial({ color: 0x7ef0db, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(bonds);

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

    // Whole crystal rotates as one rigid body — glass, shells & atoms stay aligned.
    group.rotation.y = t * 0.12 + tx * 0.5;
    group.rotation.x = ty * 0.4 + Math.sin(t * 0.3) * 0.08;
    group.rotation.z = Math.sin(t * 0.18) * 0.05;

    // gentle uniform pulse keeps it perfectly symmetric (no warping)
    group.scale.setScalar(1 + Math.sin(t * 0.8) * 0.02);

    // move atoms and bounce them off the inner sphere wall
    for (let i = 0; i < atoms.length; i++) {
      const a = atoms[i];
      a.m.position.add(a.v);
      const d = a.m.position.length();
      if (d > ATOM_R) {
        const inv = 1 / d;
        const nx = a.m.position.x * inv, ny = a.m.position.y * inv, nz = a.m.position.z * inv;
        const dot = a.v.x * nx + a.v.y * ny + a.v.z * nz;
        a.v.x -= 2 * dot * nx; a.v.y -= 2 * dot * ny; a.v.z -= 2 * dot * nz;
        a.m.position.multiplyScalar(ATOM_R * inv);
      }
      a.m.scale.setScalar(a.base * (1 + Math.sin(t * 3 + i) * 0.18));
    }

    // rebuild bonds between atoms that are currently close together
    let bi = 0;
    for (let i = 0; i < atoms.length && bi < MAX_BONDS; i++) {
      const pa = atoms[i].m.position;
      for (let j = i + 1; j < atoms.length && bi < MAX_BONDS; j++) {
        const pb = atoms[j].m.position;
        const dx = pa.x - pb.x, dy = pa.y - pb.y, dz = pa.z - pb.z;
        if (dx * dx + dy * dy + dz * dz < BOND_DIST * BOND_DIST) {
          const o = bi * 6;
          bondPos[o] = pa.x; bondPos[o + 1] = pa.y; bondPos[o + 2] = pa.z;
          bondPos[o + 3] = pb.x; bondPos[o + 4] = pb.y; bondPos[o + 5] = pb.z;
          bi++;
        }
      }
    }
    bondGeo.setDrawRange(0, bi * 2);
    bondGeo.attributes.position.needsUpdate = true;

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
