/**
 * WCAG 2.1 color contrast utilities.
 *
 * Used to determine whether text on a given background should be
 * light (white) or dark (slate-800) to guarantee readability.
 */

/**
 * Calculate relative luminance of a hex color per WCAG 2.1.
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(hex: string): number {
  hex = hex.replace(/^#/, '');

  let r: number, g: number, b: number;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) / 255;
    g = parseInt(hex[1] + hex[1], 16) / 255;
    b = parseInt(hex[2] + hex[2], 16) / 255;
  } else if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16) / 255;
    g = parseInt(hex.slice(2, 4), 16) / 255;
    b = parseInt(hex.slice(4, 6), 16) / 255;
  } else {
    return 0;
  }

  // sRGB → linear
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Given a background hex color, returns whether overlaid text should be
 * 'light' (use white text) or 'dark' (use dark text).
 *
 * Threshold 0.179 is the standard WCAG mid-point for 4.5:1 contrast.
 */
export function getContrastTextColor(bgHex: string): 'light' | 'dark' {
  const luminance = getRelativeLuminance(bgHex);
  return luminance > 0.179 ? 'dark' : 'light';
}
