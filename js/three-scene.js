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
    brew:  { pos: [0, 1.45, 3.0], target: [0, 1.0, 0] },
    milk:  { pos: [0, 1.45, 3.0], target: [0, 1.0, 0] }
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

  function buildAll() {
    buildCounter();
  }

  return {
    init: init, available: available, buildAll: buildAll,
    setStation: setStation, render: render, resize: resize,
    showGuest: showGuest, clearGuest: clearGuest, pickRole: pickRole,
    THREE: T
  };
})();
