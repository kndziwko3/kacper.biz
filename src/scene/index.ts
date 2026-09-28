// STUB — owned by the 3D-scene agent.
export interface SceneHandle { destroy(): void }
export async function mountScene(_canvas: HTMLCanvasElement, _opts: { reducedMotion: boolean }): Promise<SceneHandle | null> {
  return null;
}
