/**
 * One fullscreen triangle composites the linear HDR frame: a lens vignette in linear light, AgX tone mapping and the
 * sRGB transfer (three's own chunks, applied because this pass draws to the screen), then fine animated grain in
 * display space so dark gradients never band.
 */
import { BufferGeometry, Float32BufferAttribute, Mesh, OrthographicCamera, Scene, ShaderMaterial, Vector2, type Texture } from 'three';

export interface FinalPass {
  scene: Scene;
  camera: OrthographicCamera;
  material: ShaderMaterial;
  setInput(t: Texture): void;
  dispose(): void;
}

export function finalPass(): FinalPass {
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  geo.setAttribute('uv', new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
  const material = new ShaderMaterial({
    uniforms: {
      tScene: { value: null },
      uRes: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uGrain: { value: 0.022 },
      uVignette: { value: 0.42 },
      uExposure: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tScene;
      uniform vec2 uRes;
      uniform float uTime;
      uniform float uGrain;
      uniform float uVignette;
      uniform float uExposure;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec3 c = texture2D(tScene, vUv).rgb * uExposure;
        vec2 q = vUv - 0.5;
        q.x *= uRes.x / uRes.y;
        float v = smoothstep(1.05, 0.2, length(q));
        c *= mix(1.0 - uVignette, 1.0, v);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        float n = hash(gl_FragCoord.xy + fract(uTime) * 97.13) + hash(gl_FragCoord.xy * 1.37 + fract(uTime * 1.31) * 31.7) - 1.0;
        gl_FragColor.rgb += n * uGrain;
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
    setInput(t: Texture): void { material.uniforms.tScene!.value = t; },
    dispose(): void { geo.dispose(); material.dispose(); },
  };
}
