/**
 * Shared pin rendering utilities used by both MapContainer and ListPage.
 *
 * Contains:
 * - CSS variable helpers & pin color lookup
 * - SVG icon preloading
 * - Category icon name resolution
 * - Canvas renderers for default (teardrop) and collected (circular photo) pins
 * - Filesystem-based photo loading for collected discoveries
 */

import { Directory, Filesystem } from "@capacitor/filesystem";
import { UserData } from "@/internal/databases/UserData";

// ---------------------------------------------------------------------------
// CSS helpers & pin colors
// ---------------------------------------------------------------------------

export function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export interface PinColors {
  fillStart: string;
  fillEnd: string;
  border: string;
}

export function getPinColors(type: string): PinColors {
  const map: Record<string, PinColors> = {
    artwork: {
      fillStart: getCSSVar("--pin-artwork-fill-start"),
      fillEnd: getCSSVar("--pin-artwork-fill-end"),
      border: getCSSVar("--pin-artwork-border"),
    },
    heritage: {
      fillStart: getCSSVar("--pin-heritage-fill-start"),
      fillEnd: getCSSVar("--pin-heritage-fill-end"),
      border: getCSSVar("--pin-heritage-border"),
    },
    place: {
      fillStart: getCSSVar("--pin-place-fill-start"),
      fillEnd: getCSSVar("--pin-place-fill-end"),
      border: getCSSVar("--pin-place-border"),
    },
  };
  return map[type] ?? map.heritage;
}

// ---------------------------------------------------------------------------
// Icon preloading
// ---------------------------------------------------------------------------

export const iconImages: Record<string, HTMLImageElement | null> = {};
const iconLoadPromises: Partial<
  Record<string, Promise<HTMLImageElement | null>>
> = {};

export function preloadSvgIcon(
  name: string,
  path: string,
): Promise<HTMLImageElement | null> {
  if (iconLoadPromises[name]) return iconLoadPromises[name];
  iconLoadPromises[name] = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      iconImages[name] = img;
      resolve(img);
    };
    img.onerror = () => {
      iconImages[name] = null;
      resolve(null);
    };
    img.src = path;
  });
  return iconLoadPromises[name];
}

export function preloadAllPinIcons(): void {
  preloadSvgIcon("targeted", "./assets/drawable/icons/pins/targeted_bookmark.svg");
  preloadSvgIcon("default", "./assets/drawable/icons/pins/default.svg");
  preloadSvgIcon("art_public", "./assets/drawable/icons/pins/art_public.svg");
  preloadSvgIcon("murales", "./assets/drawable/icons/pins/murales.svg");
  preloadSvgIcon("sculptures", "./assets/drawable/icons/pins/sculptures2.svg");
  preloadSvgIcon("lieux_culturels", "./assets/drawable/icons/pins/lieux_culturels.svg");
  preloadSvgIcon("bibliotheques", "./assets/drawable/icons/pins/bibliotheques.svg");
  preloadSvgIcon("patrimoine", "./assets/drawable/icons/pins/patrimoine.svg");
}

// Start preloading immediately on import
preloadAllPinIcons();

// ---------------------------------------------------------------------------
// Category → icon name mapping
// ---------------------------------------------------------------------------

export function getCategoryIconName(discovery: any): string {
  if (!discovery) return "default";

  const dType = discovery.dType;

  if (dType === "heritage") return "patrimoine";

  let rawCategory = "";
  if (dType === "artwork" && typeof discovery.getCategories === "function") {
    rawCategory = discovery.getCategories("fr");
  } else if (dType === "place" && typeof discovery.getUsages === "function") {
    rawCategory = discovery.getUsages("fr");
  }

  const first = rawCategory.split(",")[0].trim().toLowerCase();
  if (!first) {
    if (dType === "artwork") return "art_public";
    if (dType === "place") return "lieux_culturels";
    return "default";
  }

  if (first.includes("art public")) return "art_public";
  if (first.includes("murale")) return "murales";
  if (first.includes("sculpture")) return "sculptures";
  if (first.includes("biblioth")) return "bibliotheques";
  if (
    first.includes("lieu") ||
    first.includes("maison de la culture") ||
    first.includes("centre") ||
    first.includes("galerie") ||
    first.includes("mus")
  )
    return "lieux_culturels";
  if (first.includes("patrimoine")) return "patrimoine";

  if (dType === "artwork") return "art_public";
  if (dType === "place") return "lieux_culturels";
  return "default";
}

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

/** Fixed render scale for crisp canvases on all screens (DPR-independent). */
export const CANVAS_RENDER_SCALE = 2;

export function buildDiscoveryKey(dType: string, id: number | string): string {
  return `${dType}:${id}`;
}

// ---------------------------------------------------------------------------
// Canvas renderers
// ---------------------------------------------------------------------------

/**
 * Creates a default pin: teardrop/balloon shape with an icon inside.
 * Matches Figma design.
 */
export function createDefaultPinCanvas(
  type: string,
  categoryIcon = "default",
): HTMLCanvasElement {
  const colors = getPinColors(type);
  const borderWidth = 1;
  const innerRadius = 12;
  const outerRadius = innerRadius + borderWidth;
  const pointerHeight = 10;
  const totalSize = (outerRadius + 2) * 2; // +2 for shadow margin
  const totalHeight = totalSize + pointerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = totalSize * CANVAS_RENDER_SCALE;
  canvas.height = totalHeight * CANVAS_RENDER_SCALE;
  // Store logical size so OpenLayers can use imgSize
  (canvas as any)._logicalWidth = totalSize;
  (canvas as any)._logicalHeight = totalHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(CANVAS_RENDER_SCALE, CANVAS_RENDER_SCALE);

  const cx = totalSize / 2;
  const cy = outerRadius + 1;

  // Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetY = 1;

  // Outer pale border circle
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.fillStyle = colors.border;
  ctx.fill();

  // Outer pale pointer
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + outerRadius - 2);
  ctx.lineTo(cx, cy + outerRadius + pointerHeight - 2);
  ctx.lineTo(cx + 6, cy + outerRadius - 2);
  ctx.closePath();
  ctx.fillStyle = colors.border;
  ctx.fill();

  // Reset shadow for inner fill
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Inner darker fill circle (vertical gradient)
  const innerGrad = ctx.createLinearGradient(
    cx,
    cy - innerRadius,
    cx,
    cy + innerRadius,
  );
  innerGrad.addColorStop(0, colors.fillStart);
  innerGrad.addColorStop(1, colors.fillEnd);
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = innerGrad;
  ctx.fill();

  // Inner darker pointer (use gradient end color)
  ctx.beginPath();
  ctx.moveTo(cx - 4, cy + innerRadius - 1);
  ctx.lineTo(cx, cy + innerRadius + pointerHeight - 4);
  ctx.lineTo(cx + 4, cy + innerRadius - 1);
  ctx.closePath();
  ctx.fillStyle = colors.fillEnd;
  ctx.fill();

  // Draw category icon inside the circle
  const icon = iconImages[categoryIcon] || iconImages["default"];
  if (icon) {
    const iconDrawSize = 13;
    ctx.drawImage(
      icon,
      cx - iconDrawSize / 2,
      cy - iconDrawSize / 2,
      iconDrawSize,
      iconDrawSize,
    );
  }

  return canvas;
}

/**
 * Creates a circular photo pin: gradient ring around a circular-clipped photo + pointer.
 * Used on the map for collected discoveries and in the list for collected discovery avatars.
 */
export function createCircularPhotoPinCanvas(
  img: HTMLImageElement,
  type: string,
  size = 56,
): HTMLCanvasElement {
  const colors = getPinColors(type);
  const ringWidth = 2;
  const totalSize = size + ringWidth * 2;
  const pointerHeight = 10;

  const canvas = document.createElement("canvas");
  canvas.width = totalSize * CANVAS_RENDER_SCALE;
  canvas.height = (totalSize + pointerHeight) * CANVAS_RENDER_SCALE;
  // Store logical size so OpenLayers can use imgSize
  (canvas as any)._logicalWidth = totalSize;
  (canvas as any)._logicalHeight = totalSize + pointerHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(CANVAS_RENDER_SCALE, CANVAS_RENDER_SCALE);

  const cx = totalSize / 2;
  const cy = totalSize / 2;
  const photoRadius = size / 2;

  // Shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  // Gradient ring (single ring, no outer border)
  const ringGrad = ctx.createLinearGradient(
    cx,
    cy - (photoRadius + ringWidth),
    cx,
    cy + (photoRadius + ringWidth),
  );
  ringGrad.addColorStop(0, colors.fillStart);
  ringGrad.addColorStop(1, colors.fillEnd);
  ctx.beginPath();
  ctx.arc(cx, cy, photoRadius + ringWidth, 0, Math.PI * 2);
  ctx.fillStyle = ringGrad;
  ctx.fill();

  // Gradient pointer
  ctx.beginPath();
  ctx.moveTo(cx - 6, cy + photoRadius + ringWidth - 2);
  ctx.lineTo(cx, cy + photoRadius + ringWidth + pointerHeight - 2);
  ctx.lineTo(cx + 6, cy + photoRadius + ringWidth - 2);
  ctx.closePath();
  ctx.fillStyle = colors.fillEnd;
  ctx.fill();

  // Reset shadow
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Clip circle and draw photo
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, photoRadius, 0, Math.PI * 2);
  ctx.clip();

  const imgSize = Math.min(img.width, img.height);
  const sx = (img.width - imgSize) / 2;
  const sy = (img.height - imgSize) / 2;
  ctx.drawImage(
    img,
    sx,
    sy,
    imgSize,
    imgSize,
    cx - photoRadius,
    cy - photoRadius,
    size,
    size,
  );
  ctx.restore();

  return canvas;
}

// ---------------------------------------------------------------------------
// Photo loading from Capacitor Filesystem
// ---------------------------------------------------------------------------

/**
 * Reads a collected discovery's photo from Filesystem and returns a blob URL.
 * Tries thumbnail/ first, falls back to img/.
 * Returns null if no photo is available.
 */
export async function loadDiscoveryPhotoBlobUrl(
  id: number,
  dType: string,
): Promise<string | null> {
  try {
    const review = UserData.getCollected(id, dType);
    if (!review || !review.filename) return null;

    let file;
    try {
      file = await Filesystem.readFile({
        path: "thumbnail/" + review.filename,
        directory: Directory.Data,
      });
    } catch {
      file = await Filesystem.readFile({
        path: "img/" + review.filename,
        directory: Directory.Data,
      });
    }

    if (file.data instanceof Blob) {
      return URL.createObjectURL(file.data);
    } else {
      const ext = review.filename.split(".").at(-1) || "jpeg";
      const res = await fetch(`data:image/${ext};base64,${file.data}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
  } catch {
    return null;
  }
}

/**
 * Converts a blob URL to an HTMLImageElement.
 * Returns null if loading fails.
 */
export function loadImageFromUrl(
  url: string,
): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = url;
  });
}
