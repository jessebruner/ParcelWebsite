/*
 * THE MARSH, LIFTED OUT OF THE HOMEPAGE BUNDLE.
 *
 * Verbatim from the original page's own painter, so the art is the art the
 * site has always drawn: an ordered 4x4 dither over a nineteen-stop sky ramp,
 * a mirrored dimmed ramp for water, a conifer treeline from wrapping value
 * noise, reeds, and the heron drawn from the mark's own rects.
 *
 * Two scenes, dusk and dawn, plus a band mode that paints sky only, for the
 * strips between chapters.
 *
 *   new Scene(canvas, { scene: "dusk" | "dawn", seed: 7, band: false }).start()
 */
const SKY_DUSK = ["#171326","#1C1830","#221D37","#2A2340","#332949","#3D2F52","#48355A","#553C61","#634468",
  "#734C6C","#845670","#966073","#A96B75","#BC7878","#CE8878","#DE9B7E","#EBB289","#F4CB9F","#FAE0BC"];
const SKY_DAWN = ["#20293B","#273245","#2E3B4F","#364459","#3F4D63","#49576D","#546177","#606C81","#6E788A",
  "#7D8492","#8D9199","#9E9EA0","#AFACA8","#C0BAB0","#D0C8BA","#DED6C6","#EAE3D3","#F4EEE0","#FBF8F4"];
const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v => v / 16 - 0.47);

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function hexToRgb(h) {
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
}

export class Scene {
  constructor(canvas, opts) {
    this.cv = canvas;
    this.o = opts || {};
    this.ramp = (this.o.scene === "dawn" ? SKY_DAWN : SKY_DUSK).map(hexToRgb);
    this.rng = mulberry32(this.o.seed || 7);
    this.noise = this.buildNoise();
    this.t0 = Date.now();
    this.dead = false;
  }
  buildNoise() {
    const gx = 24, gy = 6, g = new Float32Array(gx * gy);
    for (let i = 0; i < g.length; i++) g[i] = this.rng();
    return (u, v) => {
      const fx = u * gx, fy = v * gy;
      const x0 = Math.floor(fx), y0 = Math.min(gy - 2, Math.max(0, Math.floor(fy)));
      const tx = fx - x0, ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const xa = ((x0 % gx) + gx) % gx, xb = (xa + 1) % gx;
      const top = g[y0 * gx + xa] + (g[y0 * gx + xb] - g[y0 * gx + xa]) * sx;
      const bot = g[(y0 + 1) * gx + xa] + (g[(y0 + 1) * gx + xb] - g[(y0 + 1) * gx + xa]) * sx;
      return top + (bot - top) * sy;
    };
  }
  draw() {
    const cv = this.cv;
    if (!cv || !cv.getContext) return;
    const W = cv.width, H = cv.height;
    const band = this.o.band;
    const HZ = band ? H : Math.round(H * 0.546);
    const ctx = this.ctx || (this.ctx = cv.getContext("2d"));
    const img = this.img && this.img.width === W && this.img.height === H ? this.img : (this.img = ctx.createImageData(W, H));
    const d = img.data;
    const n = this.ramp.length - 1;
    const curve = this.o.scene === "dawn" ? 2.05 : 1.85;
    const t = (Date.now() - this.t0) / 1000;
    const sunX = this.o.scene === "dawn" ? 0.28 : 0.665;
    const put = (x, y, c, k) => {
      const i = (y * W + x) * 4;
      d[i] = c[0] * k; d[i + 1] = c[1] * k; d[i + 2] = c[2] * k; d[i + 3] = 255;
    };

    for (let y = 0; y < Math.min(HZ, H); y++) {
      const v = Math.pow(y / Math.max(1, HZ - 1), 1 / curve);
      for (let x = 0; x < W; x++) {
        const cloud = this.noise((x / W) + t * 0.004, y / Math.max(1, HZ));
        const sun = Math.max(0, 1 - Math.hypot((x / W - sunX) * 2.1, (y - HZ + 8) / (HZ * 0.9)));
        const f = v * n + BAYER[(y & 3) * 4 + (x & 3)] * 1.15 + (cloud - 0.5) * 1.6 + sun * 3.2;
        put(x, y, this.ramp[Math.max(0, Math.min(n, Math.round(f)))], 1);
      }
    }

    if (!band) {
      const land = this.o.scene === "dawn" ? [0x5D, 0x68, 0x78] : [0x3A, 0x33, 0x50];
      const far = this.o.scene === "dawn" ? [0x38, 0x43, 0x4F] : [0x1D, 0x18, 0x29];
      for (let x = 0; x < W; x++) {
        const h1 = 5 + Math.round(this.noise(x / W * 2.4, 0.2) * 9);
        const h2 = 3 + Math.round(this.noise(x / W * 4.1, 0.7) * 5);
        for (let y = HZ - h1; y < HZ; y++) if (y >= 0) put(x, y, land, 1);
        for (let y = HZ - h2; y < HZ; y++) if (y >= 0) put(x, y, far, 1);
      }
      const tint = this.o.scene === "dawn" ? [58, 70, 84] : [12, 20, 32];
      for (let y = HZ; y < H; y++) {
        const depth = (y - HZ) / Math.max(1, H - HZ);
        const src = Math.max(0, HZ - 1 - Math.round((y - HZ) * 1.35));
        const v = Math.pow(src / Math.max(1, HZ - 1), 1 / curve);
        const shim = ((y - HZ) % 3 === 0) ? Math.sin((y * 3 + t * 26) * 0.6) * 1.1 : 0;
        for (let x = 0; x < W; x++) {
          const f = v * n + BAYER[(y & 3) * 4 + (x & 3)] * 1.4 + shim;
          const c = this.ramp[Math.max(0, Math.min(n, Math.round(f)))];
          const mix = 0.34 + depth * 0.26, dim = 0.62 - depth * 0.16;
          put(x, y, [c[0] * (1 - mix) + tint[0] * mix, c[1] * (1 - mix) + tint[1] * mix,
                     c[2] * (1 - mix) + tint[2] * mix], dim);
        }
      }
      const reed = this.o.scene === "dawn" ? [0x1B, 0x24, 0x30] : [0x0B, 0x09, 0x12];
      const rr = mulberry32(41);
      for (let i = 0; i < 46; i++) {
        const x = Math.floor(rr() * W), h = 5 + Math.floor(rr() * 16);
        const base = HZ + 4 + Math.floor(rr() * (H - HZ - 6));
        const sway = Math.round(Math.sin(t * 0.7 + i) * 1.2);
        for (let y = base - h; y < base; y++) {
          const xx = x + Math.round(sway * (base - y) / Math.max(1, h));
          if (xx >= 0 && xx < W && y >= 0 && y < H) put(xx, y, reed, 1);
        }
      }
      this.bird(put, W, H, HZ, t);
    }
    ctx.putImageData(img, 0, 0);
  }
  bird(put, W, H, HZ, t) {
    const body = this.o.scene === "dawn" ? [0x0E, 0x14, 0x1E] : [0x07, 0x05, 0x0C];
    const rim = hexToRgb(this.o.scene === "dawn" ? "#F4EEE0" : "#F4CB9F");
    const s = 0.62;
    const bx = Math.round(W * (this.o.scene === "dawn" ? 0.20 : 0.68));
    const by = Math.round(HZ + (H - HZ) * 0.30);
    const dip = Math.sin(t * 0.42) > 0.93 ? 7 : 0;
    const MARK = [
      [24, 4, 9, 6, "head"], [33, 6, 12, 3, "beak"], [25, 10, 5, 10, "head"],
      [12, 20, 21, 11, "body"], [18, 31, 3, 13, "body"], [14, 44, 8, 2, "body"],
      [25, 31, 3, 6, "body"], [28, 37, 5, 3, "body"]
    ];
    for (const [rx, ry, rw, rh, part] of MARK) {
      const moves = part !== "body";
      const x0 = Math.round(bx + rx * s), y0 = Math.round(by + ry * s + (moves ? dip : 0));
      const x1 = Math.round(bx + (rx + rw) * s), y1 = Math.round(by + (ry + rh) * s + (moves ? dip : 0));
      for (let y = y0; y < Math.max(y0 + 1, y1); y++) {
        for (let x = x0; x < Math.max(x0 + 1, x1); x++) {
          if (x < 0 || x >= W || y < 0 || y >= H) continue;
          put(x, y, part === "beak" ? rim : body, 1);
        }
      }
    }
    const edge = Math.round(bx + 33 * s) - 1;
    for (let y = Math.round(by + 20 * s); y < Math.round(by + 31 * s); y++) {
      if (edge >= 0 && edge < W && y >= 0 && y < H) put(edge, y, rim, 0.85);
    }
  }
  /*
   * start() has to be able to follow stop(), because a scene is now paused
   * when it scrolls out of view and resumed when it comes back. The previous
   * pair could not: stop() set a flag that start() never cleared, so the first
   * time a closing band left the viewport it went still for good.
   *
   * `running` is separate from `dead` so that a second start() cannot leave two
   * loops painting the same canvas, which halves the frame interval and makes
   * the water shimmer at double speed.
   */
  start() {
    if (this.running) return;
    this.dead = false;
    this.running = true;
    const loop = () => {
      if (this.dead) { this.running = false; return; }
      this.draw();
      this.raf = requestAnimationFrame(() => setTimeout(loop, 70));
    };
    loop();
  }
  stop() { this.dead = true; cancelAnimationFrame(this.raf); }
}

