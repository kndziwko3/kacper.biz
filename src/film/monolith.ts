/**
 * The object: 100 machined plates (one per firm in a hundred), three of them copper (the 3 in 100 micro-firms that list
 * a website in CEIDG). One InstancedMesh; every chapter is a pose (a target transform per plate) and the film blends
 * between poses with a per-plate stagger and a lifting arc so plates never slide through each other.
 *
 * Plate local axes: X = thickness, Y = height, Z = depth.
 */
import {
  AdditiveBlending,
  Color, DynamicDrawUsage, InstancedBufferAttribute, InstancedMesh, Matrix4, MeshPhysicalMaterial, Quaternion, Vector3,
  Euler,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

export const N = 100;
export const COPPER = [14, 58, 87] as const;
const T = 0.0125; // plate thickness
const GAP = 0.0008;
const PITCH = T + GAP;
const H = 2.9; // plate height
const D = 1.05; // plate depth

export interface Pose {
  p: Vector3[];
  q: Quaternion[];
  s: Vector3[];
  /** 0..1 order in which plates leave for this pose (small = first). */
  order: Float32Array;
  /** How buried each plate's -X / +X face is (1 = pressed against a neighbour, no light reaches it). */
  occ: Float32Array;
}

const v = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
const qEuler = (x: number, y: number, z: number, order: 'XYZ' | 'YXZ' = 'XYZ') => new Quaternion().setFromEuler(new Euler(x, y, z, order));
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const isCopper = (i: number) => (COPPER as readonly number[]).includes(i);

function blank(): Pose {
  return {
    p: Array.from({ length: N }, () => v()),
    q: Array.from({ length: N }, () => new Quaternion()),
    s: Array.from({ length: N }, () => v(1, 1, 1)),
    order: new Float32Array(N),
    occ: new Float32Array(N * 2),
  };
}

/** Pose 0: the monolith, a tight stack standing on the floor. */
function monolith(yaw: number): Pose {
  const P = blank();
  const turn = qEuler(0, yaw, 0);
  for (let i = 0; i < N; i++) {
    // the three copper slices stand a few millimetres proud of the block, so their edges take the key light
    const proud = isCopper(i) ? 1 : 0;
    P.p[i]!.set((i - (N - 1) / 2) * PITCH, H / 2 + proud * 0.06, proud * 0.022).applyQuaternion(turn);
    P.q[i]!.copy(turn);
    P.order[i] = Math.abs(i - (N - 1) / 2) / ((N - 1) / 2);
    P.occ[i * 2] = i > 0 ? 1 : 0;
    P.occ[i * 2 + 1] = i < N - 1 ? 1 : 0;
  }
  return P;
}

/** Pose 1: the fan. Every plate pivots on a shared spine at the back edge, like a book opened into a rotunda; the three
 *  copper plates slide out of it and rise. */
function fan(yaw: number): Pose {
  const P = blank();
  const turn = qEuler(0, yaw, 0);
  const spine = v(0, 0, -0.1);
  for (let i = 0; i < N; i++) {
    const a = ((i / (N - 1)) - 0.5) * 2 * (82 * Math.PI / 180);
    const q = qEuler(0, a, 0);
    const out = isCopper(i) ? 0.1 : 0;
    const lift = isCopper(i) ? 0.5 : 0;
    const local = v(0, H / 2 + lift, D / 2 + 0.02 + out).applyQuaternion(q).add(spine);
    P.p[i]!.copy(local.applyQuaternion(turn));
    P.q[i]!.copy(turn).multiply(q);
    P.order[i] = i / (N - 1);
    P.occ[i * 2] = i > 0 ? 0.45 : 0;
    P.occ[i * 2 + 1] = i < N - 1 ? 0.45 : 0;
  }
  return P;
}

/** Pose 2: the register. Plates stand in a long drawer like index cards, receding away from the viewer. */
function register(): Pose {
  const P = blank();
  const along = qEuler(0, Math.PI / 2, 0); // plate thickness along the row (world Z)
  const lean = qEuler(-0.14, 0, 0);
  const sp = 0.075;
  for (let i = 0; i < N; i++) {
    const z = 1.6 - i * sp;
    P.p[i]!.set(0, H / 2 - 0.35, z);
    P.q[i]!.copy(lean).multiply(along);
    P.s[i]!.set(1, 0.78, 1.25);
    P.order[i] = i / (N - 1);
    P.occ[i * 2] = i > 0 ? 0.3 : 0;
    P.occ[i * 2 + 1] = i < N - 1 ? 0.3 : 0;
  }
  return P;
}

interface Block { u: number; v: number; w: number; h: number; layer: number; copper?: boolean }

/** Pose 3: the page. Plates turn face-on and resize into the blocks of a landing page, exploded into layers; the
 *  plates the page does not need stack flat into the plinth it stands on. */
function page(): Pose {
  const P = blank();
  const blocks: Block[] = [
    { u: 0, v: 0, w: 3.4, h: 4.4, layer: 0 },
    { u: 0, v: 2.0, w: 3.1, h: 0.16, layer: 1 },
    { u: -1.33, v: 2.0, w: 0.34, h: 0.1, layer: 2 },
    { u: 0.42, v: 2.0, w: 0.22, h: 0.05, layer: 2 }, { u: 0.74, v: 2.0, w: 0.22, h: 0.05, layer: 2 },
    { u: 1.06, v: 2.0, w: 0.22, h: 0.05, layer: 2 }, { u: 1.36, v: 2.0, w: 0.22, h: 0.07, layer: 2 },
    { u: -0.5, v: 1.48, w: 2.0, h: 0.2, layer: 2 }, { u: -0.72, v: 1.2, w: 1.56, h: 0.2, layer: 2 },
    { u: -0.66, v: 0.94, w: 1.68, h: 0.055, layer: 2 }, { u: -0.82, v: 0.83, w: 1.36, h: 0.055, layer: 2 },
    { u: -1.16, v: 0.56, w: 0.68, h: 0.2, layer: 2, copper: true },
    { u: 0.96, v: 1.06, w: 1.18, h: 1.1, layer: 1 }, { u: 0.96, v: 1.06, w: 0.56, h: 0.52, layer: 2 },
    { u: 0, v: -0.08, w: 3.1, h: 0.94, layer: 1 },
    { u: -1.02, v: -0.08, w: 0.88, h: 0.74, layer: 2 }, { u: 0, v: -0.08, w: 0.88, h: 0.74, layer: 2 }, { u: 1.02, v: -0.08, w: 0.88, h: 0.74, layer: 2 },
    { u: -1.02, v: 0.1, w: 0.6, h: 0.055, layer: 3 }, { u: -1.08, v: -0.02, w: 0.48, h: 0.045, layer: 3 },
    { u: 0, v: 0.1, w: 0.6, h: 0.055, layer: 3 }, { u: -0.06, v: -0.02, w: 0.48, h: 0.045, layer: 3 },
    { u: 1.02, v: 0.1, w: 0.6, h: 0.055, layer: 3 }, { u: 0.96, v: -0.02, w: 0.48, h: 0.045, layer: 3 },
    { u: -1.0, v: -0.8, w: 0.52, h: 0.16, layer: 2 }, { u: 0, v: -0.8, w: 0.52, h: 0.16, layer: 2, copper: true }, { u: 1.0, v: -0.8, w: 0.52, h: 0.16, layer: 2 },
    { u: 0, v: -1.3, w: 3.1, h: 0.5, layer: 1 },
    { u: 0, v: -1.24, w: 2.0, h: 0.055, layer: 2 }, { u: 0, v: -1.36, w: 1.6, h: 0.055, layer: 2 },
    { u: 0, v: -1.8, w: 3.1, h: 0.36, layer: 1 },
    { u: -0.62, v: -1.8, w: 1.4, h: 0.08, layer: 2 }, { u: 0.92, v: -1.8, w: 0.62, h: 0.16, layer: 2, copper: true },
    { u: 0, v: -2.1, w: 3.1, h: 0.12, layer: 1 },
  ];
  const copperIdx = [...COPPER];
  const plain = Array.from({ length: N }, (_, i) => i).filter((i) => !isCopper(i));
  const used = new Set<number>();
  const assign: Array<{ i: number; b: Block }> = [];
  for (const b of [...blocks].sort((x, y) => y.v - x.v || x.u - y.u)) {
    const i = b.copper ? copperIdx.shift()! : plain.shift()!;
    used.add(i);
    assign.push({ i, b });
  }

  // leftovers: a flat ream (the plinth the page stands on), turned with the page
  const YAW = 0.95;
  const flat = qEuler(0, YAW, Math.PI / 2, 'YXZ'); // thickness axis -> world up
  const layerT = T + 0.0012;
  let k = 0;
  for (let i = 0; i < N; i++) {
    if (used.has(i)) continue;
    P.p[i]!.set(0.1, T / 2 + k * layerT, 0);
    P.q[i]!.copy(flat);
    P.s[i]!.set(1, 1.25, 2.1);
    P.order[i] = 0.55 + 0.45 * (k / (N - assign.length));
    P.occ[i * 2] = k > 0 ? 1 : 0;
    P.occ[i * 2 + 1] = 1;
    k++;
  }
  const plinthTop = k * layerT;

  // the page: its own frame (x right, y up, z toward the viewer), leaning back, turned toward the key light
  const LEAN = -0.14;
  const pageRot = qEuler(LEAN, YAW, 0, 'YXZ');
  const faceOn = qEuler(0, -Math.PI / 2, 0); // plate thickness -> page normal, plate depth -> page width
  const plateQ = pageRot.clone().multiply(faceOn);
  const centre = v(0.1, plinthTop + 2.2 * Math.cos(LEAN) + 0.04, 0.2);
  for (const { i, b } of assign) {
    P.p[i]!.set(b.u, b.v, 0.02 + b.layer * 0.58).applyQuaternion(pageRot).add(centre);
    P.q[i]!.copy(plateQ);
    P.s[i]!.set(b.layer === 0 ? 2.2 : 1.4, b.h / H, b.w / D);
    P.order[i] = 0.5 * (1 - (b.v + 2.2) / 4.4);
  }
  return P;
}

export interface Monolith {
  mesh: InstancedMesh;
  reflection: InstancedMesh;
  poses: Pose[];
  /** Blend pose a -> b at t (0..1), with `local` the in-chapter progress for per-chapter motion. */
  apply(a: number, b: number, t: number, local: number, time: number): void;
  /** Device pixels per output pixel (the supersample factor for stills). */
  setPxScale(v: number): void;
  dispose(): void;
}

export function buildMonolith(shadows: boolean): Monolith {
  const geo = new RoundedBoxGeometry(T, H, D, 5, T * 0.16);
  const mat = new MeshPhysicalMaterial({
    color: '#ffffff', metalness: 1, roughness: 0.28, envMapIntensity: 1.25,
  });
  const mesh = new InstancedMesh(geo, mat, N);
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  mesh.castShadow = shadows;
  // plates cast the contact shadow but never receive one: self-shadowing on 12 mm slices is all acne, no form
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;
  // anodized aluminium, a warm space grey; polished copper
  const steel = new Color('#8f8b84');
  const copper = new Color('#c8703f');
  for (let i = 0; i < N; i++) mesh.setColorAt(i, isCopper(i) ? copper : steel);
  // per-plate roughness nudge so the block reads as machined parts, not one extrusion
  const rough = new Float32Array(N);
  for (let i = 0; i < N; i++) rough[i] = (Math.sin(i * 12.9898) * 43758.5453) % 1;
  geo.setAttribute('aRough', new InstancedBufferAttribute(rough.map((r) => Math.abs(r)), 1));
  const occ = new InstancedBufferAttribute(new Float32Array(N * 2), 2);
  occ.setUsage(DynamicDrawUsage);
  geo.setAttribute('aOcc', occ);
  const VARY = 'varying float vRough;\nvarying vec2 vOcc;\nvarying vec3 vLocalN;\nvarying float vWorldY;\nvarying vec3 vWorldP;\nvarying vec3 vAx;\nvarying vec3 vAy;\nvarying vec3 vAz;\n';
  // device pixels per output pixel: 1 live, the supersample factor when a still is rendered large and downsampled
  const pxScale = { value: 1 };
  const patch = (reflection: boolean) => (s: { vertexShader: string; fragmentShader: string; uniforms: Record<string, { value: unknown }> }) => {
    s.uniforms.uPxScale = pxScale;
    s.vertexShader = 'attribute float aRough;\nattribute vec2 aOcc;\n' + VARY + s.vertexShader
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n vLocalN = objectNormal;\n mat3 plIm = normalMatrix * mat3(instanceMatrix);\n vAx = normalize(plIm * vec3(1.0, 0.0, 0.0)); vAy = normalize(plIm * vec3(0.0, 1.0, 0.0)); vAz = normalize(plIm * vec3(0.0, 0.0, 1.0));')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n vRough = aRough; vOcc = aOcc;')
      .replace('#include <project_vertex>', '#include <project_vertex>\n vWorldP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz; vWorldY = vWorldP.y;');
    s.fragmentShader = 'uniform float uPxScale;\n' + VARY + s.fragmentShader
      .replace(
        '#include <roughnessmap_fragment>',
        '#include <roughnessmap_fragment>\n roughnessFactor = clamp(roughnessFactor + (vRough - 0.5) * 0.015, 0.05, 1.0);',
      )
      .replace(
        '#include <normal_fragment_maps>',
        // where one plate is only a few pixels wide its rounded chamfers would alias into a moire: flatten the
        // shading normal toward the face it belongs to, so the stack reads as a clean block at a distance
        '#include <normal_fragment_maps>\n'
        + ` float pitchPx = ${PITCH.toFixed(5)} / max(length(fwidth(vWorldP)) * uPxScale, 1e-5);\n`
        + ' vec3 la = abs(vLocalN);\n'
        // a face pressed against a neighbour (and its chamfer) takes the stack face's normal, never its own
        + ' float pressed = step(0.0, -vLocalN.x) * vOcc.x + step(0.0, vLocalN.x) * vOcc.y;\n'
        // (a pressed face seen down the slot takes whichever stack face looks at the camera)
        + ' vec3 V = normalize(vViewPosition);\n'
        + ' float fy = dot(vAy, V), fz = dot(vAz, V);\n'
        + ' vec3 faceN = abs(fy) > abs(fz) ? sign(fy) * vAy : sign(fz) * vAz;\n'
        + ' bool xDom = la.x > la.y && la.x > la.z;\n'
        + ' vec3 flatN = xDom ? (pressed < 0.4 ? sign(vLocalN.x) * vAx : faceN) : (la.y > la.z ? sign(vLocalN.y) * vAy : sign(vLocalN.z) * vAz);\n'
        // the block's own outer corners keep their rounded chamfer: that is where the strip light glints
        + ' float outer = step(0.2, -vLocalN.x) * (1.0 - vOcc.x) + step(0.2, vLocalN.x) * (1.0 - vOcc.y);\n'
        // (three's specular anti-aliasing reads nonPerturbedNormal, so it has to agree)
        + (reflection ? '' : ' normal = normalize(mix(normal, flatN * faceDirection, (1.0 - smoothstep(1.6, 3.0, pitchPx)) * (1.0 - clamp(outer, 0.0, 1.0))));\n nonPerturbedNormal = normal;\n'),
      )
      .replace(
        '#include <opaque_fragment>',
        // faces pressed against a neighbour get no light: the stack reads as machined slices with bright edges
        // (a slice narrower than a few pixels would alias into a moire, so the gaps fade out with distance)
        ' float occN = smoothstep(0.5, 0.92, -vLocalN.x) * vOcc.x + smoothstep(0.5, 0.92, vLocalN.x) * vOcc.y;\n'
        + ' outgoingLight *= 1.0 - 0.94 * occN * smoothstep(1.6, 3.0, pitchPx);\n'
        + (reflection ? ' diffuseColor.a *= 0.09 * exp(vWorldY * 2.4);\n' : '')
        + '#include <opaque_fragment>',
      );
  };
  mat.onBeforeCompile = patch(false);
  mat.customProgramCacheKey = () => 'plate';
  // the satin floor's reflection: the same plates, mirrored below the floor, fading with depth
  const refMat = mat.clone();
  refMat.transparent = true;
  refMat.depthWrite = false;
  refMat.depthTest = false;
  // the floor only ever adds light: dark faces vanish into it, the copper and the strip highlights mirror softly
  refMat.blending = AdditiveBlending;
  refMat.onBeforeCompile = patch(true);
  refMat.customProgramCacheKey = () => 'plate-reflection';
  const reflection = new InstancedMesh(geo, refMat, N);
  reflection.instanceMatrix = mesh.instanceMatrix;
  reflection.instanceColor = mesh.instanceColor;
  reflection.frustumCulled = false;
  reflection.scale.y = -1;
  reflection.renderOrder = 1;
  mesh.renderOrder = 2;

  // the opening monolith shows its sliced face to the camera: 100 edges, three of them copper
  const poses = [monolith(0.05), fan(-0.2), register(), page(), monolith(0.35)];

  const m4 = new Matrix4();
  const pp = v(), qq = new Quaternion(), ss = v();
  const tmpQ = new Quaternion();

  const apply = (a: number, b: number, t: number, local: number, time: number): void => {
    const A = poses[a]!, B = poses[b]!;
    const stagger = a === b ? 0 : 0.42;
    for (let i = 0; i < N; i++) {
      const d = stagger * B.order[i]!;
      const lt = Math.min(1, Math.max(0, (t - d) / Math.max(1 - stagger, 1e-3)));
      const e = lt * lt * lt * (lt * (lt * 6 - 15) + 10);
      pp.lerpVectors(A.p[i]!, B.p[i]!, e);
      // lifting arc so plates clear each other while they travel
      pp.y += Math.sin(Math.PI * e) * (0.35 + 0.5 * B.order[i]!) * (a === b ? 0 : 1);
      qq.slerpQuaternions(A.q[i]!, B.q[i]!, e);
      ss.lerpVectors(A.s[i]!, B.s[i]!, e);

      // in-chapter motion on the pose we are resting in
      const w = a === b ? 1 : e;
      const pose = a === b ? a : b;
      if (pose === 0 || pose === 4) {
        // the monolith breathes: a hair of separation travels up the stack
        const wave = Math.sin(time * 0.6 - i * 0.09) * 0.0012 * w;
        pp.y += wave;
      } else if (pose === 1) {
        // copper plates keep rising slowly while the chapter holds
        if (isCopper(i)) pp.y += local * 0.12 * w;
      } else if (pose === 2) {
        // a reader flicks through the drawer: a wave of plates tips forward as the scan passes
        const scan = local * (N + 20) - 10;
        const k = Math.exp(-((i - scan) * (i - scan)) / 18);
        const kept = isCopper(i) && i < scan ? 1 : 0;
        tmpQ.setFromEuler(new Euler(-0.55 * k * w - 0.3 * kept * w, 0, 0));
        qq.multiply(tmpQ);
        pp.y += (0.18 * k + 0.42 * kept) * w;
      } else if (pose === 3) {
        // layers drift apart a little more while the chapter holds (the exploded view opens)
        pp.y += 0;
      }
      m4.compose(pp, qq, ss);
      mesh.setMatrixAt(i, m4);
      occ.setXY(i, A.occ[i * 2]! + (B.occ[i * 2]! - A.occ[i * 2]!) * e, A.occ[i * 2 + 1]! + (B.occ[i * 2 + 1]! - A.occ[i * 2 + 1]!) * e);
    }
    mesh.instanceMatrix.needsUpdate = true;
    occ.needsUpdate = true;
  };

  apply(0, 0, 0, 0, 0);
  return {
    mesh, reflection, poses, apply,
    setPxScale(v: number): void { pxScale.value = v; },
    dispose(): void { geo.dispose(); mat.dispose(); refMat.dispose(); mesh.dispose(); },
  };
}

export { smooth };
