/**
 * The studio: a dark cyclorama lit like a product shoot. Reflections come from a small environment of emissive
 * softboxes baked into a PMREM (the strip highlights that run along every chamfer); shape and the floor pool come from
 * one warm key spot that also casts the contact shadow. No bloom, no glow: light is only what a camera would record.
 */
import {
  BackSide, Color, CylinderGeometry, FogExp2, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PlaneGeometry, PMREMGenerator,
  Scene, SphereGeometry, SpotLight, type Texture, type WebGLRenderer, DirectionalLight, Object3D, CircleGeometry,
} from 'three';

/** Page ground (studio black) as linear colour; the scene background and fog use it so the floor dissolves. */
export const STUDIO = new Color('#0e0c0a');

/** A studio environment: black room, one big overhead softbox, a tall strip left, a thin rim strip right, a low bounce card. */
export function studioEnvironment(renderer: WebGLRenderer): Texture {
  const env = new Scene();
  env.background = new Color('#050404');
  const room = new Mesh(new SphereGeometry(20, 24, 12), new MeshBasicMaterial({ color: '#060505', side: BackSide }));
  env.add(room);
  const card = (w: number, h: number, intensity: number, tint: string, x: number, y: number, z: number, lookAt: [number, number, number]) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(tint).multiplyScalar(intensity) }));
    m.position.set(x, y, z);
    m.lookAt(...lookAt);
    env.add(m);
    return m;
  };
  // overhead softbox, slightly warm
  card(10, 6, 1.6, '#fff1e2', 0, 9, 1, [0, 0, 0]);
  // big diffusion scrim on the camera side: faces turned toward the viewer read as soft, light metal
  card(14, 8, 0.28, '#f6eee6', 2, 3.5, 11, [0, 1.5, 0]);
  // tall strip, key side (front left): the long highlight that runs down every chamfer
  card(1.1, 11, 6, '#ffe9d4', -7, 3, 5.5, [0, 1.5, 0]);
  // thin rim strip, back right: separates the silhouette from the dark
  card(0.45, 10, 8, '#f4f1ec', 7.5, 3.5, -5.5, [0, 1.5, 0]);
  // second strip, right front, lower: a cool-neutral kicker for the plate faces
  card(1.2, 7, 3.2, '#efeee9', 7, 3, 7, [0, 1.5, 0]);
  // softbox on the right: the page and the drawer faces pick it up
  card(3, 6, 1.1, '#f6efe6', 9, 3, 0, [0, 1.5, 0]);
  // dark grey studio walls all round, so no metal face ever reads as a hole
  const walls = new Mesh(new CylinderGeometry(15, 15, 7, 32, 1, true), new MeshBasicMaterial({ color: new Color('#b8b0a6').multiplyScalar(0.09), side: BackSide }));
  walls.position.y = 2.5;
  env.add(walls);
  // low bounce card in front
  card(12, 1.6, 0.4, '#ffeedd', 0, -0.4, 9, [0, 1.5, 0]);
  const pmrem = new PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.035).texture;
  pmrem.dispose();
  env.traverse((o) => { const m = o as Mesh; if (m.isMesh) { m.geometry.dispose(); (m.material as MeshBasicMaterial).dispose(); } });
  return tex;
}

export interface StudioRig {
  key: SpotLight;
  rim: DirectionalLight;
  floor: Mesh;
  pool: Mesh;
  dispose(): void;
}

/** Floor, key and rim. `shadows` is off on the low tier (the pool of light still grounds the object). */
export function buildStudio(scene: Scene, shadows: boolean, shadowSize: number): StudioRig {
  scene.background = STUDIO.clone();
  scene.fog = new FogExp2(STUDIO.clone(), 0.045);

  const floor = new Mesh(
    new PlaneGeometry(80, 80),
    // a dull floor: the key must not glare off it at the low camera angles; the satin look comes from the mirrored object
    new MeshPhysicalMaterial({ color: '#141110', roughness: 0.72, metalness: 0, specularIntensity: 0.12, envMapIntensity: 0.3, transparent: true, opacity: 1 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = shadows;
  scene.add(floor);

  // a soft, warm pool under the object (reads as the key's footprint even without shadows)
  const pool = new Mesh(
    new CircleGeometry(4.2, 48),
    new MeshBasicMaterial({ color: '#4a2f1d', transparent: true, opacity: 0.8, depthWrite: false }),
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.002;
  (pool.material as MeshBasicMaterial).onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      '#include <map_fragment>',
      '#include <map_fragment>\n float r = length(vUvPool - 0.5) * 2.0; diffuseColor.a *= pow(1.0 - clamp(r, 0.0, 1.0), 1.8);',
    );
    s.fragmentShader = 'varying vec2 vUvPool;\n' + s.fragmentShader;
    s.vertexShader = 'varying vec2 vUvPool;\n' + s.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n vUvPool = uv;');
  };
  scene.add(pool);

  const key = new SpotLight('#ffe2c4', 62, 30, 0.42, 0.85, 1.6);
  key.position.set(-4.5, 8.5, 5.5);
  key.target = new Object3D();
  key.target.position.set(0, 1.2, 0);
  scene.add(key, key.target);
  if (shadows) {
    key.castShadow = true;
    key.shadow.mapSize.set(shadowSize, shadowSize);
    key.shadow.bias = -0.00025;
    key.shadow.normalBias = 0.012;
    key.shadow.radius = 6;
    key.shadow.camera.near = 4;
    key.shadow.camera.far = 22;
  }

  // a low copper spill from the front left: it rakes the floor and warms the foot of the object, so the dark field
  // reads as a lit studio rather than a void
  const spill = new SpotLight('#ff9a5c', 38, 18, 0.62, 1, 1.4);
  spill.position.set(-6.5, 0.9, 4.5);
  spill.target = new Object3D();
  spill.target.position.set(0.5, 0.2, -0.5);
  scene.add(spill, spill.target);

  const rim = new DirectionalLight('#f3efe8', 1.4);
  rim.position.set(6, 5, -7);
  scene.add(rim);

  // the backdrop: a curved sweep far behind, with a soft pool of light where the key spills onto it
  const back = new Mesh(new PlaneGeometry(60, 26), new MeshStandardMaterial({ color: '#1c1916', roughness: 0.95, metalness: 0, envMapIntensity: 0.15 }));
  back.position.set(0, 12, -9);
  back.receiveShadow = false;
  scene.add(back);
  const wash = new SpotLight('#ffcf9f', 70, 30, 0.55, 1, 1.2);
  wash.position.set(1.5, 3, 4);
  wash.target = new Object3D();
  wash.target.position.set(0.5, 4.2, -9);
  scene.add(wash, wash.target);

  return {
    key, rim, floor, pool,
    dispose(): void {
      for (const m of [floor, pool, back]) { m.geometry.dispose(); (m.material as MeshBasicMaterial).dispose(); }
    },
  };
}
