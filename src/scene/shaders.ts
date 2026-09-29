/**
 * GLSL for the four draw calls:
 *   1. MAIN    - the morphing point world (six chapter targets as vertex attributes)
 *   2. GLOW    - a handful of big soft halos (Gliwice + cities)
 *   3. TRAFFIC - packets, trails and arc traces (all motion is computed from uTime in the vertex shader)
 *   4. RIPPLE  - expanding rings of dots at destinations
 *
 * All output is premultiplied light. The material uses "screen" blending (ONE, ONE_MINUS_SRC_COLOR), so
 * overlapping points saturate softly instead of clipping, and the framebuffer alpha is always a valid
 * premultiplied alpha (>= every colour channel) for compositing over the page background.
 */

const COMMON = /* glsl */ `
const float PI = 3.14159265;

vec3 curl(vec3 p) {
  return vec3(
    sin(p.y * 1.31 + 1.7) * cos(p.z * 1.13) - sin(p.z * 1.93 + 0.3) * cos(p.y * 0.83),
    sin(p.z * 1.21 + 0.9) * cos(p.x * 1.41) - sin(p.x * 1.71 + 2.1) * cos(p.z * 0.91),
    sin(p.x * 1.11 + 2.6) * cos(p.y * 1.31) - sin(p.y * 1.83 + 1.2) * cos(p.x * 0.71));
}
vec3 rotY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}
vec3 rodrigues(vec3 v, vec3 k, float a) {
  float c = cos(a), s = sin(a);
  return v * c + cross(k, v) * s + k * dot(k, v) * (1.0 - c);
}
`;

/**
 * Shared round-sprite fragment. The profile is deliberately flat-topped: 2-3px sprites only ever sample it
 * around d ~ 0.5-0.7, so a sharp core would leave them nearly black.
 */
export const SPRITE_FRAG = /* glsl */ `
varying vec3 vCol;
varying float vA;
void main() {
  vec2 q = gl_PointCoord - 0.5;
  float d = length(q) * 2.0;
  if (d >= 1.0) discard;
  float body = pow(1.0 - d * d, 1.4);
  float core = smoothstep(0.42, 0.0, d);
  float I = (0.72 * body + 0.4 * core) * vA;
  vec3 c = min(vCol * I, vec3(0.97));
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
}
`;

/** Wide gaussian used by the cheap "bloom" layer (same points, drawn bigger and dimmer). */
export const BLOOM_FRAG = /* glsl */ `
varying vec3 vCol;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d >= 1.0) discard;
  float I = exp(-d * d * 3.2) * (1.0 - smoothstep(0.68, 1.0, d)) * vA;
  vec3 c = min(vCol * I, vec3(0.97));
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
}
`;

// ------------------------------------------------------------------------------------------ MAIN
export const MAIN_VERT = /* glsl */ `
uniform float uTime;
uniform float uA;       // chapter we morph from
uniform float uB;       // chapter we morph to (== uA on a plateau)
uniform float uT;       // progress 0..1
uniform float uChatW;   // weight of the chat chapter (typing dots)
uniform float uMapW;    // weight of the map chapters (1, 2, 5)
uniform float uIntro;
uniform float uPx;
uniform float uRef;
uniform float uMaxPt;
uniform float uDim;
uniform float uBloom;
uniform float uFocus;   // "3 in 100": 97% of dots fade, 3% light up
uniform vec3 uHome;     // Gliwice, local coordinates
uniform vec3 uCity;     // highlighted city, local coordinates
uniform float uCityAmt;
uniform float uSize[6];
uniform float uDrift[6];
uniform float uBloomK[6];
uniform vec3 uPal[8];

attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec3 aP5;
attribute vec3 aSA;
attribute vec3 aSB;
attribute vec4 aRand;

varying vec3 vCol;
varying float vA;

${COMMON}

vec3 sweepCol(float u) {
  float x = fract(u) * 3.0;
  vec3 c0 = uPal[2];
  vec3 c1 = uPal[4] * 1.12;
  vec3 c2 = uPal[6] * 0.86;
  if (x < 1.0) return mix(c0, c1, smoothstep(0.0, 1.0, x));
  if (x < 2.0) return mix(c1, c2, smoothstep(0.0, 1.0, x - 1.0));
  return mix(c2, c0, smoothstep(0.0, 1.0, x - 2.0));
}
// rgb = colour, a = brightness
vec4 decodeStyle(float s) {
  float cid = floor(s + 0.0005);
  float f = max(s - cid, 0.0);
  if (cid > 6.5) return vec4(sweepCol(f / 0.98), 1.12);
  return vec4(uPal[int(cid)], f * 2.0);
}

vec3 chapterTarget(int i, vec3 p, float flag) {
  if (i == 0) return rotY(p, uTime * 0.045);
  if (i == 4) {
    float dotIdx = mod(flag, 10.0);
    if (dotIdx > 0.5) p.y += 0.09 * (0.5 + 0.5 * sin(uTime * 5.2 - dotIdx * 1.15));
    return p;
  }
  return p;
}

vec3 targetOf(int i) {
  if (i == 0) return position;
  if (i == 1) return aP1;
  if (i == 2) return aP2;
  if (i == 3) return aP3;
  if (i == 4) return aP4;
  return aP5;
}
float styleOf(int i) {
  if (i == 0) return aSA.x;
  if (i == 1) return aSA.y;
  if (i == 2) return aSA.z;
  if (i == 3) return aSB.x;
  if (i == 4) return aSB.y;
  return aSB.z;
}
bool isMap(int i) { return i == 1 || i == 2 || i == 5; }

void main() {
  int ia = int(uA + 0.5);
  int ib = int(uB + 0.5);
  float t = clamp(uT, 0.0, 1.0);

  vec3 a = targetOf(ia);
  vec3 b = targetOf(ib);
  float sa = styleOf(ia);
  float sb = styleOf(ib);

  float flag = aRand.w;
  vec3 a2 = chapterTarget(ia, a, flag);
  vec3 b2 = chapterTarget(ib, b, flag);

  // per-transition character, keyed on the shape being formed: stagger, displacement, and the order dots arrive in
  bool still = isMap(ia) && isMap(ib); // map <-> traffic <-> close-up: same dots, only the framing moves
  float stag = still ? 0.0 : (ib == 3 ? 0.46 : (ib == 4 ? 0.42 : (ib == 0 ? 0.34 : 0.4)));
  float dispK = still ? 0.0 : (ib == 3 ? 1.3 : (ib == 0 ? 1.15 : 1.2));
  float ord = ib == 3 ? clamp(0.5 - b.y * 0.16, 0.0, 1.0)               // the page builds top-down
            : (ib == 4 ? clamp(0.5 + b.y * 0.16, 0.0, 1.0)              // the conversation builds bottom-up
            : (isMap(ib) ? clamp(length(b.xy - uHome.xy) * 0.2, 0.0, 1.0) // the map grows out of Gliwice
            : aRand.y));

  float delay = stag * (0.6 * aRand.x + 0.4 * ord);
  float lt = clamp((t - delay) / max(1.0 - stag, 0.001), 0.0, 1.0);
  float e = lt * lt * lt * (lt * (lt * 6.0 - 15.0) + 10.0);

  vec3 p = mix(a2, b2, e);

  // organic displacement: coherent curl flow that peaks mid-transition and vanishes at both ends
  float mid = sin(PI * lt);
  float dd = distance(a2, b2);
  float far = smoothstep(0.15, 2.5, dd);
  vec3 flow = curl(p * 0.5 + vec3(0.0, uTime * 0.07, 0.0) + aRand.xyz * 0.35);
  p += flow * mid * far * dispK * 0.62;
  // a coherent vortex: the whole swarm turns while it re-forms (direction alternates with the target)
  p = rotY(p, mid * (0.6 + 1.0 * aRand.y) * (mod(float(ib), 2.0) < 0.5 ? 1.0 : -1.0) * smoothstep(0.5, 3.0, dd));

  // idle drift (never fully still)
  float drift = mix(uDrift[ia], uDrift[ib], e);
  p += curl(p * 0.9 + aRand.xyz * 6.2831 + vec3(uTime * 0.11, uTime * 0.09, uTime * 0.07)) * drift;

  // intro: a wave that starts in Gliwice and rolls across the country; each dot drops into place as it passes
  float gd = length(p.xy - uHome.xy);
  float ie = clamp((uIntro * 1.35 - gd * 0.16 - aRand.y * 0.12) / 0.28, 0.0, 1.0);
  float front = sin(PI * ie);
  ie = 1.0 - pow(1.0 - ie, 3.0);
  p += (1.0 - ie) * (vec3(0.0, 0.0, 1.4) + curl(p * 0.6) * 0.45);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;

  vec4 ca = decodeStyle(sa);
  vec4 cb = decodeStyle(sb);
  vec3 tint = mix(ca.rgb, cb.rgb, e);
  float br = mix(ca.a, cb.a, e) * (1.0 + 1.2 * front);

  // "3 in 100": only one dot in about thirty-three stays lit, in signal; the rest sink back
  float pick = step(fract(aRand.x * 97.31 + aRand.z * 13.7), 0.03);
  float fo = uFocus * uMapW;
  tint = mix(tint, mix(tint * 0.5, uPal[2], pick), fo);
  br *= mix(1.0, mix(0.36, 2.4, pick), fo);

  // registry demo: the chosen city lights up, with a slow ping ring
  float cd = length(p.xy - uCity.xy);
  float ca2 = uCityAmt * uMapW;
  float core = exp(-cd * cd / 0.05);
  float r = fract(uTime * 0.38) * 1.1;
  float ring = exp(-(cd - r) * (cd - r) / 0.004) * (1.0 - r / 1.1);
  float hot = (core + 0.8 * ring) * ca2;
  tint = mix(tint, uPal[3], clamp(hot, 0.0, 0.9));
  br *= 1.0 + 1.3 * hot;

  // chat: the three typing dots pulse
  float dotIdx = mod(flag, 10.0);
  float isDot = step(0.5, dotIdx) * uChatW;
  float ph = 0.5 + 0.5 * sin(uTime * 5.2 - dotIdx * 1.15);
  br *= mix(1.0, 0.3 + 1.1 * ph, isDot);

  float sz = mix(uSize[ia], uSize[ib], e) * (0.72 + 0.56 * aRand.z);
  sz *= (1.0 + 0.35 * max(br - 1.0, 0.0)) * mix(1.0, 0.85 + 0.45 * ph, isDot);

  float twinkle = 0.88 + 0.12 * sin(uTime * (0.7 + aRand.x * 1.6) + aRand.y * 6.2831);
  float depthFade = clamp(1.0 + (uRef - depth) * 0.08, 0.45, 1.3);

  float bk = mix(uBloomK[ia], uBloomK[ib], e);
  sz *= mix(1.0, 3.8, uBloom);
  float px = sz * uPx * uRef / depth;
  float sub = uBloom > 0.5 ? 1.0 : clamp(px / 2.0, 0.0, 1.0);
  gl_PointSize = clamp(px, 2.0, uMaxPt);

  vCol = tint * br;
  vA = twinkle * depthFade * uDim * ie * sub * mix(1.0, bk, uBloom);
}
`;

// ------------------------------------------------------------------------------------------ GLOW
export const GLOW_VERT = /* glsl */ `
uniform float uTime;
uniform float uW[6];  // weight of each chapter on screen (sums to 1)
uniform float uDim;
uniform float uPxW;
uniform float uGScale;
uniform float uMaxPt;
uniform vec3 uPal[8];
attribute vec4 aInfo; // x: diameter (local units), y: intensity, z: palette id, w: phase
attribute vec2 aRange; // chapters [from, to] in which the halo is visible
varying vec3 vCol;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  float pulse = 1.0 + 0.22 * sin(uTime * 1.5 + aInfo.w);
  gl_PointSize = clamp(aInfo.x * uGScale * uPxW / depth * (0.94 + 0.08 * pulse), 2.0, uMaxPt);
  vCol = uPal[int(aInfo.z + 0.5)];
  float vis = 0.0;
  for (int i = 0; i < 6; i++) {
    float f = float(i);
    if (f > aRange.x - 0.5 && f < aRange.y + 0.5) vis += uW[i];
  }
  vA = aInfo.y * smoothstep(0.0, 1.0, vis) * pulse * uDim;
}
`;
export const GLOW_FRAG = /* glsl */ `
varying vec3 vCol;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d >= 1.0) discard;
  float I = exp(-d * d * 3.6) * (1.0 - smoothstep(0.72, 1.0, d)) * vA;
  vec3 c = min(vCol * I, vec3(0.97));
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
}
`;

// ------------------------------------------------------------------------------------------ TRAFFIC
export const TRAFFIC_VERT = /* glsl */ `
uniform float uTime;
uniform float uTraffic;
uniform float uPx;
uniform float uRef;
uniform float uMaxPt;
uniform float uSpan;
uniform vec3 uPal[8];
attribute vec3 aC;     // bezier control point (lifted)
attribute vec3 aE;     // bezier end point (position = start)
attribute vec4 aT;     // period, phase, start offset within the period, flight duration
attribute vec4 aK;     // sprite index, sprite count, kind (0 trail, 1 trace, 2 reply trail, 3 reply trace), size scale
varying vec3 vCol;
varying float vA;

vec3 bez(vec3 p0, vec3 c, vec3 p1, float s) {
  return mix(mix(p0, c, s), mix(c, p1, s), s);
}
float easeOut(float v) { return 1.0 - pow(1.0 - clamp(v, 0.0, 1.0), 1.35); }
float invEase(float s) { return 1.0 - pow(1.0 - clamp(s, 0.0, 1.0), 1.0 / 1.35); }

void main() {
  float lt = mod(uTime - aT.y, aT.x);
  float v = (lt - aT.z) / aT.w;
  float kind = aK.z;
  bool reply = kind > 1.5;
  bool trace = mod(kind, 2.0) > 0.5;
  float fj = aK.x / max(aK.y - 1.0, 1.0);

  float s; float alpha; float size;
  vec3 col;
  if (!trace) {
    float vs = v - fj * uSpan;
    s = easeOut(vs);
    float vis = step(0.0, vs) * step(vs, 1.0);
    alpha = pow(1.0 - fj, 1.6) * smoothstep(0.0, 0.05, vs) * (1.0 - smoothstep(0.9, 1.0, vs)) * vis;
    size = mix(1.0, 0.4, fj) * (fj < 0.001 ? 1.3 : 1.0);
    col = reply ? uPal[6] : mix(vec3(1.0, 0.86, 0.78), uPal[2], smoothstep(0.0, 0.32, fj));
    if (!reply && fj < 0.001) alpha *= 1.15;
  } else {
    s = fj;
    float age = v - invEase(fj);
    float lit = age > 0.0 ? exp(-age * 1.35) : 0.0;
    alpha = (0.05 + 0.7 * lit) * step(-0.15, v);
    size = 0.5;
    col = reply ? uPal[6] : uPal[3];
  }
  size *= aK.w;
  alpha *= uTraffic;
  if (alpha < 0.004) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vCol = vec3(0.0);
    vA = 0.0;
    return;
  }
  vec3 p = bez(position, aC, aE, s);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  gl_PointSize = clamp(5.4 * size * uPx * uRef / depth, 2.0, uMaxPt);
  vCol = col;
  vA = alpha;
}
`;

// ------------------------------------------------------------------------------------------ RIPPLE
export const RIPPLE_VERT = /* glsl */ `
uniform float uTime;
uniform float uTraffic;
uniform float uPx;
uniform float uPxW;
uniform float uGScale;
uniform float uRef;
uniform float uMaxPt;
uniform vec3 uPal[8];
attribute vec4 aRing;  // angle, kind (0 ring, 1 flash), max radius, strength
attribute vec4 aT;     // period, phase, arrival offset within the period, ripple duration
attribute float aCol;  // palette id
varying vec3 vCol;
varying float vA;
void main() {
  float lt = mod(uTime - aT.y, aT.x);
  float age = (lt - aT.z) / aT.w;
  if (age < 0.0 || age > 1.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vCol = vec3(0.0);
    vA = 0.0;
    return;
  }
  vec3 p = position;
  float alpha;
  float px;
  vec4 probe = modelViewMatrix * vec4(position, 1.0);
  float depth0 = -probe.z;
  if (aRing.y < 0.5) {
    float r = aRing.z * (1.0 - pow(1.0 - age, 2.4));
    p += vec3(cos(aRing.x), sin(aRing.x), 0.0) * r;
    alpha = aRing.w * pow(1.0 - age, 1.5) * smoothstep(0.0, 0.06, age);
    px = 3.6 * (1.15 - 0.5 * age) * uPx * uRef / depth0;
  } else {
    float f = age / 0.24;
    if (f > 1.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      vCol = vec3(0.0);
      vA = 0.0;
      return;
    }
    alpha = aRing.w * (1.0 - f) * (1.0 - f);
    px = aRing.z * 0.5 * (0.35 + 0.65 * f) * uGScale * uPxW / depth0;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(px, 2.0, uMaxPt);
  vCol = uPal[int(aCol + 0.5)];
  vA = alpha * uTraffic;
}
`;
