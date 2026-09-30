/**
 * One fullscreen triangle composites the linear HDR frame: a lens depth of field (single-pass gather on a golden-angle
 * spiral, after Dennis Gustafsson's "bokeh in a single pass", so sharp foreground edges never pick up a halo from the
 * blurred background), a lens vignette in linear light, the tone map and the sRGB transfer (three's own chunks, applied
 * because this pass draws to the screen), then fine animated grain and a triangular dither so dark gradients never band.
 */
import { BufferGeometry, Float32BufferAttribute, Mesh, OrthographicCamera, Scene, ShaderMaterial, Vector2, type Texture } from 'three';

export interface FinalPass {
  scene: Scene;
  camera: OrthographicCamera;
  material: ShaderMaterial;
  setInput(color: Texture, depth: Texture | null): void;
  dispose(): void;
}

/** taps: 0 = no depth of field (low tier). */
export function finalPass(taps: number): FinalPass {
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  geo.setAttribute('uv', new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const material = new ShaderMaterial({
    defines: { DOF_TAPS: Math.max(0, taps) },
    uniforms: {
      tScene: { value: null },
      tDepth: { value: null },
      uRes: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uGrain: { value: 0.02 },
      uVignette: { value: 0.42 },
      uExposure: { value: 1 },
      uNear: { value: 0.1 },
      uFar: { value: 80 },
      uFocus: { value: 7 },
      /** Blur growth with distance from the focus plane (a thin-lens aperture, scaled). */
      uAperture: { value: 0 },
      /** Largest blur radius, in render pixels. */
      uMaxR: { value: 14 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tScene;
      uniform sampler2D tDepth;
      uniform vec2 uRes;
      uniform float uTime, uGrain, uVignette, uExposure, uNear, uFar, uFocus, uAperture, uMaxR;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float linZ(float d) { float z = d * 2.0 - 1.0; return 2.0 * uNear * uFar / (uFar + uNear - z * (uFar - uNear)); }
      float cocPx(float z) { return clamp(abs(z - uFocus) / max(z, 0.001) * uAperture, 0.0, 1.0) * uMaxR; }
      void main() {
        vec3 c = texture2D(tScene, vUv).rgb;
        #if DOF_TAPS > 0
        if (uAperture > 0.0005) {
          vec2 px = 1.0 / vec2(textureSize(tScene, 0));
          float zc = linZ(texture2D(tDepth, vUv).x);
          float cc = cocPx(zc);
          vec3 acc = c; float tot = 1.0;
          // radius grows so the taps cover the disc evenly: n taps reach r^2 / (2 rs)
          float rs = uMaxR * uMaxR / (2.0 * float(DOF_TAPS));
          float radius = max(0.5, sqrt(rs));
          for (int i = 0; i < DOF_TAPS; i++) {
            float ang = float(i) * 2.39996323;
            vec2 tc = vUv + vec2(cos(ang), sin(ang)) * px * radius;
            vec3 sc = texture2D(tScene, tc).rgb;
            float zs = linZ(texture2D(tDepth, tc).x);
            float ss = cocPx(zs);
            // a blurred background sample may not spill over a sharper pixel in front of it
            if (zs > zc) ss = clamp(ss, 0.0, cc * 2.0);
            float m = smoothstep(radius - 0.5, radius + 0.5, ss);
            acc += mix(acc / tot, sc, m);
            tot += 1.0;
            radius += rs / radius;
            if (radius > uMaxR) break;
          }
          c = acc / tot;
        }
        #endif
        c *= uExposure;
        vec2 q = vUv - 0.5;
        q.x *= uRes.x / uRes.y;
        float v = smoothstep(1.05, 0.2, length(q));
        c *= mix(1.0 - uVignette, 1.0, v);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        float n = hash(gl_FragCoord.xy + fract(uTime) * 97.13) + hash(gl_FragCoord.xy * 1.37 + fract(uTime * 1.31) * 31.7) - 1.0;
        gl_FragColor.rgb += n * uGrain + n * (1.0 / 255.0);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new Mesh(geo, material);
  mesh.frustumCulled = false;
  const scene = new Scene();
  scene.add(mesh);
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    scene, camera, material,
    setInput(color: Texture, depth: Texture | null): void { material.uniforms.tScene!.value = color; material.uniforms.tDepth!.value = depth; },
    dispose(): void { geo.dispose(); material.dispose(); },
  };
}
