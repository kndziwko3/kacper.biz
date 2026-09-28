/**
 * Approximate geography of Poland for the dot-map chapter.
 * Hand-authored border polygon (lon, lat), clockwise from the Oder mouth in the north-west.
 * Accuracy is ~0.1 degree: enough for an instantly recognisable silhouette, not for cartography.
 */

export type LonLat = readonly [lon: number, lat: number];

export const POLAND: readonly LonLat[] = [
  // Baltic coast, west -> east
  [14.25, 53.92], [14.45, 53.94], [14.75, 54.03], [15.0, 54.08], [15.3, 54.13], [15.58, 54.18],
  [15.85, 54.26], [16.15, 54.32], [16.42, 54.43], [16.55, 54.55], [16.86, 54.58], [17.1, 54.68],
  [17.55, 54.76], [17.95, 54.81], [18.33, 54.83],
  // Hel peninsula (out along the sea side, back along Puck Bay)
  [18.45, 54.80], [18.62, 54.72], [18.80, 54.61], [18.77, 54.595], [18.62, 54.67], [18.47, 54.74],
  [18.42, 54.70], [18.50, 54.62], [18.55, 54.52], [18.58, 54.44], [18.68, 54.36],
  // Vistula delta + spit -> Kaliningrad border
  [19.05, 54.34], [19.35, 54.37], [19.65, 54.45],
  // Russia (Kaliningrad Oblast)
  [19.95, 54.40], [20.45, 54.37], [20.85, 54.40], [21.25, 54.33], [21.65, 54.34], [22.0, 54.41],
  [22.45, 54.37], [22.79, 54.36],
  // Lithuania
  [23.0, 54.36], [23.22, 54.25], [23.42, 54.20], [23.50, 54.10], [23.52, 53.95],
  // Belarus (incl. the Bug river south of Terespol)
  [23.70, 53.75], [23.62, 53.50], [23.62, 53.33], [23.90, 53.15], [23.95, 52.95], [24.10, 52.80],
  [23.95, 52.62], [23.65, 52.50], [23.62, 52.28], [23.62, 52.08], [23.55, 51.75], [23.58, 51.50],
  [23.75, 51.30], [23.92, 51.05], [24.10, 50.85],
  // Ukraine
  [23.98, 50.62], [23.62, 50.40], [23.55, 50.33], [23.30, 50.10], [22.98, 49.92], [22.85, 49.75],
  [22.72, 49.62], [22.85, 49.48], [22.72, 49.28], [22.56, 49.08],
  // Slovakia (Bieszczady, Beskids, Tatras)
  [22.38, 49.03], [22.10, 49.12], [21.80, 49.32], [21.45, 49.42], [21.05, 49.40], [20.70, 49.38],
  [20.35, 49.33], [20.08, 49.18], [19.85, 49.22], [19.55, 49.40], [19.28, 49.46], [19.02, 49.44],
  [18.85, 49.52],
  // Czech Republic (Silesia, Klodzko, Sudetes)
  [18.62, 49.72], [18.50, 49.92], [18.32, 49.98], [18.05, 50.08], [17.75, 50.12], [17.60, 50.24],
  [17.38, 50.28], [17.10, 50.38], [16.90, 50.30], [16.68, 50.12], [16.55, 50.25], [16.25, 50.40],
  [16.05, 50.60], [15.80, 50.75], [15.40, 50.80], [15.10, 50.95], [14.82, 50.87],
  // Germany (Neisse + Oder)
  [14.95, 51.05], [14.98, 51.15], [14.95, 51.37], [14.72, 51.55], [14.63, 51.73], [14.73, 51.95],
  [14.75, 52.10], [14.55, 52.35], [14.66, 52.58], [14.40, 52.78], [14.16, 52.87], [14.28, 53.10],
  [14.35, 53.30], [14.28, 53.50], [14.20, 53.70], [14.16, 53.85],
];

export const GLIWICE: LonLat = [18.67, 50.29];

export interface City {
  name: string;
  lon: number;
  lat: number;
  /** Relative size, drives dot-cluster density and halo. ~ metro population in millions, softened. */
  w: number;
  /** Eligible as a traffic destination. */
  dest: boolean;
}

export const CITIES: readonly City[] = [
  { name: 'Warszawa', lon: 21.01, lat: 52.23, w: 1.0, dest: true },
  { name: 'Kraków', lon: 19.94, lat: 50.06, w: 0.8, dest: true },
  { name: 'Łódź', lon: 19.46, lat: 51.76, w: 0.66, dest: true },
  { name: 'Wrocław', lon: 17.04, lat: 51.11, w: 0.66, dest: true },
  { name: 'Poznań', lon: 16.93, lat: 52.41, w: 0.6, dest: true },
  { name: 'Gdańsk', lon: 18.65, lat: 54.35, w: 0.62, dest: true },
  { name: 'Szczecin', lon: 14.55, lat: 53.43, w: 0.46, dest: true },
  { name: 'Lublin', lon: 22.57, lat: 51.25, w: 0.4, dest: true },
  { name: 'Białystok', lon: 23.16, lat: 53.13, w: 0.36, dest: true },
  { name: 'Bydgoszcz', lon: 18.0, lat: 53.12, w: 0.4, dest: true },
  { name: 'Rzeszów', lon: 22.0, lat: 50.04, w: 0.3, dest: true },
  { name: 'Olsztyn', lon: 20.49, lat: 53.78, w: 0.28, dest: true },
  { name: 'Opole', lon: 17.93, lat: 50.67, w: 0.24, dest: true },
  { name: 'Zielona Góra', lon: 15.51, lat: 51.94, w: 0.22, dest: true },
  { name: 'Toruń', lon: 18.6, lat: 53.01, w: 0.26, dest: true },
  { name: 'Katowice', lon: 19.02, lat: 50.26, w: 0.7, dest: true },
  { name: 'Kielce', lon: 20.63, lat: 50.87, w: 0.26, dest: true },
  { name: 'Radom', lon: 21.15, lat: 51.4, w: 0.24, dest: true },
  { name: 'Częstochowa', lon: 19.12, lat: 50.81, w: 0.26, dest: true },
  { name: 'Gorzów Wlkp.', lon: 15.24, lat: 52.73, w: 0.18, dest: true },
  // Texture only (dot clusters, no traffic)
  { name: 'Gdynia', lon: 18.53, lat: 54.52, w: 0.3, dest: false },
  { name: 'Bielsko-Biała', lon: 19.05, lat: 49.82, w: 0.24, dest: false },
  { name: 'Płock', lon: 19.7, lat: 52.55, w: 0.14, dest: false },
  { name: 'Kalisz', lon: 18.09, lat: 51.76, w: 0.14, dest: false },
  { name: 'Legnica', lon: 16.16, lat: 51.21, w: 0.14, dest: false },
  { name: 'Koszalin', lon: 16.18, lat: 54.19, w: 0.14, dest: false },
  { name: 'Słupsk', lon: 17.03, lat: 54.46, w: 0.12, dest: false },
  { name: 'Suwałki', lon: 22.93, lat: 54.1, w: 0.1, dest: false },
  { name: 'Przemyśl', lon: 22.77, lat: 49.78, w: 0.1, dest: false },
  { name: 'Nowy Sącz', lon: 20.69, lat: 49.62, w: 0.12, dest: false },
  { name: 'Tarnów', lon: 21.0, lat: 50.01, w: 0.12, dest: false },
  { name: 'Zamość', lon: 23.25, lat: 50.72, w: 0.1, dest: false },
  { name: 'Piła', lon: 16.74, lat: 53.15, w: 0.1, dest: false },
  { name: 'Elbląg', lon: 19.4, lat: 54.16, w: 0.12, dest: false },
];

// ---- projection: equirectangular, x scaled by cos(52deg), fitted to MAP_H world units tall ----
export const LON0 = 19.13;
export const LAT0 = 51.92;
export const MAP_H = 6.0;
const LAT_SPAN = 5.84;
const COS52 = Math.cos((52 * Math.PI) / 180);
const S = MAP_H / LAT_SPAN;

export function project(lon: number, lat: number): [number, number] {
  return [(lon - LON0) * COS52 * S, (lat - LAT0) * S];
}

export function unproject(x: number, y: number): [number, number] {
  return [x / (COS52 * S) + LON0, y / S + LAT0];
}

export const MAP_W = (24.15 - 14.12) * COS52 * S;

export function polygonXY(): Array<[number, number]> {
  return POLAND.map(([lon, lat]) => project(lon, lat));
}

export function pointInPolygon(x: number, y: number, poly: ReadonlyArray<readonly [number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function polygonArea(poly: ReadonlyArray<readonly [number, number]>): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += poly[j]![0] * poly[i]![1] - poly[i]![0] * poly[j]![1];
  }
  return Math.abs(a) / 2;
}
