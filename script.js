// ============================================================
// Zach — Portfolio interactions
// ============================================================
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Intro preloader ----------
(function preloader() {
  const pre = document.getElementById("preloader");
  if (!pre) return;
  const bar = document.getElementById("preBar");
  const count = document.getElementById("preCount");
  document.body.style.overflow = "hidden";
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    if (bar) bar.style.width = "100%";
    if (count) count.textContent = "100";
    pre.classList.add("done");
    document.body.style.overflow = "";
  };
  if (prefersReduced) { finish(); return; }
  let pct = 0;
  const step = () => {
    pct += Math.random() * 16 + 6;
    if (pct >= 100) { finish(); return; }
    if (bar) bar.style.width = pct + "%";
    if (count) count.textContent = String(Math.floor(pct));
    setTimeout(step, 110);
  };
  setTimeout(step, 180);
  // hard safety net — never let the curtain block content
  setTimeout(finish, 3000);
})();

// ---------- Sticky nav + scroll progress ----------
const nav = document.getElementById("nav");
const progress = document.getElementById("scrollProgress");
const heroShowcase = document.getElementById("heroShowcase");
const onScroll = () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 24);
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
  if (heroShowcase && !prefersReduced && y < window.innerHeight) {
    heroShowcase.style.transform = `translateY(${y * 0.18}px)`;
    heroShowcase.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
  }
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// ---------- Mobile menu ----------
const navToggle = document.getElementById("navToggle");
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("menu-open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll(".nav-links a").forEach((link) =>
  link.addEventListener("click", () => {
    nav.classList.remove("menu-open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

// ---------- Cursor glow + custom cursor ----------
const glow = document.getElementById("cursorGlow");
const ring = document.getElementById("cursorRing");
const dot = document.getElementById("cursorDot");
if (glow && !isTouch && !prefersReduced) {
  document.body.classList.add("has-custom-cursor");
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let gx = mx, gy = my, rx = mx, ry = my;
  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    glow.style.opacity = "1";
    if (ring) ring.style.opacity = "1";
    if (dot) { dot.style.opacity = "1"; dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`; }
  });
  window.addEventListener("mouseleave", () => {
    glow.style.opacity = "0";
    if (ring) ring.style.opacity = "0";
    if (dot) dot.style.opacity = "0";
  });
  document.addEventListener("mousedown", () => ring && ring.classList.add("down"));
  document.addEventListener("mouseup", () => ring && ring.classList.remove("down"));

  const interactive = "a, button, .tilt, .service-card, .build-card, .counter, .step, input, textarea, [role=button]";
  document.querySelectorAll(interactive).forEach((el) => {
    el.addEventListener("mouseenter", () => ring && ring.classList.add("hover"));
    el.addEventListener("mouseleave", () => ring && ring.classList.remove("hover"));
  });

  const animateCursor = () => {
    gx += (mx - gx) * 0.12; gy += (my - gy) * 0.12;
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%, -50%)`;
    if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  };
  animateCursor();
}

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("in"), (i % 4) * 80);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

// ---------- Animated counters ----------
const counters = document.querySelectorAll(".counter-num");
if ("IntersectionObserver" in window && !prefersReduced) {
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10) || 0;
        const suffix = el.dataset.suffix || "";
        const dur = 1500;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased).toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => cio.observe(c));
} else {
  counters.forEach((c) => (c.textContent = (parseInt(c.dataset.target, 10) || 0).toLocaleString() + (c.dataset.suffix || "")));
}

// ---------- Skill bars ----------
const bars = document.querySelectorAll(".sb-fill");
if ("IntersectionObserver" in window) {
  const bio = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.pct + "%";
          bio.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  bars.forEach((b) => bio.observe(b));
} else {
  bars.forEach((b) => (b.style.width = b.dataset.pct + "%"));
}

// ---------- 3D tilt ----------
if (!isTouch && !prefersReduced) {
  document.querySelectorAll(".tilt").forEach((el) => {
    const strength = 8;
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * strength}deg) rotateX(${-py * strength}deg) translateY(-4px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });
}

// ---------- Magnetic buttons ----------
if (!isTouch && !prefersReduced) {
  document.querySelectorAll(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${mx * 0.18}px, ${my * 0.28}px) translateY(-2px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });
}

// ---------- Hero showcase parallax ----------
(function heroParallax() {
  const stage = document.getElementById("heroShowcase");
  if (!stage || isTouch || prefersReduced) return;
  const items = stage.querySelectorAll("[data-depth]");
  const hero = document.getElementById("hero");
  let tx = 0, ty = 0, cx = 0, cy = 0, active = false;
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    tx = (e.clientX - r.left) / r.width - 0.5;
    ty = (e.clientY - r.top) / r.height - 0.5;
    active = true;
  });
  hero.addEventListener("mouseleave", () => { tx = 0; ty = 0; });
  const loop = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    items.forEach((el) => {
      const d = parseFloat(el.dataset.depth) || 1;
      el.style.transform = `translate(${cx * d * 26}px, ${cy * d * 26}px)`;
    });
    requestAnimationFrame(loop);
  };
  loop();
})();

// ---------- Animated background: WebGL shader, with particle fallback ----------
const bgCanvas = document.getElementById("bgCanvas");
if (bgCanvas && !prefersReduced) {
  if (!initWebGLBackground(bgCanvas)) initParticles(bgCanvas);
}

function initWebGLBackground(canvas) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" })
    || canvas.getContext("experimental-webgl");
  if (!gl) return false;

  const vsrc = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  const fsrc = [
    "precision highp float;",
    "uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse;",
    "float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }",
    "float noise(vec2 p){ vec2 i=floor(p), f=fract(p);",
    "  float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));",
    "  vec2 u=f*f*(3.-2.*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }",
    "float fbm(vec2 p){ float v=0.,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy/u_res.xy;",
    "  vec2 p = uv; p.x *= u_res.x/u_res.y;",
    "  float t = u_time*0.045;",
    "  vec2 q = vec2(fbm(p*1.3+t), fbm(p*1.3+vec2(5.2,1.3)-t));",
    "  vec2 r = vec2(fbm(p*1.3+q*1.7+vec2(1.7,9.2)+t*0.5), fbm(p*1.3+q*1.7+vec2(8.3,2.8)-t*0.5));",
    "  float f = fbm(p*1.3+r*1.5);",
    "  vec3 teal=vec3(0.078,0.72,0.65), indigo=vec3(0.39,0.40,0.95), violet=vec3(0.66,0.33,0.97);",
    "  vec3 dark=vec3(0.024,0.027,0.043); vec3 col=dark;",
    "  col = mix(col, teal,   smoothstep(0.1,0.95,f)*0.40);",
    "  col = mix(col, indigo, smoothstep(0.3,1.10,r.x)*0.40);",
    "  col = mix(col, violet, smoothstep(0.4,1.20,q.y)*0.36);",
    "  vec2 m = u_mouse; float d = distance(uv, m);",
    "  col += teal*0.16*exp(-d*3.2);",
    "  float vig = smoothstep(1.25,0.25,length(uv-0.5)); col *= mix(0.55,1.0,vig);",
    "  col *= 0.92;",
    "  gl_FragColor = vec4(col, 1.0);",
    "}",
  ].join("\n");

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, vsrc), fs = compile(gl.FRAGMENT_SHADER, fsrc);
  if (!vs || !fs) return false;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "u_res");
  const uTime = gl.getUniformLocation(prog, "u_time");
  const uMouse = gl.getUniformLocation(prog, "u_mouse");
  const mouse = { x: 0.5, y: 0.5 };
  const scale = 0.5; // render at half res; gradient is low-frequency so it stays smooth

  const resize = () => {
    canvas.width = Math.max(1, Math.floor(window.innerWidth * scale));
    canvas.height = Math.max(1, Math.floor(window.innerHeight * scale));
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = 1 - e.clientY / window.innerHeight;
  });

  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) requestAnimationFrame(render); });
  const start = performance.now();
  let mx = 0.5, my = 0.5;
  const render = (now) => {
    if (!running) return;
    mx += (mouse.x - mx) * 0.05; my += (mouse.y - my) * 0.05;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(render);
  };
  requestAnimationFrame(render);
  return true;
}

// ---------- Particle network canvas (fallback) ----------
function initParticles(canvas) {
  const ctx = canvas.getContext("2d");
  let w, h, dpr, pts = [];
  const mouse = { x: -9999, y: -9999 };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    const count = Math.min(72, Math.floor((window.innerWidth * window.innerHeight) / 22000));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28 * dpr, vy: (Math.random() - 0.5) * 0.28 * dpr,
    }));
  };
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  window.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; });

  const linkDist = 130;
  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // mouse repel
      const mdx = p.x - mouse.x, mdy = p.y - mouse.y;
      const md = Math.hypot(mdx, mdy);
      if (md < 130 * dpr && md > 0) {
        p.x += (mdx / md) * 1.1; p.y += (mdy / md) * 1.1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(45, 212, 167, 0.55)";
      ctx.fill();

      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDist * dpr) {
          const a = (1 - dist / (linkDist * dpr)) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(120, 160, 220, ${a})`;
          ctx.lineWidth = dpr;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  };
  draw();
}

// ---------- Site previews ----------
// Previews are real, locally-captured screenshots committed in /assets/shots.
// If an image ever fails to load, reveal the branded emoji fallback tile.
// (Legacy mShots polling kept below for any element that still uses data-src.)
document.querySelectorAll(".media-frame").forEach((media) => {
  const img = media.querySelector(".shot");
  if (!img) return;
  const target = img.getAttribute("data-src");
  if (!target) {
    if (img.complete && img.naturalWidth === 0) media.classList.add("failed");
    img.addEventListener("error", () => media.classList.add("failed"), { once: true });
    return;
  }
  const base = "https://s.wp.com/mshots/v1/" + encodeURIComponent(target) + "?w=1280&h=860";
  let placeholderSig = null, polls = 0;
  const maxPolls = 10, intervalMs = 3000;
  const finalize = () => media.classList.remove("loading");

  const poll = () => {
    if (polls >= maxPolls) { finalize(); return; }
    polls += 1;
    const probe = new Image();
    probe.onload = () => {
      const sig = probe.naturalWidth + "x" + probe.naturalHeight;
      if (placeholderSig === null) {
        placeholderSig = sig; img.src = probe.src; setTimeout(poll, intervalMs);
      } else if (sig !== placeholderSig && probe.naturalWidth > 200) {
        img.src = probe.src; finalize();
      } else {
        setTimeout(poll, intervalMs);
      }
    };
    probe.onerror = () => {
      if (polls >= maxPolls) { media.classList.add("failed"); finalize(); }
      else setTimeout(poll, intervalMs);
    };
    probe.src = base + "&r=" + polls;
  };

  media.classList.add("loading");
  poll();
});
