/* FIKA — WebGL 3D engine (Three.js, procedural). Namespace CG.gfx.
   One persistent renderer + scene; a Group per station; the camera frames the
   active set. The DOM HUD/panels composite on top of this canvas. */
CG.gfx = (function () {
  'use strict';

  var T = window.THREE;
  var ok = !!T;

  /* ---------- warm palette ---------- */
  var COL = {
    wall:    0xf0e2c0,
    wallLo:  0xe7d3a8,
    floor:   0xcba274,
    wood:    0xb58a5a,
    counter: 0xc49a64,
    counterDark: 0xa07c4a,
    sage:    0x9eb585,
    sageDk:  0x7e9668,
    steel:   0xd8dde0,
    steelDk: 0x9aa2a6,
    clay:    0xd9876a,
    cream:   0xfdf6e6,
    ink:     0x4a3f33,
    espresso:0x3a2418,
    crema:   0xc79a5e,
    milk:    0xf4ead6
  };

  var renderer, scene, camera, raycaster, pointer, canvas, host;
  var sets = {};            // station name -> THREE.Group
  var camRig = { pos: null, target: null, toPos: null, toTarget: null, t: 1 };
  var clock = 0;
  var matCache = {};
  var espGlass = null, milkCup = null;  // 3D vessels driven by the brew/milk stations

  /* ---------- material helper (cached) ---------- */
  function mat(color, rough, metal, opts) {
    var key = color + '_' + (rough != null ? rough : 0.7) + '_' + (metal || 0) + '_' + (opts ? JSON.stringify(opts) : '');
    if (matCache[key]) return matCache[key];
    var p = { color: color, roughness: rough != null ? rough : 0.7, metalness: metal || 0 };
    if (opts) { for (var k in opts) p[k] = opts[k]; }
    var m = new T.MeshStandardMaterial(p);
    matCache[key] = m;
    return m;
  }

  function meshOf(geo, m, role) {
    var mesh = new T.Mesh(geo, m);
    mesh.castShadow = true; mesh.receiveShadow = true;
    if (role) mesh.userData.role = role;
    return mesh;
  }

  /* ---------- boot ---------- */
  function init() {
    if (!ok) return false;
    host = document.getElementById('screen-service');
    if (!host) return false;

    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (err) {
      renderer = null;
      return false; // no WebGL — main.js keeps the DOM/SVG layer
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputColorSpace = T.SRGBColorSpace;
    canvas = renderer.domElement;
    canvas.id = 'gl-canvas';
    host.insertBefore(canvas, host.firstChild);

    scene = new T.Scene();
    scene.background = new T.Color(COL.wall);
    scene.fog = new T.Fog(COL.wall, 9, 20);

    camera = new T.PerspectiveCamera(40, 1, 0.1, 60);
    camRig.pos = new T.Vector3(0, 1.5, 3.4);
    camRig.target = new T.Vector3(0, 1.05, 0);
    camRig.toPos = camRig.pos.clone();
    camRig.toTarget = camRig.target.clone();

    /* lights: warm hemisphere fill + key directional with soft shadow */
    var hemi = new T.HemisphereLight(0xfff3da, 0xb09878, 0.62);
    scene.add(hemi);
    var key = new T.DirectionalLight(0xfff0d2, 1.25);
    key.position.set(2.6, 5.2, 3.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1; key.shadow.camera.far = 16;
    key.shadow.camera.left = -4; key.shadow.camera.right = 4;
    key.shadow.camera.top = 4; key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.0006;
    key.shadow.radius = 4;
    scene.add(key);
    var rim = new T.DirectionalLight(0xffe7c4, 0.35);
    rim.position.set(-3, 2.4, -2);
    scene.add(rim);

    buildRoom();
    raycaster = new T.Raycaster();
    pointer = new T.Vector2();

    // a simple tap → emit the picked mesh role for station modules to act on
    canvas.addEventListener('pointerdown', function (e) {
      var role = pickRole(e.clientX, e.clientY);
      CG.events.emit('gltap', role, e);
    });

    window.addEventListener('resize', resize);
    resize();
    return true;
  }

  function available() { return ok && !!renderer; }

  /* ---------- shared room shell ---------- */
  function buildRoom() {
    var room = new T.Group();
    // floor
    var floor = meshOf(new T.PlaneGeometry(20, 20), mat(COL.floor, 0.95, 0));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true; floor.castShadow = false;
    room.add(floor);
    // back wall
    var wall = meshOf(new T.PlaneGeometry(20, 9), mat(COL.wallLo, 1, 0));
    wall.position.set(0, 4, -2.2);
    wall.castShadow = false;
    room.add(wall);
    // subtle wainscot band
    var band = meshOf(new T.BoxGeometry(20, 0.5, 0.04), mat(COL.sage, 0.9, 0));
    band.position.set(0, 1.7, -2.17);
    room.add(band);
    scene.add(room);
  }

  /* ---------- counter base reused by stations ---------- */
  function counterBase(topColor) {
    var g = new T.Group();
    var top = meshOf(new T.BoxGeometry(4.4, 0.18, 1.5), mat(topColor || COL.counter, 0.55, 0.05));
    top.position.set(0, 0.92, 0.15);
    g.add(top);
    var front = meshOf(new T.BoxGeometry(4.4, 0.92, 0.16), mat(COL.counterDark, 0.7, 0));
    front.position.set(0, 0.46, 0.88);
    g.add(front);
    return g;
  }

  /* ============ station sets ============ */

  function buildCounter() {
    var g = new T.Group();
    g.add(counterBase(COL.counter));
    // register: register a tip jar + pastry dome for life
    var dome = meshOf(new T.SphereGeometry(0.34, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      mat(0xffffff, 0.1, 0, { transparent: true, opacity: 0.32 }));
    dome.position.set(-1.5, 1.01, 0.1);
    g.add(dome);
    var cake = meshOf(new T.CylinderGeometry(0.26, 0.28, 0.16, 20), mat(0xe8c79a, 0.6, 0));
    cake.position.set(-1.5, 1.09, 0.1);
    g.add(cake);
    // register box
    var reg = meshOf(new T.BoxGeometry(0.5, 0.34, 0.4), mat(COL.cream, 0.5, 0.1));
    reg.position.set(1.45, 1.1, 0.1);
    g.add(reg);
    // a little potted plant
    g.add(plant(1.9, 1.0, -0.2));
    // guest stands behind the counter; placeholder mount point
    g.userData.guestAnchor = new T.Vector3(0, 0, -0.6);
    sets.order = g;
    g.visible = false;
    scene.add(g);
  }

  function plant(x, y, z) {
    var p = new T.Group();
    var pot = meshOf(new T.CylinderGeometry(0.13, 0.1, 0.18, 14), mat(COL.clay, 0.7, 0));
    pot.position.set(0, 0.09, 0); p.add(pot);
    for (var i = 0; i < 5; i++) {
      var leaf = meshOf(new T.SphereGeometry(0.1, 10, 8), mat(COL.sageDk, 0.8, 0));
      leaf.scale.set(0.6, 1.4, 0.6);
      leaf.position.set((Math.random() - 0.5) * 0.16, 0.26 + Math.random() * 0.12, (Math.random() - 0.5) * 0.16);
      p.add(leaf);
    }
    p.position.set(x, y, z);
    return p;
  }

  /* ---------- 3D customer figure ---------- */
  function buildCustomer(charId, mood) {
    var c = CG.data.CHARACTERS[charId];
    var g = new T.Group();
    var skin = parseInt((c.skin || '#e7b78c').slice(1), 16);
    var topc = parseInt((c.top || '#cf8f76').slice(1), 16);
    var hairc = parseInt((c.hairColor || '#46362b').slice(1), 16);

    // torso (rounded)
    var torso = meshOf(new T.CapsuleGeometry(0.34, 0.36, 6, 14), mat(topc, 0.75, 0));
    torso.position.y = 0.55; torso.scale.set(1, 1, 0.8);
    g.add(torso);
    // collar
    if (c.collar) {
      var col = parseInt(c.collar.slice(1), 16);
      var collar = meshOf(new T.TorusGeometry(0.2, 0.06, 8, 16), mat(col, 0.7, 0));
      collar.rotation.x = Math.PI / 2; collar.position.y = 0.82; collar.scale.set(1, 0.8, 1);
      g.add(collar);
    }
    // neck
    var neck = meshOf(new T.CylinderGeometry(0.1, 0.12, 0.12, 12), mat(skin, 0.8, 0));
    neck.position.y = 0.9; g.add(neck);
    // head
    var head = meshOf(new T.SphereGeometry(0.3, 24, 20), mat(skin, 0.85, 0), 'guest');
    head.position.y = 1.18; head.scale.set(1, 1.06, 0.96);
    g.add(head);
    // eyes
    var eyeMat = mat(COL.ink, 0.4, 0);
    [-0.11, 0.11].forEach(function (ex) {
      var eye = meshOf(new T.SphereGeometry(mood === 'angry' ? 0.035 : 0.046, 10, 8), eyeMat);
      eye.position.set(ex, 1.22, 0.275); eye.castShadow = false;
      g.add(eye);
      var hl = meshOf(new T.SphereGeometry(0.016, 6, 6), mat(0xffffff, 0.3, 0));
      hl.position.set(ex + 0.016, 1.245, 0.3); hl.castShadow = false;
      g.add(hl);
    });
    // blush
    if (mood === 'happy' || mood === 'neutral') {
      [-0.17, 0.17].forEach(function (bx) {
        var bl = meshOf(new T.SphereGeometry(0.05, 8, 6), mat(0xe79b88, 0.9, 0, { transparent: true, opacity: 0.5 }));
        bl.position.set(bx, 1.15, 0.245); bl.scale.set(1.3, 0.7, 0.4); bl.castShadow = false;
        g.add(bl);
      });
    }
    // mouth (smile arc as a thin torus segment, or flat bar)
    var smile = mood === 'happy' ? 0.9 : (mood === 'angry' || mood === 'annoyed') ? -0.5 : 0;
    var mouth = meshOf(new T.TorusGeometry(0.055, 0.012, 6, 12, Math.PI), mat(0x9a5a4a, 0.6, 0));
    mouth.position.set(0, 1.11, 0.275);
    mouth.rotation.z = smile >= 0 ? Math.PI : 0;
    mouth.castShadow = false;
    if (smile === 0) { mouth.scale.set(1, 0.2, 1); }
    g.add(mouth);

    // hair
    buildHair(g, c.hair, hairc, skin);
    g.scale.setScalar(1.0);
    g.userData.isCustomer = true;
    return g;
  }

  function buildHair(g, style, hairc, skin) {
    var m = mat(hairc, 0.85, 0);
    function cap(s) {
      var h = meshOf(new T.SphereGeometry(0.32, 20, 16, 0, Math.PI * 2, 0, Math.PI * (s || 0.56)), m);
      h.position.set(0, 1.235, -0.03); h.scale.set(1.05, 1.02, 1.04);
      g.add(h); return h;
    }
    if (style === 'bald') return;
    if (style === 'beanie') {
      var b = meshOf(new T.SphereGeometry(0.33, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(0x5b6770, 0.8, 0));
      b.position.y = 1.22; g.add(b);
      var brim = meshOf(new T.TorusGeometry(0.31, 0.05, 8, 20), mat(0x4d5860, 0.8, 0));
      brim.rotation.x = Math.PI / 2; brim.position.y = 1.12; g.add(brim);
      return;
    }
    cap(0.62);
    if (style === 'bun') {
      var bun = meshOf(new T.SphereGeometry(0.13, 14, 12), m); bun.position.set(0, 1.46, -0.04); g.add(bun);
    } else if (style === 'pony') {
      var pony = meshOf(new T.CapsuleGeometry(0.08, 0.3, 5, 10), m); pony.position.set(0, 1.12, -0.28); pony.rotation.x = 0.3; g.add(pony);
    } else if (style === 'pigtails') {
      [-0.3, 0.3].forEach(function (px) { var pt = meshOf(new T.CapsuleGeometry(0.07, 0.2, 5, 10), m); pt.position.set(px, 1.1, -0.04); g.add(pt); });
    } else if (style === 'curly') {
      for (var i = 0; i < 8; i++) { var cu = meshOf(new T.SphereGeometry(0.1, 10, 8), m); var a = i / 8 * Math.PI * 2; cu.position.set(Math.cos(a) * 0.28, 1.3 + Math.sin(a) * 0.06, Math.sin(a) * 0.22 - 0.04); g.add(cu); }
    } else if (style === 'flower') {
      var f = meshOf(new T.SphereGeometry(0.07, 10, 8), mat(COL.clay, 0.7, 0)); f.position.set(0.22, 1.34, 0.12); g.add(f);
    }
  }

  /* place / clear the active guest in the order set */
  var guestObj = null;
  function showGuest(charId, mood) {
    clearGuest();
    if (!sets.order) return;
    guestObj = buildCustomer(charId, mood);
    guestObj.position.set(0, 0, 1.05);
    guestObj.scale.setScalar(1.0);
    sets.order.add(guestObj);
  }
  function clearGuest() {
    if (guestObj && sets.order) { sets.order.remove(guestObj); disposeTree(guestObj); guestObj = null; }
  }

  function disposeTree(obj) {
    obj.traverse(function (o) { if (o.geometry) o.geometry.dispose(); });
  }

  /* ============ station framing ============ */
  var FRAMES = {
    order: { pos: [0, 1.32, 3.7], target: [0, 0.92, 0.6] },
    roast: { pos: [0, 1.5, 3.2], target: [0, 1.0, 0] },
    brew:  { pos: [0, 1.2, 2.35], target: [0, 1.06, 0.6] },
    milk:  { pos: [0, 1.74, 2.05], target: [0, 0.98, 0.55] }
  };

  function setStation(name) {
    for (var k in sets) sets[k].visible = (k === name);
    // counter base also shows for order; others get built later
    var f = FRAMES[name] || FRAMES.order;
    camRig.toPos = new T.Vector3(f.pos[0], f.pos[1], f.pos[2]);
    camRig.toTarget = new T.Vector3(f.target[0], f.target[1], f.target[2]);
    camRig.t = 0;
  }

  /* ============ raycast picking ============ */
  function pickRole(clientX, clientY) {
    if (!available()) return null;
    var r = canvas.getBoundingClientRect();
    pointer.x = ((clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((clientY - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObjects(scene.children, true);
    for (var i = 0; i < hits.length; i++) {
      if (hits[i].object.visible && hits[i].object.userData.role) return hits[i].object.userData.role;
    }
    return null;
  }

  /* ============ loop ============ */
  function resize() {
    if (!available()) return;
    var w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function render(dt) {
    if (!available()) return;
    clock += dt;
    // ease camera toward target frame
    if (camRig.t < 1) {
      camRig.t = Math.min(1, camRig.t + dt * 2.2);
      var e = camRig.t * camRig.t * (3 - 2 * camRig.t);
      camRig.pos.lerpVectors(camRig.pos, camRig.toPos, e * 0.4 + 0.1);
      camRig.target.lerpVectors(camRig.target, camRig.toTarget, e * 0.4 + 0.1);
    } else {
      camRig.pos.copy(camRig.toPos); camRig.target.copy(camRig.toTarget);
    }
    // gentle idle bob on the guest
    if (guestObj) guestObj.position.y = Math.sin(clock * 1.6) * 0.02;
    camera.position.copy(camRig.pos);
    camera.lookAt(camRig.target);
    renderer.render(scene, camera);
  }

  /* ---------- brew bar: espresso machine backdrop ---------- */
  function buildBrew() {
    var g = new T.Group();
    g.add(counterBase(COL.wood));
    // machine body
    var body = meshOf(new T.BoxGeometry(2.0, 0.85, 0.85), mat(COL.sage, 0.45, 0.15));
    body.position.set(0, 1.42, -0.15); g.add(body);
    var top = meshOf(new T.BoxGeometry(2.1, 0.12, 0.95), mat(COL.sageDk, 0.4, 0.2));
    top.position.set(0, 1.9, -0.15); g.add(top);
    // cup stack on the warming top
    for (var i = 0; i < 3; i++) {
      var cup = meshOf(new T.CylinderGeometry(0.1, 0.08, 0.12, 16), mat(COL.cream, 0.5, 0));
      cup.position.set(-0.7 + i * 0.34, 2.02, -0.15); g.add(cup);
    }
    // two group heads with portafilter handles
    [-0.45, 0.45].forEach(function (gx) {
      var head = meshOf(new T.CylinderGeometry(0.13, 0.16, 0.22, 18), mat(COL.steel, 0.3, 0.7));
      head.position.set(gx, 1.12, 0.32); g.add(head);
      var handle = meshOf(new T.CylinderGeometry(0.035, 0.035, 0.34, 10), mat(0x2e2a25, 0.5, 0.2));
      handle.rotation.z = Math.PI / 2; handle.position.set(gx + 0.28, 1.05, 0.34); g.add(handle);
      var knob = meshOf(new T.SphereGeometry(0.05, 12, 10), mat(0x2e2a25, 0.5, 0.2));
      knob.position.set(gx + 0.46, 1.05, 0.34); g.add(knob);
    });
    // steam wand
    var wand = meshOf(new T.CylinderGeometry(0.02, 0.02, 0.4, 8), mat(COL.steelDk, 0.3, 0.7));
    wand.position.set(0.92, 1.16, 0.3); wand.rotation.x = 0.3; g.add(wand);
    // two round pressure gauges
    [-0.25, 0.25].forEach(function (gx) {
      var gauge = meshOf(new T.CylinderGeometry(0.11, 0.11, 0.06, 18), mat(COL.cream, 0.4, 0.1));
      gauge.rotation.x = Math.PI / 2; gauge.position.set(gx, 1.55, 0.29); g.add(gauge);
    });
    g.add(plant(-1.7, 0.93, 0.2));

    // espresso glass on the bar (driven by the brew station's pull)
    espGlass = buildEspressoGlass();
    espGlass.position.set(0, 0.99, 0.62);
    espGlass.visible = false;
    g.add(espGlass);

    sets.brew = g; g.visible = false; scene.add(g);
  }

  /* a clear demitasse glass with espresso + crema and a subtle target ring */
  function buildEspressoGlass() {
    var grp = new T.Group();
    var H = 0.32, rTop = 0.15, rBot = 0.115;
    // glass shell (translucent)
    var glassMat = new T.MeshStandardMaterial({ color: 0xeaf0f2, roughness: 0.08, metalness: 0,
      transparent: true, opacity: 0.26, side: T.DoubleSide });
    var shell = new T.Mesh(new T.CylinderGeometry(rTop, rBot, H, 32, 1, true), glassMat);
    shell.position.y = H / 2; shell.castShadow = false; grp.add(shell);
    var base = meshOf(new T.CylinderGeometry(rBot, rBot * 0.92, 0.03, 32), glassMat);
    base.position.y = 0.015; grp.add(base);
    // liquid (espresso) — scaled in Y by fill
    var liq = new T.Mesh(new T.CylinderGeometry(rTop * 0.95, rBot * 0.95, 1, 32),
      mat(0x2a160c, 0.35, 0.05));
    liq.position.y = 0.02; liq.scale.y = 0.001; grp.add(liq);
    // crema cap
    var crema = new T.Mesh(new T.CylinderGeometry(rTop * 0.95, rTop * 0.95, 0.018, 32),
      mat(0xe6c389, 0.5, 0));
    crema.position.y = 0.02; grp.add(crema);
    // target ring — glows green when the crema reaches it
    var ringMat = new T.MeshStandardMaterial({ color: 0xb9c9b0, emissive: 0x223018, emissiveIntensity: 0.4, roughness: 0.5 });
    var ring = new T.Mesh(new T.TorusGeometry(rTop * 1.02, 0.006, 8, 32), ringMat);
    ring.rotation.x = Math.PI / 2; grp.add(ring);
    grp.userData = { liq: liq, crema: crema, ring: ring, ringMat: ringMat, H: H, base: 0.02 };
    return grp;
  }

  function showEspressoGlass() { if (espGlass) { espGlass.visible = true; setEspressoFill(0, false); } }
  function hideEspressoGlass() { if (espGlass) espGlass.visible = false; }
  function setEspressoFill(level01, inBand) {
    if (!espGlass) return;
    var u = espGlass.userData;
    var h = Math.max(0.001, Math.min(1.05, level01) * u.H);
    u.liq.scale.y = h; u.liq.position.y = u.base + h / 2;
    u.crema.position.y = u.base + h + 0.009;
    var ringY = u.base + 0.70 * u.H; // target at 70%
    u.ring.position.y = ringY;
    u.ringMat.emissive.setHex(inBand ? 0x2f8e3a : 0x223018);
    u.ringMat.emissiveIntensity = inBand ? 1.0 : 0.35;
    u.ringMat.color.setHex(inBand ? 0x7ec46e : 0xb9c9b0);
  }

  /* ---------- milk bar backdrop ---------- */
  function buildMilk() {
    var g = new T.Group();
    g.add(counterBase(COL.counter));
    // fridge at left
    var fridge = meshOf(new T.BoxGeometry(0.9, 1.7, 0.8), mat(COL.cream, 0.5, 0.1));
    fridge.position.set(-1.6, 0.85, -0.1); g.add(fridge);
    var fh = meshOf(new T.BoxGeometry(0.06, 0.4, 0.06), mat(COL.steelDk, 0.3, 0.6));
    fh.position.set(-1.18, 1.0, 0.32); g.add(fh);
    // machine flank with steam wand (focal)
    var mbody = meshOf(new T.BoxGeometry(1.0, 0.8, 0.7), mat(COL.sage, 0.45, 0.15));
    mbody.position.set(0.5, 1.4, -0.2); g.add(mbody);
    var wand = meshOf(new T.CylinderGeometry(0.025, 0.02, 0.5, 8), mat(COL.steelDk, 0.3, 0.7));
    wand.position.set(0.1, 1.15, 0.25); wand.rotation.x = 0.35; g.add(wand);
    g.add(plant(1.7, 0.93, 0.1));

    // ceramic cup on the bar (driven by the milk station)
    milkCup = buildMilkCup();
    milkCup.position.set(0, 0.99, 0.62);
    milkCup.visible = false;
    g.add(milkCup);

    sets.milk = g; g.visible = false; scene.add(g);
  }

  /* a rounded ceramic cup with a milk/crema surface + simple latte-art decal */
  function buildMilkCup() {
    var grp = new T.Group();
    var H = 0.26, rTop = 0.2, rBot = 0.14;
    var cupMat = mat(0xfdf6e6, 0.4, 0.05);
    var body = meshOf(new T.CylinderGeometry(rTop, rBot, H, 36, 1, true), cupMat);
    body.position.y = H / 2; grp.add(body);
    var base = meshOf(new T.CylinderGeometry(rBot, rBot * 0.85, 0.03, 28), cupMat);
    base.position.y = 0.015; grp.add(base);
    var handle = meshOf(new T.TorusGeometry(0.07, 0.022, 12, 20, Math.PI * 1.3), cupMat);
    handle.position.set(rTop - 0.01, H * 0.55, 0); handle.rotation.z = -0.4; grp.add(handle);
    // coffee/milk surface
    var surf = new T.Mesh(new T.CircleGeometry(rTop * 0.95, 40), mat(0xc89a6c, 0.55, 0));
    surf.rotation.x = -Math.PI / 2; surf.position.y = H * 0.94; grp.add(surf);
    // latte-art decal (a feathered leaf), hidden until poured
    var art = new T.Group();
    var artMat = mat(0xf3e6cf, 0.6, 0);
    var spine = new T.Mesh(new T.BoxGeometry(rTop * 1.3, 0.004, 0.012), artMat);
    art.add(spine);
    for (var i = -3; i <= 3; i++) {
      if (i === 0) continue;
      var frond = new T.Mesh(new T.SphereGeometry(0.022, 8, 6), artMat);
      frond.scale.set(1.6, 0.25, 0.7);
      frond.position.set(i * 0.026, 0, 0);
      art.add(frond);
    }
    art.rotation.x = -Math.PI / 2; art.position.y = H * 0.945; art.visible = false;
    grp.add(art);
    grp.userData = { surf: surf, art: art, H: H };
    return grp;
  }

  function showMilkCup() { if (milkCup) { milkCup.visible = true; setMilkCup(0, null); } }
  function hideMilkCup() { if (milkCup) milkCup.visible = false; }
  function setMilkCup(fill01, tier) {
    if (!milkCup) return;
    var u = milkCup.userData;
    u.surf.position.y = u.H * (0.55 + 0.39 * Math.min(1, fill01)); // surface rises as it fills
    u.art.position.y = u.surf.position.y + 0.002;
    u.art.visible = !!tier;
    // tier scales the leaf a touch (heart small → rosetta full)
    var s = tier === 'rosetta' ? 1 : tier === 'tulip' ? 0.82 : tier === 'heart' ? 0.6 : 0.6;
    u.art.scale.setScalar(s);
  }

  function buildAll() {
    buildCounter();
    buildBrew();
    buildMilk();
  }

  return {
    init: init, available: available, buildAll: buildAll,
    setStation: setStation, render: render, resize: resize,
    showGuest: showGuest, clearGuest: clearGuest, pickRole: pickRole,
    showEspressoGlass: showEspressoGlass, hideEspressoGlass: hideEspressoGlass, setEspressoFill: setEspressoFill,
    showMilkCup: showMilkCup, hideMilkCup: hideMilkCup, setMilkCup: setMilkCup,
    THREE: T
  };
})();
