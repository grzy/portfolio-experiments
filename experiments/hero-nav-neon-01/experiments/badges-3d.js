// ── 3D INTERACTIVE BADGES (Rapier port) ─────────────────────
// Direct vanilla port of the React + react-three-fiber + rapier
// Badge3D component: same gravity, same damping, same rope joints,
// same spherical joint, same Vercel tag.glb model. Cycles between
// the Figma Campus Leader badge and the master's-degree badge.

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'
import RAPIER from '@dimforge/rapier3d-compat'

// rapier3d-compat ships its WASM inline; init() resolves once it's ready
await RAPIER.init()

const stage = document.getElementById('badgeStage')
const hint = document.getElementById('badgeHint')
if (stage) initBadges(stage)

function initBadges(host) {
  // three badges in order: ARTU (red), Figma CL (pink), agentic-coding (green)
  const BADGES = [
    { front: '/images/experiments/badge-artu.png',  back: '/images/experiments/badge-artu-back.png',  label: "Master's in Interaction Design" },
    { front: '/images/experiments/badge-figma.png', back: '/images/experiments/badge-figma-back.png', label: 'Figma Campus Leader' },
    { front: '/images/experiments/badge-mem.png',   back: '/images/experiments/badge-mem-back.png',   label: 'Agentic Coding Boot Camp' },
  ]
  const TAG_GLB = 'https://assets.vercel.com/image/upload/contentful/image/e5382hct74si/5huRVDzcoDwnbgrKUo1Lzs/53b6dd7d6b4ffcdbd338fa60265949e1/tag.glb'

  // ── Three.js scene ──────────────────────────────────────────
  const scene = new THREE.Scene()
  scene.background = null

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1
  host.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 100)
  camera.position.set(0, 0, 13)

  // ambient + an Environment built from the same LIGHTFORMER_CONFIG the
  // React version uses. Lightformers are thin emissive strips that show
  // up as bright streaks in the metal clip + clearcoat reflections —
  // that's what makes the badge read like a real card instead of flat.
  scene.add(new THREE.AmbientLight(0xffffff, Math.PI))

  const envScene = new THREE.Scene()
  envScene.add(new THREE.AmbientLight(0xffffff, 0.5))
  const LIGHTFORMERS = [
    { color: 0xffffff, intensity: 4,   position: [-8, 3, 8],   rotation: [0, Math.PI/4, Math.PI/6],  scale: [100, 0.1, 1] },
    { color: 0xffffff, intensity: 4,   position: [8, 3, 8],    rotation: [0, -Math.PI/4, -Math.PI/6], scale: [100, 0.1, 1] },
    { color: 0x333333, intensity: 1.5, position: [0, -5, 0],   rotation: [0, 0, 0],                  scale: [100, 0.1, 1] },
    { color: 0xffffff, intensity: 8,   position: [-10, 5, 14], rotation: [0, Math.PI/2, Math.PI/3],  scale: [100, 10, 1] },
  ]
  for (const lf of LIGHTFORMERS) {
    const mat = new THREE.MeshBasicMaterial({ color: lf.color, side: THREE.DoubleSide })
    mat.color.multiplyScalar(lf.intensity)
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat)
    m.position.set(...lf.position)
    m.rotation.set(...lf.rotation)
    m.scale.set(...lf.scale)
    envScene.add(m)
  }
  // gentle room fill so unlit faces aren't pitch black
  envScene.add((() => {
    const room = new THREE.Mesh(
      new THREE.SphereGeometry(50, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.BackSide })
    )
    return room
  })())

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(envScene, 0.04).texture

  // ── Rapier physics world ────────────────────────────────────
  // gravity = [0, -40, 0] matches PHYSICS_CONFIG in the React version.
  const world = new RAPIER.World({ x: 0, y: -40, z: 0 })

  // anchor height — pulled back down so the whole assembly sits lower
  // in the canvas (React used 4; we go a touch lower)
  const ROOT_Y = 3.6

  // SEGMENT_PROPS in the React version: dynamic, canSleep: true,
  // angularDamping: 2, linearDamping: 2.
  const segDamping = (desc) => desc
    .setLinearDamping(2)
    .setAngularDamping(2)
    .setCanSleep(true)

  function makeSegment(x) {
    const desc = segDamping(RAPIER.RigidBodyDesc.dynamic().setTranslation(x, ROOT_Y, 0))
    const body = world.createRigidBody(desc)
    world.createCollider(RAPIER.ColliderDesc.ball(0.1), body)
    return body
  }

  const fixed = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(0, ROOT_Y, 0)
  )
  const j1 = makeSegment(0.5)
  const j2 = makeSegment(1.0)
  const j3 = makeSegment(1.5)
  const card = world.createRigidBody(
    segDamping(RAPIER.RigidBodyDesc.dynamic().setTranslation(2, ROOT_Y, 0))
  )
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.8, 1.125, 0.01), card)

  // joints — rope segments shortened from 1 → 0.8 so the lanyard's
  // middle doesn't sag as low / look so long.
  const ropeData = (length) => RAPIER.JointData.rope(
    length,
    { x: 0, y: 0, z: 0 },
    { x: 0, y: 0, z: 0 }
  )
  world.createImpulseJoint(ropeData(0.8), fixed, j1, true)
  world.createImpulseJoint(ropeData(0.8), j1, j2, true)
  world.createImpulseJoint(ropeData(0.8), j2, j3, true)
  world.createImpulseJoint(
    RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: 0, y: 1.45, z: 0 }),
    j3, card, true
  )

  // ── card meshes (loaded async from Vercel's tag.glb) ────────
  const cardGroup = new THREE.Group()
  scene.add(cardGroup)

  // texture loading w/ a load counter so we know when every face is
  // ready. once that + the GLTF are both loaded, we run a quick
  // auto-cycle through the badges so each texture gets uploaded to
  // the GPU during page load — eliminates the frame hitch the user
  // would otherwise see the first time they click to cycle.
  const TOTAL_TEXTURES = BADGES.length * 2
  let texturesLoaded = 0
  let gltfReady = false

  const texLoader = new THREE.TextureLoader()
  const fronts = BADGES.map((b) => loadTex(b.front))
  const backs = BADGES.map((b) => loadTex(b.back))
  function loadTex(url) {
    const t = texLoader.load(url, () => {
      texturesLoaded++
      renderer.render(scene, camera)
      maybeStartAutoCycle()
    })
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 16
    return t
  }

  let autoCycleStarted = false
  function maybeStartAutoCycle() {
    if (autoCycleStarted) return
    if (!gltfReady) return
    if (texturesLoaded < TOTAL_TEXTURES) return
    autoCycleStarted = true
    // cycle 0 → 1 → 2 → 0 (back to ARTU red, the intended starting
    // badge). 800ms between switches gives the GPU time to upload
    // each texture during a real frame paint.
    const sequence = [1, 2, 0]
    let idx = 0
    function next() {
      if (idx < sequence.length) {
        setBadge(sequence[idx])
        idx++
        setTimeout(next, 800)
      }
    }
    setTimeout(next, 700)
  }

  let currentBadge = 0
  let frontMat, backMat, cardMesh

  new GLTFLoader().load(TAG_GLB, (gltf) => {
    const cardGeo = gltf.scene.getObjectByName('card').geometry
    const clipGeo = gltf.scene.getObjectByName('clip').geometry
    const clampGeo = gltf.scene.getObjectByName('clamp').geometry
    const metalMat = gltf.scene.getObjectByName('clip').material

    frontMat = new THREE.MeshPhysicalMaterial({
      map: fronts[currentBadge],
      clearcoat: 1, clearcoatRoughness: 0.15, roughness: 0.3, metalness: 0.5,
    })
    backMat = new THREE.MeshPhysicalMaterial({
      map: backs[currentBadge],
      clearcoat: 1, clearcoatRoughness: 0.15, roughness: 0.3, metalness: 0.5,
    })

    // matches the React inner group: scale 2.25, position [0, -1.2, -0.05]
    const cardCore = new THREE.Group()
    cardCore.scale.setScalar(2.25)
    cardCore.position.set(0, -1.2, -0.05)

    cardMesh = new THREE.Mesh(cardGeo, frontMat)
    cardCore.add(cardMesh)

    const backMesh = new THREE.Mesh(cardGeo, backMat)
    backMesh.position.z = -0.02
    backMesh.scale.set(1, 1, -1)
    cardCore.add(backMesh)

    cardCore.add(new THREE.Mesh(clipGeo, metalMat))
    cardCore.add(new THREE.Mesh(clampGeo, metalMat))

    cardGroup.add(cardCore)

    if (hint) hint.classList.add('exp-badges__hint--ready')
    gltfReady = true
    maybeStartAutoCycle()
  })

  function setBadge(idx) {
    currentBadge = (idx + BADGES.length) % BADGES.length
    if (frontMat) { frontMat.map = fronts[currentBadge]; frontMat.needsUpdate = true }
    if (backMat) { backMat.map = backs[currentBadge]; backMat.needsUpdate = true }
  }

  // ── lanyard (real fabric-thick black strap) ─────────────────
  // meshline in the React version defaults to world-unit width, which
  // gives a thick lanyard. Line2 + worldUnits:true reproduces that.
  const bandSegments = 32
  const lineGeo = new LineGeometry()
  lineGeo.setPositions(new Float32Array((bandSegments + 1) * 3))
  const lineMat = new LineMaterial({
    color: 0x111111,
    linewidth: 0.24,
    worldUnits: true,
    transparent: true,
    // depthTest on so the card + clip + clamp meshes (which DO write
    // depth) occlude the band wherever they're closer to the camera.
    // render the band last so the depth buffer is fully populated by
    // opaque card geometry first.
    depthTest: true,
    depthWrite: false,
  })
  lineMat.resolution.set(host.clientWidth, host.clientHeight)
  const band = new Line2(lineGeo, lineMat)
  band.renderOrder = 999
  scene.add(band)

  // catmull curve through fixed → j1lerp → j2lerp → j3 (matches React)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
  ])
  curve.curveType = 'chordal'

  // ── pointer / drag interaction ──────────────────────────────
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const dragStartNdc = new THREE.Vector2()
  const dragOffset = new THREE.Vector3()
  const pointerWorld = new THREE.Vector3()
  const tmpVec = new THREE.Vector3()
  let dragging = false
  let dragMoved = false
  // drag plane is camera-facing through the card's current position
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

  function pointerToWorld(e, target) {
    const rect = renderer.domElement.getBoundingClientRect()
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(ndc, camera)
    raycaster.ray.intersectPlane(dragPlane, target)
  }

  let pointerDownInStage = false
  function onPointerDown(e) {
    if (!cardMesh) return
    pointerToWorld(e, pointerWorld)
    raycaster.setFromCamera(ndc, camera)
    const hits = raycaster.intersectObject(cardGroup, true)
    e.preventDefault()
    renderer.domElement.setPointerCapture(e.pointerId)
    pointerDownInStage = true
    dragStartNdc.set(ndc.x, ndc.y)
    dragMoved = false
    if (hits.length) {
      // drag begins — the click hit the card
      const t = card.translation()
      tmpVec.set(t.x, t.y, t.z)
      dragPlane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(new THREE.Vector3()).negate(),
        tmpVec
      )
      pointerToWorld(e, pointerWorld)
      dragOffset.copy(pointerWorld).sub(tmpVec)
      dragging = true
      document.body.style.cursor = 'grabbing'
      card.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true)
    }
  }
  function onPointerMove(e) {
    if (!pointerDownInStage) return
    if (dragging) pointerToWorld(e, pointerWorld)
    // recompute ndc relative to the canvas for the threshold check
    const rect = renderer.domElement.getBoundingClientRect()
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1
    if (Math.hypot(nx - dragStartNdc.x, ny - dragStartNdc.y) > 0.02) {
      dragMoved = true
    }
  }
  function onPointerUp(e) {
    if (!pointerDownInStage) return
    pointerDownInStage = false
    if (renderer.domElement.hasPointerCapture(e.pointerId)) {
      renderer.domElement.releasePointerCapture(e.pointerId)
    }
    if (dragging) {
      dragging = false
      card.setBodyType(RAPIER.RigidBodyType.Dynamic, true)
      document.body.style.cursor = ''
    }
    // any clean click in the stage (whether on the card or empty
    // canvas around it) cycles to the next badge
    if (!dragMoved) setBadge(currentBadge + 1)
  }
  function onPointerOver() { if (!dragging) document.body.style.cursor = 'grab' }
  function onPointerOut() { if (!dragging) document.body.style.cursor = '' }

  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  renderer.domElement.addEventListener('pointerover', onPointerOver)
  renderer.domElement.addEventListener('pointerout', onPointerOut)

  // page-level click cycling — anywhere outside an interactive element
  // (links, buttons, the canvas itself, video controls) cycles too.
  document.addEventListener('click', (e) => {
    if (e.target.closest('#badgeStage')) return // canvas already handled
    if (e.target.closest('a, button, input, textarea, select, video, [data-hover], [data-us-project]')) return
    setBadge(currentBadge + 1)
  })

  // ── resize ──────────────────────────────────────────────────
  function resize() {
    const w = host.clientWidth, h = host.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    lineMat.resolution.set(w, h)
  }
  resize()
  new ResizeObserver(resize).observe(host)

  // ── frame loop ──────────────────────────────────────────────
  // mirrors useFrame in the React component:
  //   - on drag, write kinematic translation
  //   - wakeUp all bodies
  //   - lerp j1 + j2 positions to kill jitter
  //   - rebuild catmull curve
  //   - apply tilt-back angular velocity correction
  let last = performance.now()
  const lerpedJ1 = new THREE.Vector3()
  const lerpedJ2 = new THREE.Vector3()
  let lerpReady = false
  const minSpeed = 10, maxSpeed = 50

  // band tip sits exactly at the spherical-joint anchor on the card
  // (card-local 0, 1.45, 0) — same as React's j3.translation(). this
  // is the position the bail loops around, so the lanyard meets it
  // physically. depth testing handles which side gets occluded.
  const BAND_TIP_LOCAL = new THREE.Vector3(0, 1.45, 0)
  const bandTipWorld = new THREE.Vector3()
  const cardQuatHelper = new THREE.Quaternion()
  const cardPosHelper = new THREE.Vector3()

  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000)
    last = now

    // drag → set kinematic position
    if (dragging) {
      card.setNextKinematicTranslation({
        x: pointerWorld.x - dragOffset.x,
        y: pointerWorld.y - dragOffset.y,
        z: pointerWorld.z - dragOffset.z,
      })
    }

    // wake everyone — keeps the chain from sleeping
    ;[card, j1, j2, j3, fixed].forEach((b) => b.wakeUp())

    world.timestep = 1 / 60
    world.step()

    // pull positions
    const t1 = j1.translation(), t2 = j2.translation(), t3 = j3.translation()
    const tF = fixed.translation(), tC = card.translation()

    if (!lerpReady) {
      lerpedJ1.set(t1.x, t1.y, t1.z)
      lerpedJ2.set(t2.x, t2.y, t2.z)
      lerpReady = true
    }
    // jitter-killing lerp on j1, j2 (matches React lerped logic)
    {
      tmpVec.set(t1.x, t1.y, t1.z)
      const cd = Math.max(0.1, Math.min(1, lerpedJ1.distanceTo(tmpVec)))
      lerpedJ1.lerp(tmpVec, dt * (minSpeed + cd * (maxSpeed - minSpeed)))
    }
    {
      tmpVec.set(t2.x, t2.y, t2.z)
      const cd = Math.max(0.1, Math.min(1, lerpedJ2.distanceTo(tmpVec)))
      lerpedJ2.lerp(tmpVec, dt * (minSpeed + cd * (maxSpeed - minSpeed)))
    }

    // catmull through bandTip → j2lerp → j1lerp → fixed.
    // bandTip = card local (0, 1.45, -0.4) in world, so the band
    // ends BEHIND the clip + clamp + bail hardware in 3D space.
    const rotQ = card.rotation()
    cardQuatHelper.set(rotQ.x, rotQ.y, rotQ.z, rotQ.w)
    cardPosHelper.set(tC.x, tC.y, tC.z)
    bandTipWorld.copy(BAND_TIP_LOCAL).applyQuaternion(cardQuatHelper).add(cardPosHelper)
    curve.points[0].copy(bandTipWorld)
    curve.points[1].copy(lerpedJ2)
    curve.points[2].copy(lerpedJ1)
    curve.points[3].set(tF.x, tF.y, tF.z)
    const samples = curve.getPoints(bandSegments)
    const flat = new Float32Array((bandSegments + 1) * 3)
    for (let i = 0; i < samples.length; i++) {
      flat[i * 3] = samples[i].x
      flat[i * 3 + 1] = samples[i].y
      flat[i * 3 + 2] = samples[i].z
    }
    lineGeo.setPositions(flat)

    // tilt-back correction:
    // setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    if (!dragging) {
      const ang = card.angvel()
      const rot = card.rotation() // quaternion {x,y,z,w}
      card.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z }, true)
    }

    // sync mesh transform from rapier
    cardGroup.position.set(tC.x, tC.y, tC.z)
    const rC = card.rotation()
    cardGroup.quaternion.set(rC.x, rC.y, rC.z, rC.w)

    renderer.render(scene, camera)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}
