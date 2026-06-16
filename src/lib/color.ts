/**
 * Tiny hue utilities — plain JS (no three) so DOM components can derive tints
 * without pulling the 3D bundle into a route's first load.
 */

/** Rotate a `#rrggbb` color's hue by `deg` degrees, preserving S/L. */
export function shiftHue(hex: string, deg: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  h = (h + deg) % 360;
  if (h < 0) h += 360;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const mm = l - c / 2;
  let rr = 0;
  let gg = 0;
  let bb = 0;
  if (h < 60) { rr = c; gg = x; }
  else if (h < 120) { rr = x; gg = c; }
  else if (h < 180) { gg = c; bb = x; }
  else if (h < 240) { gg = x; bb = c; }
  else if (h < 300) { rr = x; bb = c; }
  else { rr = c; bb = x; }

  const to = (v: number) =>
    Math.round((v + mm) * 255).toString(16).padStart(2, "0");
  return `#${to(rr)}${to(gg)}${to(bb)}`;
}

/**
 * Per-cluster tint: spreads `n` items across a tight hue band centered on the
 * theme base, so each latent cluster reads distinct while staying in-family.
 * Theme-safe — derived from the active accent, so `theme phosphor` recolors the
 * whole band too (no hardcoded hue).
 */
export function clusterAccent(baseHex: string, i: number, n: number): string {
  const spread = 56; // total degrees across the band
  const offset = n > 1 ? (i / (n - 1) - 0.5) * spread : 0;
  return shiftHue(baseHex, offset);
}
