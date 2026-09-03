
/* ── Three landscapes a heron would stand in ──────────────────────────────
   Each is drawn into a 384×216 buffer and scaled 5× with nearest-neighbour,
   so every pixel is a real pixel and it lands exactly on 1920×1080. Every
   motion is a whole number of cycles across LOOP and phase comes off the wall
   clock, so the loop is seamless and a throttled tab rejoins in place.     */

let W = 216, H = 216, HZ = 132, WATER = 84;
const LOOP = 240000;
export { LOOP };
export const SCENE_META = {};

function pack(h) {
  const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);
  return (255 << 24) | (b << 16) | (g << 8) | r;
}
const vnoise = (x, y, sh) => {
  const s = 1 << sh, fx = (x % s) / s, fy = (y % s) / s;
  const x0 = x >> sh, y0 = y >> sh;
  const a = hash2(x0, y0), b = hash2(x0 + 1, y0);
  const c = hash2(x0, y0 + 1), d = hash2(x0 + 1, y0 + 1);
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
};
const hash2 = (x, y) => {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const BAYER = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v => v / 16 - 0.47);

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Value noise on a grid that wraps in x, so any layer can scroll forever. */
function noiseField(gx, gy, rng) {
  const g = new Float32Array(gx * gy);
  for (let i = 0; i < g.length; i++) g[i] = rng();
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

/* Two fishing bouts and four steps in every loop. */
const EVENTS = [
  { id: "fish1", kind: "fish", at: 0.20, secs: 9 },
  { id: "step1", kind: "step", at: 0.36, secs: 1.8, dir: 1 },
  { id: "step2", kind: "step", at: 0.47, secs: 1.8, dir: -1 },
  { id: "fish2", kind: "fish", at: 0.66, secs: 9 },
  { id: "step3", kind: "step", at: 0.86, secs: 1.8, dir: 1 },
  { id: "step4", kind: "step", at: 0.93, secs: 1.8, dir: -1 },
];

const BODY_MASK = [
  "..........#####.....",
  ".......##########...",
  "....##############..",
  "..#################.",
  ".###################",
  "####################",
  "####################",
  "###WWWWWWWWWW#######",
  ".WWWWWWWWWWWW#######",
  "..WWWWWWWWWWW######.",
  "...WWWWWWWW########.",
  "....#############...",
  "......##########....",
  ".........######.....",
];
const BODY_AX = 10, BODY_AY = 6;

/* ── Hilltop sunset constants & helpers ──────────────────────────────────── */
const HT_CLOUD = ["#1E1A2E","#2A2340","#3D2F52","#553C61","#734C6C","#966073","#BC7878","#DE9B7E","#EBB289","#F4CB9F"].map(pack);
const HT_RIDGE_DARK = pack("#0E0B18");
const HT_HILL = ["#08060E","#0C0912","#120E1A","#1A1424"].map(pack);
const HT_GRASS = ["#0A0810","#100C18","#181222"].map(pack);
const HT_SEED = pack("#4A3A46");
const HT_MIST = pack("#C9A9A4");
const HT_SUN_CORE = pack("#FFF4DA"), HT_SUN_EDGE = pack("#FAE0BC");
const HT_HERON = {
  body: pack("#07050C"), wing: pack("#0C0914"),
  rim: pack("#F4CB9F"), rimLow: pack("#A96B75"), eye: pack("#FBF8F4"), bill: pack("#8A5638")
};
const HT_RANKS = [
  { crest: 120, fade: 0.93, rough: 0.24, f: [0.0090, 0.0230, 0.0510], a: [5.4, 2.2, 0.9] },
  { crest: 128, fade: 0.85, rough: 0.42, f: [0.0110, 0.0290, 0.0620], a: [5.4, 2.6, 1.2] },
  { crest: 137, fade: 0.72, rough: 0.60, f: [0.0130, 0.0330, 0.0730], a: [6.0, 3.0, 1.5] },
  { crest: 148, fade: 0.52, rough: 0.76, f: [0.0150, 0.0380, 0.0850], a: [6.6, 3.4, 1.8] },
  { crest: 160, fade: 0.24, rough: 0.90, f: [0.0170, 0.0430, 0.0960], a: [7.2, 3.8, 2.1] },
];
const HT_HERON_X = Math.round(384 * 0.30);
const htClamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const htLerp = (a, b, k) => a + (b - a) * k;
const htSs = k => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
const htRgb = c => [c & 255, (c >> 8) & 255, (c >> 16) & 255];
const htMixc = (a, b, k) => {
  const [r1, g1, b1] = htRgb(a), [r2, g2, b2] = htRgb(b);
  return (255 << 24) | (Math.round(b1 + (b2 - b1) * k) << 16)
    | (Math.round(g1 + (g2 - g1) * k) << 8) | Math.round(r1 + (r2 - r1) * k);
};
const htHash2 = (x, y) => {
  let h = (Math.round(x) * 374761393 + Math.round(y) * 668265263) | 0;
  h = (h ^ (h >>> 13)) * 1274126177 | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const SCENES = {
  dusk: {
    label: "Dusk marsh", hz: 128,
    title: "The marsh at dusk.",
    alt: "Pixel art of a heron standing in a marsh at dusk",
    sky: ["#171326","#1C1830","#221D37","#2A2340","#332949","#3D2F52","#48355A","#553C61","#634468",
          "#734C6C","#845670","#966073","#A96B75","#BC7878","#CE8878","#DE9B7E","#EBB289","#F4CB9F","#FAE0BC"],
    curve: 1.85,
    sun: { x: 0.665, y: 118, glow: 4.6, r: 30, disc: true },
    clouds: { style: "streak", layers: [
      { y0: 5, h: 52, speed: 1, thr: 0.52, mul: 1.0 },
      { y0: 26, h: 54, speed: 2, thr: 0.55, mul: 0.9 },
      { y0: 54, h: 54, speed: 3, thr: 0.60, mul: 0.8 } ] },
    land: { style: "conifer", ridge: "#3A3350", far: "#2B2438", mid: "#1D1829", bank: "#12101C" },
    water: { tint: [12, 20, 32], mix: 0.34, mixDepth: 0.26, dim: 0.62, dimDepth: 0.16,
             shimStep: 5, glint: 0.62, cap: null },
    reeds: { colour: "#0B0912", alt: null, count: 46, cat: "#3A2418" },
    heron: { x: 124, base: 186, body: "#07050C", rim: "#F4CB9F", rimLow: "#A96B75", eye: "#FBF8F4" },
    mote: { colour: "#F2C79A", hot: "#FBF8F4", count: 0 },
    birds: 3, mist: null, stars: 0,
  },

  dawn: {
    label: "Dawn river", hz: 130,
    title: "First light on the river.",
    alt: "Pixel art of a heron in a misty river at dawn",
    sky: ["#20293B","#273245","#2E3B4F","#364459","#3F4D63","#49576D","#546177","#606C81","#6E788A",
          "#7D8492","#8D9199","#9E9EA0","#AFACA8","#C0BAB0","#D0C8BA","#DED6C6","#EAE3D3","#F4EEE0","#FBF8F4"],
    curve: 2.05,
    sun: { x: 0.28, y: 112, glow: 3.4, r: 34, disc: false },
    clouds: { style: "streak", layers: [
      { y0: 4, h: 48, speed: 1, thr: 0.58, mul: 0.75 },
      { y0: 24, h: 52, speed: 2, thr: 0.56, mul: 0.85 },
      { y0: 52, h: 52, speed: 3, thr: 0.62, mul: 0.7 } ] },
    land: { style: "ridges", ridge: "#5D6878", far: "#4A5666", mid: "#38434F", bank: "#28303C" },
    water: { tint: [58, 70, 84], mix: 0.40, mixDepth: 0.20, dim: 0.74, dimDepth: 0.14,
             shimStep: 5, glint: 0.62, cap: null },
    sparkle: false,
    reeds: { colour: "#1B2430", alt: "#2A3644", count: 40, cat: "#3E3226" },
    heron: { x: 50, base: 188, body: "#0E141E", rim: "#F4EEE0", rimLow: "#8D9199", eye: "#FBF8F4" },
    mote: { colour: "#DED6C6", hot: "#FBF8F4", count: 0 },
    birds: 2, mist: { y0: 104, h: 70, speed: -2, strength: 0.62, colour: [222, 214, 198] }, stars: 0,
  },

  summer: {
    label: "The glade", hz: 112,
    title: "A clearing, mid-morning.",
    alt: "Pixel art of a sunlit forest glade with a still pool and a heron at its edge",
    layout: "creek",
    sky: ["#8CBCDE","#98C4E3","#A3CBE7","#AED2EB","#B8D9EF","#C2DFF2","#CBE4F5","#D4E9F7","#DCEEF9",
          "#E3F2FB","#E9F5FC","#EEF8FD","#F2FAFE","#F6FBFE","#F9FDFF","#FBFDFF","#FDFEFF","#FEFFFF","#FFFFFF"],
    curve: 2.4,
    sun: { x: 0.52, y: 4, glow: 2.8, r: 40, disc: false },
    creek: {
      hz: 112,
      shade:  ["#040B06", "#08130A", "#0C1D10", "#122916", "#18351B"],
      wood:   ["#0A1F11", "#0F2B16", "#16391C", "#1E4A23", "#296030"],
      lit:    ["#3E8A38", "#55A542", "#70C24E", "#8FD95F", "#B0EC74"],
      floor:  ["#0E2A13", "#153719", "#1D4720", "#275A28", "#336F31", "#43873B"],
      trunk:  ["#0C0805", "#150F09", "#1F160D", "#2B1F13", "#3A2A1A", "#4E3924", "#664C31"],
      moss:   ["#1A3315", "#26491E", "#356328"],
      bloom: { pale: ["#E8F0D0", "#FFF6DC", "#D8E8F4"], warm: ["#C86A28", "#E89040"], cool: ["#8A6EB4", "#B292D8"] },
      pond: { deep: "#071A26", mid: "#0E2C3C", cool: "#16414F" },
      rock: ["#22201C", "#302D28", "#141311", "#464137", "#5C5648"],
      shaft: "#FFF6D4",
    },
    water: { tint: [34, 82, 96], mix: 0.36, mixDepth: 0.22, dim: 0.82, dimDepth: 0.12,
             shimStep: 5, glint: 0.5, cap: "#DCEAF0" },
    reeds: { colour: "#0C2214", alt: "#1A3E24", count: 0, cat: "#4A3520" },
    heron: { x: 54, base: 148, body: "#050D12", rim: "#3E6478", rimLow: "#22404F", eye: "#9FC0D0" },
    mote: { colour: "#FFF8D0", hot: "#FFFFFF", count: 0 },
    birds: 0, mist: null, stars: 0,
  },

  winterglade: {
    label: "The glade, in winter", hz: 112,
    title: "The glade, in January.",
    alt: "Pixel art of a forest glade in winter: snow on the evergreens, the pool frozen over, a heron standing on the ice",
    layout: "creek", sparkle: false,
    /* Overcast. Cool grey overhead, hazing paler toward the horizon, and never
       reaching white — the snow has to out-value the sky. */
    sky: ["#7E8B99","#87939F","#8F9AA6","#97A2AC","#9FA9B2","#A6B0B8","#ADB6BE","#B4BCC3","#BAC2C8",
          "#C1C7CD","#C7CCD2","#CCD1D6","#D1D6DA","#D6DADE","#DADEE1","#DEE1E4","#E1E4E7","#E4E7E9","#E7E9EB"],
    curve: 1.35,
    sun: { x: 0.52, y: 8, glow: 1.2, r: 46, disc: false },
    creek: {
      hz: 112,
      /* evergreen, desaturated by cold light — these hold the picture's darks */
      shade:  ["#080D0C", "#0C1412", "#101B18", "#15221E", "#1A2A24"],
      wood:   ["#0A1614", "#0F201B", "#152A23", "#1B342B", "#223F34"],
      lit:    ["#2E4A3E", "#3A5849", "#476655", "#557463", "#658472"],
      floor:  ["#0C0E0D", "#111412", "#171B17", "#1D211C", "#242922", "#2B3029"],
      /* wet bark under a grey sky: cooler and darker than August bark */
      trunk:  ["#0A0A0A", "#131312", "#1C1B18", "#26241F", "#332F27", "#443F34", "#565044"],
      moss:   ["#15200F", "#1C2916", "#24331C"],
      bloom: { pale: ["#E4EAEE", "#F0F4F6", "#D2DDE4"], warm: ["#8A6A56", "#A6836A"], cool: ["#6E7C90", "#8E9AAC"] },
      pond: { deep: "#101C22", mid: "#17282F", cool: "#20353D" },
      rock: ["#1E1F20", "#2B2C2D", "#121313", "#3E4042", "#54565A"],
      shaft: "#EAF0F4",
      ice: { hi: "#D2DDE4", lo: "#9EB2BE", dark: "#56707E", crack: "#3E5866" },
      winter: {
        /* a bare crown at 384 across is a haze, not a set of lines */
        bare: ["#2A2E31", "#363A3E", "#43474B", "#515559", "#5F6368"],
        /* lit · resting · in shadow, and the shadow is blue */
        snow: ["#F4F7F9", "#DFE6EB", "#C4CED8"],
      },
    },
    water: { tint: [32, 54, 62], mix: 0.30, mixDepth: 0.20, dim: 0.86, dimDepth: 0.10,
             shimStep: 6, glint: 0.34, cap: "#D2DDE4" },
    reeds: { colour: "#20241D", alt: "#31362B", count: 0, cat: "#4A4030" },
    heron: { x: 168, base: 148, body: "#050D12", rim: "#B4BCC3", rimLow: "#5E7280", eye: "#D2DDE4" },
    mote: { colour: "#E7E9EB", hot: "#F4F7F9", count: 0 },
    birds: 0, mist: null, stars: 0,
  },
  winter: {
    label: "Winter marsh", hz: 132,
    title: "The marsh, frozen over.",
    alt: "Pixel art of a heron standing on a frozen marsh in winter",
    sky: ["#2A3348","#303A50","#374158","#3E4860","#464F68","#4E5770","#565F78","#5F6880","#687189",
          "#727B91","#7D869A","#8991A2","#969DAA","#A4AAB4","#B3B8BF","#C3C6CA","#D3D5D5","#E4E3E0","#F4F1EA"],
    curve: 2.2,
    sun: { x: 0.74, y: 116, glow: 3.0, r: 26, disc: true },
    clouds: { style: "streak", layers: [
      { y0: 6, h: 54, speed: 1, thr: 0.50, mul: 0.8 },
      { y0: 30, h: 56, speed: 2, thr: 0.54, mul: 0.7 },
      { y0: 58, h: 52, speed: 3, thr: 0.60, mul: 0.6 } ] },
    land: { style: "conifer", ridge: "#4A5468", far: "#333B52", mid: "#20263A", bank: "#161B2A" },
    frost: { hi: "#EDEDE8", lo: "#C4C8CE" },
    water: { tint: [196, 204, 212], mix: 0.66, mixDepth: 0.10, dim: 0.88, dimDepth: 0.06,
             shimStep: 8, glint: 0.30, cap: "#F4F1EA" },
    reeds: { colour: "#8E7C5C", alt: "#C0AC84", count: 34, cat: "#5A4630" },
    heron: { x: 130, base: 182, body: "#141A26", rim: "#F4F1EA", rimLow: "#969DAA", eye: "#FBF8F4" },
    mote: { colour: "#E4E3E0", hot: "#FFFFFF", count: 8 },
    snow: { count: 130, colour: "#F4F1EA", dim: "#C7CBD2", speed: 0.9, sway: 5 },
    birds: 2, mist: null, stars: 0,
  },

  street: {
    label: "The street at dusk", hz: 150,
    title: "Fifty-eight lots, one street.",
    alt: "Pixel art of a suburban street at dusk, lit windows and a heron standing in the road",
    layout: "street", dry: true, sparkle: false,
    sky: ["#12101C","#191627","#201C33","#28223D","#312948","#3B3152","#463A5B","#524465","#5F4E6E",
          "#6C5875","#7A637B","#8A6F82","#9B7C88","#AD8A8F","#BF9A97","#D0AB9F","#DEBEAB","#EBD2BE","#F6E6D4"],
    curve: 1.9,
    sun: { x: 0.16, y: 142, glow: 3.6, r: 34, disc: false },
    clouds: { style: "streak", layers: [
      { y0: 6, h: 60, speed: 1, thr: 0.54, mul: 0.95 },
      { y0: 34, h: 60, speed: 2, thr: 0.58, mul: 0.85 },
      { y0: 68, h: 56, speed: 3, thr: 0.62, mul: 0.7 } ] },
    town: {
      trunk: ["#080610", "#0E0B18", "#151020", "#1E1830", "#2A2138"],
      canopy: "#0A0812", tree: "#161228", treeFar: "#221C34",
      wallA: "#241E33", sidingA: "#2B2440", roofA: "#161220", trimA: "#3E3450",
      wallB: "#332B46", sidingB: "#3A3150", roofB: "#241E33",
      lawn: "#1E1A2A", lawnLit: "#2A2438", hedge: "#14101E",
      kerb: "#463D56", road: "#131019", roadLit: "#1C1826",
      grass: "#09070E", grassTip: "#120F1A",
      win: "#F4CB9F", winDim: "#C98A4E", winOff: "#2A2438", lamp: "#F4CB9F", pool: "#E8A87C",
    },
    water: { tint: [22, 20, 30], mix: 0.6, mixDepth: 0.1, dim: 0.5, dimDepth: 0.1, shimStep: 7, glint: 0, cap: null },
    reeds: { colour: "#0C0A14", alt: null, count: 0, cat: "#0C0A14" },
    heron: { x: 146, base: 186, body: "#07050C", rim: "#C99A72", rimLow: "#6C5875", eye: "#F4CB9F" },
    mote: { colour: "#F4CB9F", hot: "#FBF8F4", count: 0 },
    birds: 0, mist: null, stars: 0,
  },

  storm: {
    label: "Storm over the lake", hz: 126,
    title: "Weather comes anyway.",
    alt: "Pixel art of a heron on a lake shore under a summer storm",
    sky: ["#171A20","#1D2027","#23272F","#2A2E37","#31353F","#393D47","#41454F","#4A4E57","#535760",
          "#5C6069","#666971","#70737A","#7B7D83","#86888D","#929397","#9E9EA1","#AAAAAB","#B7B6B6","#C4C2C0"],
    curve: 1.6,
    sun: { x: 0.62, y: 100, glow: 2.6, r: 30, disc: false },
    clouds: { style: "streak", layers: [
      { y0: 2, h: 60, speed: 1, thr: 0.44, mul: 1.3 },
      { y0: 20, h: 62, speed: 2, thr: 0.48, mul: 1.15 },
      { y0: 54, h: 56, speed: 3, thr: 0.54, mul: 0.95 } ] },
    land: { style: "ridges", ridge: "#454B55", far: "#363C46", mid: "#282D36", bank: "#1C2028" },
    water: { tint: [40, 46, 54], mix: 0.48, mixDepth: 0.18, dim: 0.70, dimDepth: 0.14,
             shimStep: 6, glint: 0.5, cap: "#C0C4C6" },
    reeds: { colour: "#151A20", alt: "#232A32", count: 36, cat: "#3A3226" },
    heron: { x: 138, base: 180, body: "#0A0D12", rim: "#6E727A", rimLow: "#4A4E57", eye: "#C4C2C0" },
    mote: { colour: "#9E9EA1", hot: "#C4C2C0", count: 0 },
    rain: { count: 150, colour: "#C8CDD2", len: 5, slant: 0.38, speed: 26 },
    birds: 2, mist: null, stars: 0,
  },

  autumn: {
    label: "Autumn treeline", hz: 130,
    title: "The year turns over.",
    alt: "Pixel art of an autumn treeline reflected in still water with a heron",
    sky: ["#2F4759","#375065","#405A70","#49647A","#536E84","#5E788D","#6A8296","#778C9E","#8496A6",
          "#92A1AD","#A0ABB4","#AEB6BC","#BBC0C3","#C8CBCB","#D4D5D2","#DFDED9","#E9E6DF","#F2EEE5","#FAF7EE"],
    curve: 2.1,
    sun: { x: 0.80, y: 110, glow: 3.0, r: 30, disc: false },
    clouds: { style: "streak", layers: [
      { y0: 6, h: 50, speed: 1, thr: 0.60, mul: 0.85 },
      { y0: 30, h: 54, speed: 2, thr: 0.62, mul: 0.7 } ] },
    land: { style: "deciduous", ridge: "#3E2E22", far: "#8A4B2A", mid: "#B4692C", bank: "#241C16" },
    water: { tint: [46, 40, 34], mix: 0.34, mixDepth: 0.22, dim: 0.78, dimDepth: 0.14,
             shimStep: 5, glint: 0.66, cap: null },
    sparkle: false,
    reeds: { colour: "#2A1F16", alt: "#4A3520", count: 44, cat: "#6A4A28" },
    heron: { x: 58, base: 186, body: "#120D08", rim: "#F2EEE5", rimLow: "#B4692C", eye: "#FBF8F4" },
    mote: { colour: "#E8A87C", hot: "#F4CB9F", count: 0 },
    birds: 3, mist: null, stars: 0,
  },

  hilltop: {
    label: "Hilltop sunset", hz: 128,
    title: "A heron on a hilltop at sundown.",
    alt: "Pixel art of a heron standing on a hilltop watching the sun set over receding ridges",
    layout: "hilltop",
    sky: ["#171326","#1C1830","#221D37","#2A2340","#332949","#3D2F52","#48355A","#553C61","#634468",
          "#734C6C","#845670","#966073","#A96B75","#BC7878","#CE8878","#DE9B7E","#EBB289","#F4CB9F","#FAE0BC"],
    sun: { x: 0.68, y: 122, r: 9, disc: true },
    curve: 1.95,
  },
};

for (const k of Object.keys(SCENES))
  SCENE_META[k] = { label: SCENES[k].label, title: SCENES[k].title, alt: SCENES[k].alt };

export class SceneEngine {
  constructor(canvas, sceneKey, opts) {
    this.cv = canvas;
    this.key = sceneKey;
    this.opts = opts || {};
    W = this.opts.w || 216; H = this.opts.h || 216;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.img = this.ctx.createImageData(W, H);
    this.buf = new Uint32Array(this.img.data.buffer);
    this.state = { scene: sceneKey };
    this.build(sceneKey);
  }

  size() { W = this.opts.w || 216; H = this.opts.h || 216; }

  /* ── static layers ──────────────────────────────────────────────────── */
  build(key) {
    const k = key || this.state.scene;
    const S = SCENES[k] || SCENES.dusk;
    this.S = S;
    this.size();
    HZ = S.hz || 132; WATER = H - HZ;
    this.builtFor = k;
    const rng = mulberry32((this.opts && this.opts.seed) || 20260811);

    const SKY = S.sky.map(pack);
    const SKY_N = SKY.length - 1;
    this.SKY = SKY; this.SKY_N = SKY_N;
    if (S.layout === "hilltop") {
      this.buildHilltop(S, rng);
      this.lit = [250, 224, 188];
      return;
    }

    this.sunX = W * S.sun.x;
    this.sunY = S.sun.y;

    const glow = new Float32Array(W * HZ);
    const R = S.sun.r;
    for (let y = 0; y < HZ; y++) {
      for (let x = 0; x < W; x++) {
        const dx = (x - this.sunX) / 1.45, dy = y - this.sunY;
        glow[y * W + x] = Math.exp(-(dx * dx + dy * dy) / (2 * R * R));
      }
    }
    this.glow = glow;

    /* The light pools near the horizon rather than spreading evenly. */
    const rowIdx = new Float32Array(HZ);
    for (let y = 0; y < HZ; y++) rowIdx[y] = Math.pow(y / HZ, S.curve) * SKY_N;
    this.rowIdx = rowIdx;

    const sky = new Uint32Array(W * H);
    for (let y = 0; y < HZ; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const p = rowIdx[y] + glow[i] * S.sun.glow + BAYER[(y & 3) * 4 + (x & 3)] * 0.95;
        sky[i] = SKY[Math.max(0, Math.min(SKY_N, Math.round(p)))];
      }
    }

    /* Stars, before anything is drawn over them. */
    for (let i = 0; i < S.stars; i++) {
      const x = Math.floor(rng() * W), y = Math.floor(rng() * HZ * 0.42);
      if (rowIdx[y] > SKY_N * 0.34) continue;
      sky[y * W + x] = SKY[Math.min(SKY_N, Math.round(rowIdx[y] + 5 + rng() * 4))];
    }

    if (S.sun.disc) {
      for (let y = -6; y <= 6; y++) {
        for (let x = -7; x <= 7; x++) {
          const q = x * x * 0.8 + y * y;
          if (q > 34) continue;
          const px = Math.round(this.sunX) + x, py = Math.round(this.sunY) + y;
          if (px < 0 || px >= W || py < 0 || py >= HZ) continue;
          sky[py * W + px] = q > 20 ? SKY[SKY_N] : pack("#FBF8F4");
        }
      }
    }
    this.sky = sky;

    this.layers = !S.clouds ? [] : S.clouds.layers.map(L => {
      const field = new Float32Array(W * L.h);
      if (S.clouds.style === "cumulus") {
        /* Puffy tops, flattish bottoms, and real gaps between the masses. */
        const p1 = noiseField(5, 2, rng), p2 = noiseField(13, 4, rng), p3 = noiseField(27, 8, rng);
        for (let x = 0; x < W; x++) {
          const u = x / W;
          const presence = p1(u, 0.2) * 0.62 + p2(u, 0.5) * 0.26 + p3(u, 0.8) * 0.12;
          const amount = presence - L.thr;
          if (amount <= 0) continue;
          const mass = Math.min(1, amount * 3.2);
          const top = Math.round(L.h * (0.84 - mass * 0.74));
          const bottom = Math.round(L.h * 0.82);
          for (let y = top; y < bottom; y++) {
            const f = 1 - (y - top) / Math.max(1, bottom - top);
            const edge = Math.min(1, (bottom - y) / 3, mass * 4);
            field[y * W + x] = Math.max(0, f * 0.85 + 0.15) * edge;
          }
        }
      } else {
        /* Wide and short — the way cloud streaks at the ends of the day. */
        const n1 = noiseField(9, 4, rng), n2 = noiseField(19, 8, rng), n3 = noiseField(37, 14, rng);
        for (let y = 0; y < L.h; y++) {
          const qv = (Math.floor(y / 2) * 2) / L.h;
          const fade = Math.sin(Math.PI * Math.min(1, Math.max(0, y / L.h)));
          for (let x = 0; x < W; x++) {
            const u = x / W;
            const d = n1(u, qv) * 0.58 + n2(u, qv) * 0.29 + n3(u, qv) * 0.13;
            const v = d * (0.55 + fade * 0.75) - L.thr;
            field[y * W + x] = v > 0 ? Math.min(1, v * 3.4) : 0;
          }
        }
      }
      return { ...L, field };
    });

    /* Land. */
    const land = new Uint32Array(W * H);
    const put = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) land[y * W + x] = c; };
    const L = S.land || { style: "none" };

    if (L.style === "ridges") {
      /* Four ridges, each lighter than the one in front — distance as haze. */
      const tones = [pack(L.ridge), pack(L.far), pack(L.mid), pack(L.bank)];
      const tops = [26, 20, 14, 8];
      for (let k = 0; k < 4; k++) {
        const seed = k * 3.1;
        for (let x = 0; x < W; x++) {
          const h = tops[k] + Math.sin(x * (0.013 + k * 0.006) + seed) * (7 - k)
            + Math.sin(x * (0.041 + k * 0.02) + seed * 2) * (3.4 - k * 0.6)
            + Math.sin(x * 0.13 + seed) * 1.1;
          for (let y = HZ - Math.round(h); y < HZ; y++) put(x, y, tones[k]);
        }
      }
      /* A thin rank of conifers on the near bank to break the ridgeline. */
      for (let i = 0; i < Math.round(W * 0.07); i++) {
        const cx = Math.round(rng() * (W + 16) - 8);
        const th = Math.round(7 + rng() * 11), tw = Math.max(2, Math.round(th * 0.32));
        for (let r = 0; r < th; r++) {
          let hw = Math.round(tw * Math.pow(r / th, 0.78));
          if (r % 3 === 2) hw = Math.max(0, hw - 1);
          for (let x = cx - hw; x <= cx + hw; x++) put(x, HZ - th + r, pack(L.bank));
        }
      }
    } else if (L.style === "deciduous") {
      for (let x = 0; x < W; x++) {
        const h = 9 + Math.sin(x * 0.017) * 5 + Math.sin(x * 0.045 + 1.2) * 3 + Math.sin(x * 0.1) * 1.4;
        for (let y = HZ - Math.round(h) - 3; y < HZ; y++) put(x, y, pack(L.ridge));
      }
      /* Canopy as overlapping crowns: a shaded rank behind, two lit ranks in
         front, small enough that the gaps between them stay legible. */
      const crowns = [
        [pack(L.ridge), Math.round(W * 0.13), 5, 9],
        [pack(L.far), Math.round(W * 0.10), 4, 8],
        [pack(L.mid), Math.round(W * 0.07), 4, 7],
      ];
      for (const [colour, count, minR, maxR] of crowns) {
        for (let i = 0; i < count; i++) {
          const cx = Math.round(rng() * (W + 30) - 15);
          const r = minR + rng() * (maxR - minR);
          const cy = HZ - 3 - r * (0.5 + rng() * 0.75);
          for (let y = -r - 2; y <= r + 2; y++) {
            for (let x = -r - 2; x <= r + 2; x++) {
              const q = (x * x) / (r * r * 1.35) + (y * y) / (r * r * 0.8);
              if (q > 1) continue;
              const py = Math.round(cy + y);
              if (py >= HZ) continue;
              put(Math.round(cx + x), py, colour);
            }
          }
        }
      }
      for (let i = 0; i < Math.round(W * 0.09); i++) {
        const tx = Math.round(rng() * W);
        const th = 5 + Math.round(rng() * 9);
        for (let y = HZ - th; y < HZ; y++) { put(tx, y, pack(L.bank)); if (rng() < 0.4) put(tx + 1, y, pack(L.bank)); }
      }
      for (let x = 0; x < W; x++) {
        const h = 2 + Math.round(Math.abs(Math.sin(x * 0.07) * 2.4 + Math.sin(x * 0.28) * 1.4));
        for (let y = HZ - h; y < HZ; y++) put(x, y, pack(L.bank));
      }
    } else if (L.style === "conifer") {
      for (let x = 0; x < W; x++) {
        const h = 6 + Math.sin(x * 0.021) * 4 + Math.sin(x * 0.052 + 1.7) * 2.5 + Math.sin(x * 0.11) * 1.2;
        for (let y = HZ - Math.round(h) - 2; y < HZ; y++) put(x, y, pack(L.ridge));
      }
      const conifers = (baseY, count, minH, maxH, colour) => {
        for (let i = 0; i < count; i++) {
          const cx = Math.round(rng() * (W + 20) - 10);
          const th = Math.round(minH + rng() * (maxH - minH));
          const tw = Math.max(2, Math.round(th * (0.30 + rng() * 0.16)));
          for (let r = 0; r < th; r++) {
            /* Stepping the half-width in threes gives the branch sawtooth. */
            let hw = Math.round(tw * Math.pow(r / th, 0.78));
            if (r % 3 === 2) hw = Math.max(0, hw - 1);
            for (let x = cx - hw; x <= cx + hw; x++) put(x, baseY - th + r, colour);
          }
          for (let x = cx - 1; x <= cx + 1; x++) for (let y = baseY - 2; y < baseY; y++) put(x, y, colour);
        }
      };
      conifers(HZ - 1, Math.round(W * 0.12), 10, 22, pack(L.far));
      conifers(HZ, Math.round(W * 0.14), 13, 29, pack(L.mid));
      for (let x = 0; x < W; x++) {
        const h = 1 + Math.round(Math.abs(Math.sin(x * 0.09) * 1.6 + Math.sin(x * 0.31) * 1.1));
        for (let y = HZ - h; y < HZ; y++) put(x, y, pack(L.bank));
      }
    }
    if (S.frost) {
      /* Snow settles on whatever edge faces the sky, dithered so it reads as
         a dusting rather than a coat of paint. */
      const F1 = pack(S.frost.hi), F2 = pack(S.frost.lo);
      for (let x = 0; x < W; x++) {
        for (let y = 0; y < HZ; y++) {
          if (!land[y * W + x]) continue;
          const b = BAYER[(y & 3) * 4 + (x & 3)] + 0.47;
          if (b > 0.30) land[y * W + x] = F1;
          else if (y + 1 < HZ && land[(y + 1) * W + x]) land[(y + 1) * W + x] = F2;
          break;
        }
      }
      for (let x = 0; x < W; x++) {
        const h = 2 + Math.round(Math.abs(Math.sin(x * 0.07) * 1.7 + Math.sin(x * 0.23) * 1.2));
        for (let y = HZ - h; y < HZ; y++)
          land[y * W + x] = (BAYER[(y & 3) * 4 + (x & 3)] + 0.47) > 0.34 ? F1 : F2;
      }
    }
    this.land = land;

    if (S.mist) {
      const m = S.mist;
      const n1 = noiseField(6, 3, rng), n2 = noiseField(15, 6, rng);
      const field = new Float32Array(W * m.h);
      for (let y = 0; y < m.h; y++) {
        const band = Math.sin(Math.PI * (y / m.h));
        const qv = (Math.floor(y / 3) * 3) / m.h;
        for (let x = 0; x < W; x++) {
          const u = x / W;
          const d = n1(u, qv) * 0.68 + n2(u, qv) * 0.32;
          field[y * W + x] = Math.max(0, (d - 0.42) * 2.6) * band;
        }
      }
      this.mist = { ...m, field };
    } else this.mist = null;

    this.reeds = [];
    const RC = pack(S.reeds.colour), RA = S.reeds.alt ? pack(S.reeds.alt) : RC;
    for (let i = 0; i < S.reeds.count; i++) {
      const side = rng();
      let x;
      if (side < 0.42) x = Math.round(rng() * W * 0.26 - 8);
      else if (side < 0.84) x = Math.round(W * 0.74 + rng() * W * 0.3);
      else x = Math.round(W * 0.26 + rng() * W * 0.48);
      this.reeds.push({
        x, base: H - 4 + Math.round(rng() * 10),
        h: Math.round(16 + rng() * (side < 0.84 ? 44 : 18)),
        lean: (rng() - 0.5) * 5, phase: rng() * Math.PI * 2,
        cat: rng() < 0.26, sway: 0.7 + rng() * 1.5,
        colour: rng() < 0.32 ? RA : RC,
      });
    }
    this.catColour = pack(S.reeds.cat);

    this.motes = [];
    for (let i = 0; i < S.mote.count; i++) {
      this.motes.push({ x: rng() * W, y: HZ + 4 + rng() * (WATER - 30), rx: 6 + rng() * 16,
        ry: 3 + rng() * 7, k: 2 + Math.floor(rng() * 4), phase: rng() * Math.PI * 2, br: rng() });
    }
    this.moteC = pack(S.mote.colour);
    this.moteHot = pack(S.mote.hot);

    this.birds = [];
    for (let i = 0; i < S.birds; i++)
      this.birds.push({ y: 30 + rng() * 26, off: rng(), sp: 5 + Math.floor(rng() * 4), sc: rng() < 0.5 ? 1 : 0 });

    this.heron = this.buildHeron();
    if (S.layout === "creek") this.buildCreek(S, rng);
    if (S.layout === "street") this.buildStreet(S, rng);
    this.capC = S.water.cap ? pack(S.water.cap) : 0;
    const bc = S.heron.body, rc = S.heron.rimLow;
    const bl = (a, b, k) => Math.round(parseInt(a, 16) * (1 - k) + parseInt(b, 16) * k);
    this.wingC = (255 << 24)
      | (bl(bc.slice(5, 7), rc.slice(5, 7), 0.13) << 16)
      | (bl(bc.slice(3, 5), rc.slice(3, 5), 0.13) << 8)
      | bl(bc.slice(1, 3), rc.slice(1, 3), 0.13);
    const litHex = S.sky[S.sky.length - 1];
    this.lit = [parseInt(litHex.slice(1, 3), 16), parseInt(litHex.slice(3, 5), 16), parseInt(litHex.slice(5, 7), 16)];
  }

  /* A heron you can pose. Legs, neck and bill are drawn from parameters
     rather than stamped from a sprite, because a sprite cannot bend — which
     is what fishing and stepping both need. */
  buildHeron() { return { w: 30, h: 50 }; }


  drawHeron(t, TAU) {
    /* Ice is a floor. Nothing reflects in it, nothing ripples, and a foot
       coming down on it does not make a ring. */
    const onIce = !!(this.S.creek && this.S.creek.ice);
    const dry = this.S.dry || onIce;
    if (this.opts.showHeron === false || this.S.noHeron) return;
    const buf = this.buf, S = this.S, SKY = this.SKY;
    const base = S.heron.base;
    const BODY = pack(S.heron.body), RIM = pack(S.heron.rim);
    const EYE = pack(S.heron.eye), BILL = pack("#8A4B2A"), WING = this.wingC;
    const ss = k => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
    const lerp = (a, b, k) => a + (b - a) * k;

    /* ── where the bird is in its routine ──────────────────────────────── */
    let fish = 0, fishU = -1, stepU = -1, stepDir = 1;
    for (const e of EVENTS) {
      const dur = e.secs / (LOOP / 1000);
      const d = (t - e.at + 1) % 1;
      if (d >= dur) continue;
      if (e.kind === "fish") { fishU = d / dur; fish = 1; }
      else { stepU = d / dur; stepDir = e.dir; }
    }

    /* Fishing, in the order a heron actually does it: lean, bill-first into
       the water, hold under, lift with a splash, then tip the bill skyward
       to swallow, then settle. */
    let lean = 0, dive = 0, hold = 0, gulp = 0;
    if (fishU >= 0) {
      const u = fishU;
      if (u < 0.16) lean = ss(u / 0.16);
      else if (u < 0.30) { lean = 1; dive = ss((u - 0.16) / 0.14); }
      else if (u < 0.46) { lean = 1; dive = 1; hold = 1; }
      else if (u < 0.58) { lean = 1; dive = 1 - ss((u - 0.46) / 0.12); }
      else if (u < 0.76) { lean = 1 - ss((u - 0.58) / 0.18) * 0.6; gulp = ss((u - 0.58) / 0.09) * (1 - ss((u - 0.67) / 0.09)); }
      else lean = 0.4 * (1 - ss((u - 0.76) / 0.24));
    }

    /* Steps: lift, swing, plant. The body follows a beat behind the foot. */
    let lift = 0, swing = 0, shift = 0;
    if (stepU >= 0) {
      if (stepU < 0.34) { lift = ss(stepU / 0.34); }
      else if (stepU < 0.68) { lift = 1; swing = ss((stepU - 0.34) / 0.34); }
      else { lift = 1 - ss((stepU - 0.68) / 0.32); swing = 1; shift = ss((stepU - 0.68) / 0.32); }
    }
    const planted = stepU < 0 ? 0 : shift;
    let walk = 0;
    for (const e of EVENTS) {
      if (e.kind !== "step") continue;
      const d2 = e.secs / (LOOP / 1000);
      const s0 = e.at + d2 * 0.68, s1 = e.at + d2;
      walk += e.dir * 4 * (t <= s0 ? 0 : t >= s1 ? 1 : ss((t - s0) / (s1 - s0)));
    }
    const ox = S.heron.x + Math.round(walk);

    const px = (x, y, c) => { if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = c; };
    const pts = [];
    let PART = 1;
    const put = (x, y, c) => { x = Math.round(x); y = Math.round(y); pts.push(x, y, c, PART); };
    const disc = (x, y, r, c) => {
      for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++)
        if (i * i + j * j <= r * r + 0.4) put(x + i, y + j, c);
    };

    /* ── geometry ─────────────────────────────────────────────────────── */
    const bodyCX = ox + 12 + lean * 3;
    const bodyCY = base - 26 + lean * 3;
    const hipY = bodyCY + 5;

    /* Legs. One lifts, bends at the knee and swings; the other stays planted. */
    const legX = [ox + 9, ox + 15];
    const moving = stepDir > 0 ? 1 : 0;
    PART = 0;
    for (let n = 0; n < 2; n++) {
      const fx0 = legX[n];
      const act = stepU >= 0 && n === moving;
      const fy = base - (act ? lift * 9 : 0);
      const fx = fx0 + (act ? swing * stepDir * 7 : 0) - (stepU >= 0 && !act ? planted * stepDir * 1.5 : 0);
      const hx = bodyCX - 3 + n * 6;
      const kx = lerp(hx, fx, 0.5) + (act ? lift * 4 * stepDir : 0.6);
      const ky = lerp(hipY, fy, 0.52) - (act ? lift * 3.2 : 0);
      /* hip → knee → foot, one pixel wide, two near the top. */
      for (let k = 0; k <= 14; k++) {
        const q = k / 14;
        put(lerp(hx, kx, q), lerp(hipY, ky, q), BODY);
        if (k < 5) put(lerp(hx, kx, q) + 1, lerp(hipY, ky, q), BODY);
      }
      for (let k = 0; k <= 14; k++) {
        const q = k / 14;
        put(lerp(kx, fx, q), lerp(ky, fy, q), BODY);
      }
    }

    /* Body and tail, straight off the authored mask. */
    PART = 1;
    for (let my = 0; my < BODY_MASK.length; my++) {
      const row = BODY_MASK[my];
      for (let mx = 0; mx < row.length; mx++) {
        const ch = row[mx];
        if (ch === ".") continue;
        put(bodyCX + mx - BODY_AX, bodyCY + my - BODY_AY, ch === "W" ? WING : BODY);
      }
    }

    /* Head: at rest it sits high and slightly forward. Diving carries it out
       and down to the surface; swallowing tips it back and up. */
    let hx = lerp(ox + 20, ox + 28, dive), hy = lerp(base - 47, base - 9, dive);
    hx = lerp(hx, ox + 17, gulp); hy = lerp(hy, base - 50, gulp);
    /* Bill angle: level at rest, steep into the water, near-vertical to swallow. */
    const ang = lerp(lerp(-0.12, 2.08, dive), -1.35, gulp);

    /* Neck: a cubic from the shoulder to the head. The control points carry
       the S at rest and straighten into a forward arc on the dive. */
    const p0x = bodyCX + 5, p0y = bodyCY - 5;
    const c1x = lerp(lerp(ox + 8, ox + 20, dive), ox + 10, gulp);
    const c1y = lerp(lerp(base - 34, base - 24, dive), base - 36, gulp);
    const c2x = lerp(lerp(ox + 23, ox + 27, dive), ox + 14, gulp);
    const c2y = lerp(lerp(base - 42, base - 20, dive), base - 46, gulp);
    for (let k = 0; k <= 46; k++) {
      const q = k / 46, m = 1 - q;
      const nx = m * m * m * p0x + 3 * m * m * q * c1x + 3 * m * q * q * c2x + q * q * q * hx;
      const ny = m * m * m * p0y + 3 * m * m * q * c1y + 3 * m * q * q * c2y + q * q * q * hy;
      const th = q < 0.25 ? 2 : 1;
      for (let i = 0; i <= th; i++) put(nx + i - (th > 1 ? 1 : 0), ny, BODY);
      put(nx, ny + 1, BODY);
    }

    PART = 2;
    const ux = Math.cos(ang), uy = Math.sin(ang);   /* along the bill */
    const vx = -uy, vy = ux;                        /* across it */
    /* A wedge, longer along the bill than across — a heron's skull runs into
       its bill rather than sitting on the end of the neck like a bead. */
    for (let u = -4; u <= 3; u++) {
      for (let v = -3; v <= 3; v++) {
        const uu = u / (u < 0 ? 3.6 : 2.9), vv = v / 2.1;
        if (uu * uu + vv * vv > 1) continue;
        put(hx + ux * u + vx * v, hy + uy * u + vy * v, BODY);
      }
    }
    /* Crest: two plumes trailing off the back of the skull, clear of it. */
    put(hx - ux * 4.6 + vx * 0.8, hy - uy * 4.6 + vy * 0.8, BODY);
    put(hx - ux * 5.8 + vx * 1.4, hy - uy * 5.8 + vy * 1.4, BODY);

    PART = 3;
    const blink = ((t * LOOP) % 6300) < 120;
    if (!blink) put(hx + ux * 0.6 - vx * 1.1, hy + uy * 0.6 - vy * 1.1, EYE);

    /* Bill: a dagger, tapering to a point along the head's angle. */
    const bl = 10;
    for (let k = 0; k <= bl; k++) {
      const q = k / bl;
      const bx = hx + ux * (2.6 + k), by = hy + uy * (2.6 + k);
      put(bx, by, BILL);
      if (q < 0.45) put(bx + vx, by + vy, BILL);
    }

    /* A contact shadow instead of a reflection: short, tight to the feet, and
       thrown by the flat overcast light rather than a low sun. */
    if (onIce) {
      const sx0 = ox + 12, sy0 = base + 2, srx = 12, sry = 3.4;
      for (let dy = -sry; dy <= sry; dy++)
        for (let dx = -srx; dx <= srx; dx++) {
          const q = (dx / srx) * (dx / srx) + (dy / sry) * (dy / sry);
          if (q > 1) continue;
          const xx = Math.round(sx0 + dx), yy = Math.round(sy0 + dy);
          if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
          if (BAYER[(yy & 3) * 4 + (xx & 3)] + 0.47 > 0.24 + (1 - q) * 0.78) continue;
          const c = buf[yy * W + xx], k = (1 - q) * 0.4;
          buf[yy * W + xx] = (255 << 24)
            | (Math.round(((c >> 16) & 255) * (1 - k * 0.5)) << 16)
            | (Math.round(((c >> 8) & 255) * (1 - k * 0.6)) << 8)
            | Math.round((c & 255) * (1 - k * 0.66));
        }
    }

    /* ── to the buffer, with the reflection under it ──────────────────── */
    for (let i = 0; i < pts.length; i += 4) {
      const y = pts[i + 1];
      if (y > base + 1) continue;
      px(pts[i], y, pts[i + 2]);
    }
    if (!dry) for (let i = 0; i < pts.length; i += 4) {
      const x = pts[i], y = pts[i + 1];
      if (y > base) continue;
      const yy = Math.round(base + (base - y) * 0.6);
      const depth = (yy - base) / 32;
      if (yy >= H || yy <= base || depth > 0.85) continue;
      /* Bands, not a checkerboard: the surface swallows whole rows. */
      if (Math.sin(yy * 1.15 + t * TAU * 9) < -0.15) continue;
      const wob = Math.round(Math.sin(t * TAU * 13 + yy * 0.62) * (0.7 + depth * 2.8));
      for (let d = 0; d < 2; d++) {
        const qx = x + wob + d;
        const c = buf[yy * W + Math.min(W - 1, Math.max(0, qx))];
        px(qx, yy, (255 << 24) | ((((c >> 16) & 255) * 0.62) << 16)
          | ((((c >> 8) & 255) * 0.56) << 8) | ((c & 255) * 0.56));
      }
    }

    /* ── the water answers ────────────────────────────────────────────── */
    const ring = (cxp, a, span, cy, strength) => {
      const rx = 2 + a * span, ry = Math.max(0.7, rx * 0.32);
      const fade = (1 - a) * (1 - a) * (strength === undefined ? 0.5 : strength);
      if (fade < 0.03) return;
      for (let d = -Math.ceil(rx); d <= Math.ceil(rx); d++) {
        const u = d / rx;
        if (Math.abs(u) > 1) continue;
        const dy = ry * Math.sqrt(1 - u * u);
        for (const sgn of [-1, 1]) {
          const yy = Math.round(cy + dy * sgn);
          const xx = Math.round(cxp + d);
          if (yy < 0 || yy >= H || xx < 0 || xx >= W) continue;
          const c = buf[yy * W + xx];
          const r0 = c & 255, g0 = (c >> 8) & 255, b0 = (c >> 16) & 255;
          /* lifted toward the sky, never replaced by it */
          buf[yy * W + xx] = (255 << 24)
            | (Math.min(255, Math.round(b0 + (232 - b0) * fade)) << 16)
            | (Math.min(255, Math.round(g0 + (224 - g0) * fade)) << 8)
            | Math.min(255, Math.round(r0 + (200 - r0) * fade));
        }
      }
    };
    /* Standing in water makes a small, slow disturbance — two rings at most. */
    if (!dry) for (let k = 0; k < 2; k++) ring(ox + 12, (t * 26 + k / 2) % 1, 7, base + 2, 0.26);

    /* Rings under the bill for as long as it is in the water. */
    if (hold && !dry) {
      const bx = Math.round(hx + ux * 11.6);
      for (let k = 0; k < 3; k++) ring(bx, (t * 150 + k / 3) % 1, 9, base + 2, 0.62);
    }
    /* And a splash on the way out. */
    if (fishU > 0.46 && fishU < 0.60 && !dry) {
      const a = (fishU - 0.46) / 0.14, bx = Math.round(hx + ux * 11.6);
      for (let k = 0; k < 9; k++) {
        const dir2 = k % 2 ? 1 : -1, sp = 1 + (k % 4);
        const dxp = Math.round(dir2 * sp * a * 4);
        const dyp = Math.round(-a * 9 * (1 - a) * 4 + a * a * 8);
        px(bx + dxp, base - 2 + dyp, SKY[Math.min(this.SKY_N, this.SKY_N - 2)]);
      }
    }
    /* A ring where a foot comes down. */
    if (stepU >= 0.68 && !dry) {
      const a = (stepU - 0.68) / 0.32;
      ring(ox + 12 + Math.round(stepDir * 4), a, 16);
      ring(ox + 12 + Math.round(stepDir * 4), a * 0.55, 11);
    }

    /* Rim light down the lit edge, found from what was actually drawn. */
    const lo = new Map(), hi = new Map();
    for (let i = 0; i < pts.length; i += 4) {
      /* Body only — never legs, head or bill. */
      if (pts[i + 3] !== 1) continue;
      const y = pts[i + 1], x = pts[i];
      if (y > base) continue;
      if (!hi.has(y) || x > hi.get(y)) hi.set(y, x);
      if (!lo.has(y) || x < lo.get(y)) lo.set(y, x);
    }
    hi.forEach((x, y) => { if (x - lo.get(y) >= 4) px(x, y, RIM); });
  }

  /* ── the creek: a channel receding into the trees ──────────────────── */
  /* ── the creek: looking straight up the water ───────────────────────── */
  /* ── the glade ──────────────────────────────────────────────────────── */
  /* ── the glade, built the way the marsh is: one horizon, silhouettes
     against a bright gap, still water holding it all upside down ──────── */
  chanAt(y, C) {
    return [W / 2, y >= C.hz ? W : 0];
  }

  buildCreek(S, rng) {
    const C = S.creek;
    const SX = W / 384;
    const SKY = this.SKY, SKY_N = this.SKY_N, HZ = C.hz;
    const land = new Uint32Array(W * H);   /* everything above the water */
    const front = new Uint32Array(W * H);  /* the near frame             */
    const put = (arr, x, y, c) => {
      x = Math.round(x); y = Math.round(y);
      if (x >= 0 && x < W && y >= 0 && y < H) arr[y * W + x] = c;
    };
    const shade = C.shade.map(pack), wood = C.wood.map(pack), lit = C.lit.map(pack);
    const floor = C.floor.map(pack), tr = C.trunk.map(pack), moss = C.moss.map(pack);
    const nB = noiseField(130, 30, rng), nG = noiseField(26, 12, rng), nF = noiseField(70, 24, rng);
    const WI = C.winter || null;
    const bare = WI ? WI.bare.map(pack) : null;
    const snHi = WI ? pack(WI.snow[0]) : 0, snMid = WI ? pack(WI.snow[1]) : 0;

    /* Distance kills detail: far foliage is silhouette only. A crown is a
       ragged mass, and only the near ones ever get individual leaves. */
    const mass = (arr, cx, cy, R, c, ragged) => {
      const lobes = 3 + Math.floor(rng() * 4), pts = [];
      for (let i = 0; i < lobes; i++)
        pts.push([cx + (rng() - 0.5) * R * 1.5, cy + (rng() - 0.5) * R * 0.8, R * (0.45 + rng() * 0.5)]);
      for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R * 0.8); y++) {
        if (y < -24 || y >= H) continue;
        for (let x = Math.floor(cx - R * 1.5); x <= Math.ceil(cx + R * 1.5); x++) {
          if (x < -24 || x >= W) continue;
          let fld = 0;
          for (let i = 0; i < pts.length; i++) {
            const dx = (x - pts[i][0]) / pts[i][2], dy = (y - pts[i][1]) / (pts[i][2] * 0.74);
            fld += Math.exp(-(dx * dx + dy * dy) * 1.5);
          }
          if (fld + (nF(x / W + cx * 0.001, y / H) - 0.5) * ragged < 0.66) continue;
          if (y >= 0) arr[y * W + x] = c;
        }
      }
    };
    /* A spruce. Tiers of boughs widening downward, each carrying a load of snow
       on its upper face and shaded at its tips. Conifers are the reason a winter
       wood still has darks in it: strip every green and the picture goes flat,
       which is exactly what happened when this was attempted by deletion. */
    const conifer = (arr, cx, yTop, h, spread) => {
      const tiers = 3 + Math.floor(rng() * 3);
      for (let ti = 0; ti < tiers; ti++) {
        const q = tiers === 1 ? 1 : ti / (tiers - 1);
        const ty = yTop + 2 + q * h;
        const hw = Math.max(1.2, spread * (0.24 + q * 0.92));
        const dep = 1.4 + q * 2.3;
        for (let dy = 0; dy <= dep; dy++)
          for (let dx = -hw; dx <= hw; dx++) {
            const e = Math.abs(dx) / hw;
            if (e > 1 - (dy / (dep + 1.6)) * 0.8) continue;
            put(arr, cx + dx, ty + dy, e > 0.68 ? shade[1] : (rng() < 0.34 ? wood[2] : wood[1]));
          }
        /* The load sits on the inner half of the bough as a solid cap and the
           needle tips stay bare — which is how snow actually rests on a spruce,
           and it reads at four pixels where dither reads as noise. */
        const far = spread < 4.4;
        if (hw >= 2.2 && rng() < (far ? 0.34 : 0.72)) {
          const cap = Math.max(1, Math.round(hw * (0.42 + rng() * 0.3)));
          const jit = rng() < 0.5 ? 0 : -1;      /* so tiers do not line up */
          let dx = -cap;
          while (dx <= cap) {
            const run = 1 + Math.floor(rng() * 3);
            if (rng() < 0.7)
              for (let k = 0; k < run && dx + k <= cap; k++) {
                const e = Math.abs(dx + k) / Math.max(1, cap);
                put(arr, Math.round(cx + dx + k), Math.round(ty - 1 + jit),
                    far ? snMid : (e < 0.55 ? snHi : snMid));
              }
            dx += run + 1 + Math.floor(rng() * 2);
          }
        }
      }
      for (let k = 0, n = 3 + rng() * 3; k < n; k++) put(arr, cx, yTop + 2 - k, shade[0]);
    };
    /* A bare crown. At 384 across a twig is a fraction of a pixel, so a leafless
       tree does not read as drawn branches — it reads as a compact haze, densest
       at the trunk and thinning outward. The density is clamped so it never goes
       solid and never leaves a pixel outside its own footprint, which is what
       turned the sky into litter before. */
    const bareCrown = (arr, cx, cy, Rr) => {
      for (let y = Math.floor(cy - Rr); y <= Math.ceil(cy + Rr * 0.72); y++) {
        if (y < 0 || y >= H) continue;
        for (let x = Math.floor(cx - Rr * 1.15); x <= Math.ceil(cx + Rr * 1.15); x++) {
          if (x < 0 || x >= W) continue;
          const dx = (x - cx) / (Rr * 1.15), dy = (y - cy) / (Rr * 0.9);
          const d = dx * dx + dy * dy;
          if (d > 1) continue;
          if (hash2(x, y) > 0.56 * (1 - d)) continue;
          arr[y * W + x] = bare[Math.min(bare.length - 1, 1 + Math.round(d * 2.6))];
        }
      }
      for (let k = 0, n = Rr * 1.2; k < n; k++) put(arr, cx, cy + Rr * 0.55 + k, tr[1]);
    };
    /* Leaf strokes, for near foliage only. */
    const sprig = (arr, x, y, ang, len, pal, k, scale) => {
      let cx = x, cy = y, a2 = ang;
      for (let s = 0; s < len; s++) {
        a2 += (rng() - 0.5) * 0.2;
        cx += Math.cos(a2); cy += Math.sin(a2);
        const q = s / len;
        if (q < 0.5) put(arr, cx, cy, pal[Math.max(0, k - 1)]);
        if (rng() > 0.7) continue;
        const la = a2 + (rng() < 0.5 ? 1 : -1) * (0.5 + rng() * 0.7);
        const ll = Math.max(1, (1 - q) * scale * (0.6 + rng() * 0.7));
        for (let d = 0; d <= ll; d++)
          put(arr, cx + Math.cos(la) * d, cy + Math.sin(la) * d,
              pal[Math.max(0, Math.min(pal.length - 1, k + (d > ll * 0.6 ? 1 : 0)))]);
      }
    };
    const bush = (arr, x, y, R, pal, k) => {
      for (let i = 0; i < 6 + R * 0.7; i++)
        sprig(arr, x + (rng() - 0.5) * R * 0.5, y + (rng() - 0.5) * R * 0.3,
              -Math.PI + rng() * Math.PI * 2, R * (0.5 + rng() * 0.6), pal, k, 2 + R * 0.1);
    };

    /* ── sky ───────────────────────────────────────────────────────────── */
    for (let y = 0; y < HZ + 8; y++)
      for (let x = 0; x < W; x++)
        land[y * W + x] = SKY[Math.max(0, Math.min(SKY_N,
          Math.round(Math.pow(y / (HZ + 8), 1.15) * SKY_N + BAYER[(y & 3) * 4 + (x & 3)] * 1.1)))];
    const skyBuf = land.slice();          /* so canopy can be punched back to sky */

    /* ── perspective: the far shore is a bay, not a ruled line. The centre of
       the pool is further away, so its waterline sits higher and the bank
       behind it reads thinner. Everything downstream keys off these two. ── */
    const shore = new Int16Array(W), bankTop = new Int16Array(W);
    for (let x = 0; x < W; x++) {
      const u = (x / W - 0.5) * 2;
      const bow = (u * u - 0.34) * 8.5;                 /* centre recedes      */
      const wob = Math.sin(x * 0.017 + 1.3) * 2.2 + Math.sin(x * 0.058) * 1.1
                + Math.sin(x * 0.14 + 2.1) * 0.6;
      shore[x] = Math.round(HZ + bow + wob);
      /* Bank depth follows the same law: a sliver at the far centre, a real
         shelf at the near wings. */
      const dpth = 5 + u * u * 15 + Math.sin(x * 0.026 + 0.7) * 2.6 + Math.sin(x * 0.083) * 1.4;
      bankTop[x] = Math.round(shore[x] - dpth);
    }
    this.shore = shore;

    const nT = noiseField(96, 54, rng);     /* fine grain, 4px cells           */
    const nM = noiseField(30, 18, rng);     /* broad passages                  */

    /* ── the far wood: five ranks. Each is a textured mass, not a flat fill —
       broad sunlit and shaded passages across it, fine grain inside, crowns
       breaking the top edge upward, and sky punched back through the gaps. ── */
    /* A wood reads as two things stacked: a canopy band up top, and below it a
       dark interior with BARK-coloured trunks standing in it. Drawing trunks
       from the foliage ramp is what made this a wall of green. */
    const pk = (r, g, b2) => (255 << 24) | (Math.round(b2) << 16) | (Math.round(g) << 8) | Math.round(r);
    const hazed = (r, g, b2, m) => pk(r + (134 - r) * m, g + (166 - g) * m, b2 + (160 - b2) * m);

    for (let rank = 4; rank >= 0; rank--) {
      const q = rank / 4;                              /* 1 = farthest        */
      const hz = 0.14 + q * 0.5;                       /* atmospheric mix     */
      const cFol  = hazed(44, 76, 50, hz);
      const cFolL = hazed(102, 142, 76, hz);
      const cFolD = hazed(22, 43, 33, hz);
      const cBk   = hazed(62, 48, 38, hz);             /* bark: brown, never green */
      const cBkL  = hazed(104, 84, 62, hz);
      const cBkD  = hazed(30, 23, 20, hz);
      const cInt  = hazed(16, 28, 25, hz * 0.72);      /* interior shadow     */
      const crest = 74 - rank * 11;
      const rim = new Int16Array(W), grd = new Int16Array(W), tTop = new Int16Array(W);
      let prev = null;
      for (let x = 0; x < W; x++) {
        /* Harmonics only — smooth in x, so the silhouette can never step. */
        let r = crest
              - Math.sin(x * (0.014 + rank * 0.004) + rank * 2.1) * (13 - rank * 1.6)
              - Math.sin(x * (0.048 + rank * 0.01) + rank) * 5
              - Math.sin(x * (0.113 + rank * 0.017) + rank * 3.7) * 3.4
              - Math.sin(x * (0.29 + rank * 0.04) + rank * 1.7) * 2.2
              - Math.sin(x * 0.61 + rank * 0.9) * 1.1;
        if (prev !== null) r = Math.max(prev - 2, Math.min(prev + 2, r));
        prev = r;
        rim[x] = Math.round(r);
        grd[x] = bankTop[x] + 2 - rank * 3;
        /* Canopy owns the upper part; the trunk zone is what is left. */
        const span = Math.max(2, grd[x] - rim[x]);
        tTop[x] = rim[x] + Math.round(span * (0.42 + Math.sin(x * 0.03 + rank) * 0.05));
      }

      /* 1 · the canopy band */
      for (let x = 0; x < W; x++) {
        const span = Math.max(1, tTop[x] - rim[x]);
        for (let y = rim[x]; y < tTop[x]; y++) {
          if (y < 0 || y >= H) continue;
          const dep = (y - rim[x]) / span;
          const pass = Math.sin(x * 0.021 + rank * 1.9) * 0.55
                     + Math.sin(x * 0.049 + rank * 0.7) * 0.3
                     + (nM(x / W, y / H) - 0.5) * 1.1;
          const grain = (nT(x / W, y / H) - 0.5) * 1.8
                      + (BAYER[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 0.55;
          const v = pass + grain - dep * 1.25 + (1 - q) * 0.12;
          put(land, x, y, v > 0.40 ? cFolL : v > -0.20 ? cFol : cFolD);
        }
      }

      /* 2 · the interior below it — dark, with vertical streaking so it is
             read as depth between trunks rather than a flat slab. */
      for (let x = 0; x < W; x++) {
        const streak = Math.sin(x * 0.34 + rank * 2.2) * 0.5 + Math.sin(x * 0.81 + rank) * 0.3;
        for (let y = tTop[x]; y < grd[x]; y++) {
          if (y < 0 || y >= H) continue;
          const g2 = (nT(x / W, y / H) - 0.5) * 0.9 + streak;
          put(land, x, y, g2 > 0.62 ? cFolD : cInt);
        }
      }

      /* 3 · crowns breaking the crest upward */
      for (let x = -10; x < W + 10; x += 5 + rng() * 7) {
        if (rng() < 0.26) continue;
        const R = 4 + rng() * (10 - rank * 0.9);
        const xi = Math.max(0, Math.min(W - 1, Math.round(x)));
        const cy = rim[xi] + 1 - rng() * 3;
        if (WI) {
          const pick = rng();
          if (pick < 0.5) conifer(land, x, cy - R * 1.5, R * 1.7, R * 0.8);
          else if (pick < 0.82) bareCrown(land, x, cy - R * 0.35, R * 0.92);
          else mass(land, x, cy, R, cFolD, 1.2);
        } else {
          mass(land, x, cy, R, rng() < 0.42 ? cFolD : cFol, 1.2);
          if (rng() < 0.55) mass(land, x + (rng() - 0.5) * R, cy - R * 0.4, R * 0.58, cFolL, 1.2);
        }
      }

      /* 4 · sky through the canopy */
      for (let i = 0; i < Math.round((26 - rank * 3) * (W / 384)); i++) {
        const hx = rng() * W;
        const xi = Math.max(0, Math.min(W - 1, Math.round(hx)));
        const hy = rim[xi] + 1 + rng() * 9;
        const R = 1.1 + rng() * 2.6;
        for (let y = Math.floor(hy - R); y <= Math.ceil(hy + R); y++)
          for (let x = Math.floor(hx - R); x <= Math.ceil(hx + R); x++) {
            if (x < 0 || x >= W || y < 0 || y >= H) continue;
            const dx = (x - hx) / R, dy = (y - hy) / R;
            if (dx * dx + dy * dy > 1) continue;
            if (nT(x / W, y / H) < 0.32) continue;
            land[y * W + x] = skyBuf[y * W + x];
          }
      }

      /* 5 · trunks — bark, lit from the right, rising into the canopy. */
      const nTr = Math.round((9 + rank * 6) * (W / 384));
      for (let i = 0; i < nTr; i++) {
        const x = rng() * (W + 20) - 10;
        const w = Math.max(0, Math.round((3.2 - q * 2.3) + rng() * 1.5));
        const xi = Math.max(0, Math.min(W - 1, Math.round(x)));
        const top = rim[xi] + 3 + rng() * 10;          /* into the canopy     */
        const foot = grd[xi];
        for (let y = top; y < foot; y++) {
          const bend = Math.sin(y * 0.019 + i * 1.7) * (1.5 - q);
          const flare = y > foot - 5 ? (y - (foot - 5)) * 0.32 : 0;
          const ww = Math.round(w + flare);
          for (let k = -Math.floor(flare); k <= ww; k++) {
            const bk = k <= 0 ? cBkD : (k >= ww - 0.5 && ww > 0 ? cBkL : cBk);
            put(land, x + k + bend, y, bk);
          }
        }
        /* limb stubs on the near ranks, so trunks are not bare poles */
        if (rank <= 2) {
          for (let l = 0; l < 1 + Math.round(rng() * 2); l++) {
            const ly = top + 3 + rng() * Math.max(1, (foot - top) * 0.4);
            const dir = rng() < 0.5 ? -1 : 1;
            const len = 3 + rng() * 7;
            for (let s = 0; s < len; s++)
              put(land, x + w * 0.5 + dir * s, ly - s * 0.55, cBkD);
            mass(land, x + w * 0.5 + dir * len, ly - len * 0.55, 2.5 + rng() * 3.5, cFolD, 1.2);
          }
        }
        if (WI) {
          const Rr = 4 + rng() * (10 - rank);
          if (rng() < 0.46) conifer(land, x + w * 0.5, top + 1 - Rr * 1.4, Rr * 1.6, Rr * 0.72);
          else bareCrown(land, x + w * 0.5, top + 1 - Rr * 0.2, Rr * 0.86);
        } else
        mass(land, x + w * 0.5, top + 1, 4 + rng() * (10 - rank), rng() < 0.4 ? cFol : cFolD, 1.15);
      }

      /* 6 · understorey knitting the rank to the one behind it */
      for (let i = 0; i < Math.round((32 - rank * 3) * (W / 384)); i++) {
        const x = rng() * (W + 30) - 15;
        const xi = Math.max(0, Math.min(W - 1, Math.round(x)));
        const y = grd[xi] - 2 - rng() * 11;
        mass(land, x, y, 3 + rng() * 8, cFolD, 1.2);
        if (rng() < 0.5) mass(land, x + (rng() - 0.5) * 6, y - 3, 2 + rng() * 4, cFol, 1.2);
      }
    }

    /* Depth haze between the ranks, so the far wood sits back. */
    {
      const hz2 = [0x86, 0xA6, 0xA0];
      for (let y = 20; y < HZ + 6; y++) {
        const m = 0.42 * Math.max(0, 1 - Math.abs(y - 58) / 46);
        if (m < 0.014) continue;
        for (let x = 0; x < W; x++) {
          const s = land[y * W + x];
          if (!s) continue;
          const sr = s & 255, sg = (s >> 8) & 255, sb = (s >> 16) & 255;
          if (sb > sr + 30 && sg > sr + 12) continue;
          land[y * W + x] = (255 << 24)
            | (Math.round(sb + (hz2[2] - sb) * m) << 16)
            | (Math.round(sg + (hz2[1] - sg) * m) << 8)
            | Math.round(sr + (hz2[0] - sr) * m);
        }
      }
    }

    /* ── the far bank: a shelf with relief, following the bay ───────────── */
    for (let x = 0; x < W; x++) {
      const top = bankTop[x], bot = shore[x] + 1;
      const span = Math.max(1, bot - top);
      for (let y = top; y < bot; y++) {
        if (y < 0 || y >= H) continue;
        const dep = (y - top) / span;
        /* Broad light and shade running across the shelf, grain inside it. */
        const pass = Math.sin(x * 0.028 + 2.4) * 0.6 + (nM(x / W + 0.3, y / H) - 0.5) * 1.3;
        const g2 = (nT(x / W + 0.5, y / H) - 0.5) * 1.5;
        const v = pass + g2 + dep * 0.5;
        const k = v > 0.6 ? 4 : v > 0.2 ? 3 : v > -0.25 ? 2 : v > -0.7 ? 1 : 0;
        put(land, x, y, floor[Math.max(0, Math.min(floor.length - 1, k))]);
      }
    }
    /* Undergrowth on the shelf, thicker at the near wings where it is closer. */
    for (let i = 0; i < Math.round(130 * SX); i++) {
      const x = rng() * W;
      const u = (x / W - 0.5) * 2;
      if (rng() > 0.3 + Math.abs(u) * 0.8) continue;
      const xi = Math.max(0, Math.min(W - 1, Math.round(x)));
      const y = bankTop[xi] + 2 + rng() * Math.max(2, shore[xi] - bankTop[xi] - 2);
      const R = 2 + rng() * (3 + Math.abs(u) * 5);
      mass(land, x, y, R, shade[0], 1.2);
      mass(land, x + (rng() - 0.5) * R, y - R * 0.4, R * 0.62, floor[2 + Math.floor(rng() * 2)], 1.2);
    }
    /* Two fallen trunks lying along the shelf — the shelf's only hard lines. */
    for (let i = 0; i < 2; i++) {
      const x0 = i === 0 ? 8 + rng() * 46 : W - 96 + rng() * 40;
      const len = 24 + rng() * 40;
      const xi = Math.max(0, Math.min(W - 1, Math.round(x0)));
      const y0 = bankTop[xi] + 3 + rng() * 5, slope = (rng() - 0.5) * 0.14;
      const th = 1 + Math.round(rng() * 1);
      for (let s = 0; s < len; s++)
        for (let k = 0; k <= th; k++)
          put(land, x0 + s, y0 + slope * s + k, k === 0 ? floor[4] : k === th ? shade[0] : floor[2]);
    }
    for (let i = 0; i < Math.round(90 * SX); i++) {
      const x = rng() * W, xi = Math.max(0, Math.min(W - 1, Math.round(x)));
      bush(land, x, bankTop[xi] + 3 + rng() * 6, 2 + rng() * 5, floor, 2 + Math.floor(rng() * 2));
    }

    /* Reeds and sedge along the waterline, following the bay. */
    for (let i = 0; i < Math.round(250 * SX); i++) {
      const x = rng() * W;
      const openness = Math.exp(-Math.pow((x - W * 0.583) / (W * 0.286), 2));
      if (rng() < openness * 0.72) continue;
      const xi = Math.max(0, Math.min(W - 1, Math.round(x)));
      const near = 0.45 + Math.pow(Math.abs((x / W - 0.5) * 2), 1.3) * 0.9;
      const y0 = shore[xi] + rng() * 2;
      const h = (3 + Math.pow(rng(), 1.5) * 13) * near;
      const lean = (rng() - 0.35) * 0.5;
      const c = rng() < 0.3 ? floor[2] : shade[1 + Math.floor(rng() * 2)];
      for (let s = 0; s < h; s++) {
        const qy = s / h;
        put(land, x + lean * s * (0.4 + qy), y0 - s, c);
        if (h > 9 && qy > 0.55 && rng() < 0.2)
          put(land, x + lean * s * (0.4 + qy) + (rng() < 0.5 ? 1 : -1), y0 - s, c);
      }
      if (h > 11 && rng() < 0.35)
        for (let s = 0; s < 4; s++) put(land, x + lean * h * 0.9, y0 - h - s, floor[3]);
    }
    this.waterReeds = [];
    for (let i = 0; i < 22; i++) {
      const x0 = rng() * W;
      const xi = Math.max(0, Math.min(W - 1, Math.round(x0)));
      const y = shore[xi] + 5 + Math.pow(rng(), 1.6) * 64;
      if (Math.abs(x0 - W * 0.583) < W * 0.182 && rng() < 0.6) continue;
      this.waterReeds.push({ x: x0, y, h: 3 + rng() * (4 + (y - shore[xi]) * 0.22),
                             lean: (rng() - 0.4) * 0.4, c: shade[Math.floor(rng() * 2)] });
    }

    /* Pale blooms, sparse — a forest floor has a few, not a field. */
    const pale = C.bloom.pale.map(pack), warm = C.bloom.warm.map(pack), cool = C.bloom.cool.map(pack);
    for (let i = 0; i < Math.round(150 * SX); i++) {
      const x = rng() * W, xi = Math.max(0, Math.min(W - 1, Math.round(x)));
      const set = rng() < 0.6 ? pale : rng() < 0.5 ? warm : cool;
      put(land, x, bankTop[xi] + 1 + rng() * Math.max(2, shore[xi] - bankTop[xi]),
          set[Math.floor(rng() * set.length)]);
    }

    /* ── trees standing in the water ───────────────────────────────────── */
    this.swamp = [];
    /* A crown built from clumps up the top third of the shaft, each lit on its
       own crown — never one ball balanced on a stick. */
    const canopy = (x, top, hBase, spread, body, dark, lite) => {
      if (WI) { conifer(land, x, top - spread * 0.5, spread * 2.4, spread * 0.9); return; }
      const n = 3 + Math.floor(rng() * 3);
      for (let i = 0; i < n; i++) {
        const cy = top + hBase * (0.02 + rng() * 0.3);
        const cx = x + (rng() - 0.5) * spread * 1.7;
        const R = spread * (0.42 + rng() * 0.42);
        mass(land, cx, cy, R, rng() < 0.4 ? dark : body, 1.18);
        mass(land, cx + (rng() - 0.5) * R * 0.5, cy - R * 0.38, R * 0.58, lite, 1.18);
      }
    };
    const mixC = (p1, p2, k) => {
      const r1 = p1 & 255, g1 = (p1 >> 8) & 255, b1 = (p1 >> 16) & 255;
      const r2 = p2 & 255, g2 = (p2 >> 8) & 255, b2 = (p2 >> 16) & 255;
      return (255 << 24) | (Math.round(b1 + (b2 - b1) * k) << 16)
           | (Math.round(g1 + (g2 - g1) * k) << 8) | Math.round(r1 + (r2 - r1) * k);
    };
    const swampTree = (x, hBase, w, k) => {
      const xi = Math.max(0, Math.min(W - 1, Math.round(x)));
      const rootY = shore[xi] + 2 + Math.pow(rng(), 1.4) * 24;
      const top = rootY - hBase;
      const dark = wood[Math.max(0, k - 1)], body = wood[k];
      const lite = wood[Math.min(wood.length - 1, k + 1)];
      /* Trunks take the bark ramp, mixed toward the wood by distance. */
      const bkT = tr.map(c => mixC(c, wood[k], 0.34 + k * 0.06));
      for (let y = Math.round(top); y < rootY + 3; y++) {
        const qy = (y - top) / (rootY - top);
        const bend = Math.sin(qy * 2.4 + x * 0.03) * 4;
        const flare = qy > 0.78 ? Math.pow((qy - 0.78) / 0.22, 2) * w * 1.5 : 0;
        const hw = (w * (0.55 + qy * 0.45) + flare) / 2;
        for (let px = Math.round(x + bend - hw); px <= Math.round(x + bend + hw); px++) {
          const u = (px - (x + bend - hw)) / Math.max(1, hw * 2);
          const rib = Math.sin(u * 7 + y * 0.13);
          let kk = u < 0.26 ? 4 : u < 0.58 ? 3 : 2;
          if (rib > 0.6) kk += 1; else if (rib < -0.6) kk -= 1;
          put(land, px, y, bkT[Math.max(0, Math.min(bkT.length - 1, 5 - kk))]);
        }
      }
      /* Limbs, each carrying foliage where it ends. */
      for (let i = 0; i < 2 + Math.floor(rng() * 2); i++) {
        const side = rng() < 0.5 ? -1 : 1;
        let lx = x, ly = top + 3 + rng() * (hBase * 0.42), la = side * (0.5 + rng() * 0.5) - Math.PI / 2;
        const len = 6 + rng() * 14;
        for (let s = 0; s < len; s++) {
          la += (rng() - 0.5) * 0.14;
          lx += Math.cos(la); ly += Math.sin(la);
          put(land, lx, ly, bkT[1]);
        }
        mass(land, lx, ly, 3 + rng() * 6, rng() < 0.5 ? body : dark, 1.15);
        mass(land, lx, ly - 2, 2 + rng() * 3, lite, 1.15);
      }
      canopy(x, top, hBase, w * 1.5 + 5, body, dark, lite);
      for (let i = 0; i < 8 + rng() * 10; i++) {
        const rx = x + (rng() - 0.5) * (w * 3 + 10), h = 3 + rng() * 8;
        for (let s = 0; s < h; s++) put(land, rx + (rng() - 0.5) * 0.6, rootY - s, shade[1]);
      }
      this.swamp.push({ x: Math.round(x), y: Math.round(rootY), h: hBase, w });
    };

    /* The mid-plane tree: rooted just behind the heron, carrying real bark and
       roots. Detailed enough to hold the middle of the frame, not so detailed
       it competes with the two in front. */
    const swampHero = (x, rootY, hBase, w) => {
      const dark = wood[1], body = wood[2], lite = wood[3];
      /* Bark, pushed 44% toward the wood so it reads mid-distance. */
      const bk = tr.map(c => mixC(c, wood[2], 0.44));
      const top = rootY - hBase;
      for (let y = Math.round(top); y <= rootY; y++) {
        const qy = (y - top) / hBase;
        const bend = Math.sin(qy * 1.9 + 0.6) * 5 - 2;
        const flare = qy > 0.42 ? Math.pow((qy - 0.42) / 0.58, 1.6) * w * 3.2 : 0;
        const flute = qy > 0.42 ? Math.sin(x * 0.7 + qy * 26) * (qy - 0.42) * w * 0.5 : 0;
        const hw = (w * (0.32 + qy * 0.68) + flare + flute) / 2;
        const x0 = x + bend - hw, x1 = x + bend + hw;
        for (let px = Math.round(x0); px <= Math.round(x1); px++) {
          const u = (px - x0) / Math.max(1, x1 - x0);
          /* Bark: vertical fluting, lit on the left where the gap is. */
          const rib = Math.sin(u * 9 + Math.sin(u * 3.2) * 1.6 + y * 0.11);
          let kk = u < 0.16 ? 3 : u < 0.42 ? 2 : u < 0.72 ? 1 : 0;
          if (rib > 0.55) kk += 1; else if (rib < -0.55) kk -= 1;
          if (nT(px / W, y / H) < 0.24) kk -= 1;
          put(land, px, y, bk[Math.max(0, Math.min(bk.length - 1, 5 - kk))]);
        }
      }
      /* Roots reaching out and into the water. */
      for (let i = 0; i < 7; i++) {
        const side = i % 2 ? 1 : -1;
        let rx = x - 2, ry = rootY - 2 - rng() * 3, ra = side * (0.5 + rng() * 0.7);
        const len = 5 + rng() * 11;
        for (let s = 0; s < len; s++) {
          ra += (rng() - 0.5) * 0.22 + 0.05;
          rx += Math.cos(ra); ry += Math.sin(ra);
          put(land, rx, ry, bk[1]);
          if (s < len * 0.5) put(land, rx, ry - 1, bk[3]);
        }
      }
      /* The crown is tiers of near-horizontal limbs — widest low, shortest at
         the top — which is what gives a cypress its flat, spreading head
         rather than a ball on a stick. */
      const spray = (sx, sy, dir, len, tier) => {
        let px2 = sx, py2 = sy, ang = dir * 0.16 - 0.12;
        for (let s = 0; s < len; s++) {
          const q = s / len;
          ang += (rng() - 0.5) * 0.07 + 0.008;
          px2 += dir * Math.cos(ang) * 1.15;
          py2 += Math.sin(ang) * 1.15 + q * 0.16;
          const th = Math.max(0, Math.round((1 - q) * (tier < 2 ? 1.9 : 1.2)));
          for (let k = 0; k <= th; k++) put(land, px2, py2 + k, k === 0 ? bk[3] : bk[1]);
          /* Foliage in flattened sprays along the limb, lit on the crown. */
          if (s % 2 === 0 && q > 0.14) {
            const rr = 2.2 + (1 - Math.abs(q - 0.55) * 1.7) * 3.4;
            mass(land, px2, py2, rr, rng() < 0.4 ? dark : body, 2.1);
            if (rng() < 0.55) mass(land, px2 + dir, py2 - 1.4, rr * 0.6, lite, 2.0);
          }
          /* Spanish moss: short strands off the outer half of the low tiers. */
          if (tier < 3 && q > 0.42 && s % 5 === 2) {
            const ml = 4 + rng() * 13;
            let mx = px2;
            for (let m = 0; m < ml; m++) {
              const my = py2 + 2 + m;
              if (my > shore[Math.max(0, Math.min(W - 1, Math.round(mx)))]) break;
              mx += (rng() - 0.5) * 0.34;
              put(land, mx, my, m % 3 === 0 ? body : dark);
            }
          }
        }
      };
      /* Six tiers over the top half, each shorter than the one below it. */
      for (let tier = 0; tier < 6; tier++) {
        const ty = top + 2 + tier * (hBase * 0.082);
        const reach = (26 - tier * 3.2) * (0.86 + rng() * 0.3);
        const bendX = Math.sin(((ty - top) / hBase) * 1.9 + 0.6) * 5 - 2;
        spray(x + bendX - 1, ty, -1, reach, tier);
        spray(x + bendX + 1, ty + 1 + rng() * 2, 1, reach * (0.85 + rng() * 0.3), tier);
      }
      /* A tight head over the leader so the tiers spring from something. */
      canopy(x - 2, top - 1, hBase * 0.2, w * 1.5 + 4, body, dark, lite);

      /* Cypress knees: small fluted stumps breaking the water round the base. */
      for (let i = 0; i < 9; i++) {
        const kx = x + (rng() < 0.5 ? -1 : 1) * (w * 0.9 + rng() * 26);
        const ky = rootY + 1 + rng() * 7;
        const kh = 3 + rng() * 6, kw = 1 + rng() * 1.6;
        for (let s = 0; s < kh; s++) {
          const t2 = s / kh;
          const hwk = kw * (1 - t2 * 0.62);
          for (let px2 = Math.round(kx - hwk); px2 <= Math.round(kx + hwk); px2++) {
            put(land, px2, ky - s, px2 < kx ? bk[3] : bk[1]);
          }
        }
      }
      for (let i = 0; i < 16; i++) {
        const rx = x + (rng() - 0.5) * (w * 3.4 + 14), h = 4 + rng() * 9;
        for (let s = 0; s < h; s++) put(land, rx + (rng() - 0.5) * 0.6, rootY - s, shade[1]);
      }
      this.swamp.push({ x: Math.round(x), y: Math.round(rootY), h: hBase, w });
    };

    swampTree(78 * SX, 64, 7, 3);
    swampTree(300 * SX, 56, 6, 3);
    swampTree(338 * SX, 42, 5, 4);
    swampTree(258 * SX, 40, 4, 4);
    swampHero(205 * SX, 142, 86, 10);

    /* Floating leaves: a green pixel with almost no green around it. Bark
       does not count as company, so a leaf on a bare twig tip goes too. */
    {
      const green = v => {
        if (!v) return false;
        const r = (v >> 16) & 255, g = (v >> 8) & 255, bl = v & 255;
        return g > r + 8 && g > bl + 4;
      };
      for (let pass = 0; pass < 2; pass++) {
        const drop = [];
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            const i = y * W + x;
            if (!green(land[i])) continue;
            let n = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (!dx && !dy) continue;
                if (green(land[(y + dy) * W + x + dx])) n++;
              }
            }
            if (n <= (y < 74 ? 3 : 1)) drop.push(i);
          }
        }
        if (!drop.length) break;
        for (const i of drop) land[i] = 0;
      }
    }

    this.landSrc = land.slice();

    /* ── the near frame: asymmetric, one trunk owning the left ─────────── */
    const bark = (x, y, u) => {
      const rib = Math.sin(u * 14 + Math.sin(u * 4.1) * 2 + y * 0.028);
      const cr = nB(x / W, y / H);
      let k = u < 0.13 ? 3 : u < 0.32 ? 5 : u < 0.5 ? 4 : u > 0.85 ? 0 : u > 0.66 ? 1 : 2;
      if (rib > 0.5) k += 1; else if (rib < -0.5) k -= 1;
      if (cr < 0.22) k -= 1; else if (cr > 0.86) k += 1;
      return tr[Math.max(0, Math.min(6, k))];
    };
    const bigTrunk = (xTop, xBot, wTop, wBot, curve, mossy) => {
      const yBot = H + 18;
      for (let y = 0; y <= yBot; y++) {
        const q = y / yBot;
        const cx = xTop + (xBot - xTop) * q + Math.sin(q * 2.2 + curve) * 9;
        const flare = q > 0.66 ? Math.pow((q - 0.66) / 0.34, 2.2) * wBot * 1.05 : 0;
        const hw = (wTop + (wBot - wTop) * q + flare) / 2;
        for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++)
          put(front, x, y, bark(x, y, (x - (cx - hw)) / (hw * 2)));
        if (mossy && q > 0.35)
          for (let x = Math.round(cx - hw); x <= Math.round(cx - hw * 0.35); x++)
            if (nB(x / W + 0.4, y / H * 2) > 0.66) put(front, x, y, moss[Math.floor(rng() * 3)]);
      }
    };
    const limb = (x, y, ang, len, w, depth) => {
      let cx = x, cy = y, a2 = ang;
      for (let s = 0; s < len; s++) {
        a2 += (rng() - 0.5) * 0.09;
        cx += Math.cos(a2); cy += Math.sin(a2);
        const hw = Math.max(0.5, (w * (1 - s / len)) / 2);
        for (let q = -hw; q <= hw; q++) put(front, cx, cy + q, tr[q < 0 ? 4 : 1]);
        if (depth > 0 && s > len * 0.4 && rng() < 0.06)
          limb(cx, cy, a2 + (rng() < 0.5 ? -1 : 1) * (0.4 + rng() * 0.5), len * 0.42, w * 0.5, depth - 1);
      }
      bush(front, cx, cy, 6 + rng() * 7, shade, 2);
    };
    /* The near frame is this tile's own foreground: full-height trunks with
       heavy limbs, sized to sit inches from the viewer. A caller that supplies
       its own foreground — the scrolling glade, which only takes the tile's
       upper band — passes nearFrame: false, because a foreground limb read at
       background depth is out of scale. */
    if (this.opts.nearFrame !== false) {
      /* One dominant trunk, leaning, owning the left third. */
      bigTrunk(52 * SX, 18 * SX, 26, 50, 0.4, true);
      /* A slimmer one hard against the right edge, and a sliver behind it. */
      bigTrunk(368 * SX, 376 * SX, 15, 27, 2.4, false);
      bigTrunk(330 * SX, 344 * SX, 8, 13, 1.1, false);
      limb(64 * SX, 48, -0.05, 108 * SX, 9, 2);
      limb(371 * SX, 34, Math.PI + 0.22, 54 * SX, 6, 1);
    }

    /* Canopy: weighted left, thinning to a gap right of centre. */
    for (let i = 0; i < Math.round(64 * SX); i++) {
      const x = Math.pow(rng(), 1.5) * W * 0.78 - 24;
      const R = 7 + rng() * 16 * (1 - Math.max(0, x) / W);
      const y = -12 + Math.pow(Math.max(0, x) / (W * 0.78), 1.3) * 40 + (rng() - 0.4) * 22;
      if (y >= R * 0.55) continue;          /* would float — do not draw it */
      mass(front, x, y, R, shade[Math.floor(rng() * 3)], 1.0);
    }
    for (let i = 0; i < Math.round(22 * SX); i++) {
      const R = 8 + rng() * 14;
      const y = -16 + rng() * 26;
      if (y >= R * 0.55) continue;
      mass(front, W * 0.78 + rng() * W * 0.29, y, R, shade[Math.floor(rng() * 2)], 1.0);
    }

    /* Undergrowth closing the bottom corners. */
    for (const side of [0, 1]) {
      const ax = side ? W : 0, dir = side ? -1 : 1;
      for (let i = 0; i < Math.round(16 * SX) + 4; i++)
        bush(front, ax + dir * Math.pow(rng(), 0.9) * (side ? W * 0.16 : W * 0.26), H + 4 - Math.pow(rng(), 1.5) * 26,
             5 + rng() * 11, shade, 2);
    }

    /* Near fringe: tall grass across the bottom of the frame, in silhouette,
       so the eye has something close to sit behind. */
    for (let i = 0; i < Math.round(340 * SX); i++) {
      const x = rng() * (W + 20) - 10;
      /* Heaviest at the edges, thinning where the heron and the light are. */
      const openness = Math.exp(-Math.pow((x - W * 0.52) / (W * 0.25), 2));
      if (rng() < openness * 0.62) continue;
      const y0 = H + 4 - Math.pow(rng(), 1.8) * 30;
      const h = 12 + Math.pow(rng(), 0.8) * 42;
      const lean = (rng() - 0.45) * 0.42;
      const c = shade[Math.floor(rng() * 3)];
      for (let s = 0; s < h; s++) {
        const q = s / h;
        put(front, x + lean * s * (0.35 + q * 1.2), y0 - s, c);
        if (h > 26 && q > 0.4 && rng() < 0.16)
          put(front, x + lean * s * (0.35 + q * 1.2) + (rng() < 0.5 ? 1 : -1), y0 - s, c);
      }
      if (h > 34 && rng() < 0.3)
        for (let s = 0; s < 5; s++) put(front, x + lean * h * 0.95, y0 - h - s, shade[3]);
    }
    /* A few broad blades catching a little light. */
    for (let i = 0; i < Math.round(26 * SX); i++) {
      const x = rng() * W, y0 = H + 2 - rng() * 18, h = 16 + rng() * 30;
      const lean = (rng() - 0.5) * 0.7;
      for (let s = 0; s < h; s++) {
        const q = s / h, xx = x + lean * s * (0.3 + q);
        put(front, xx, y0 - s, shade[4]);
        if (q > 0.15 && q < 0.85) put(front, xx + (lean > 0 ? -1 : 1), y0 - s, shade[2]);
      }
    }

    this.leaves = [];
    const foliage = new Set([...shade, ...lit]);
    for (let i = 0; i < Math.round(150 * SX); i++) {
      const x = Math.floor(rng() * W), y = Math.floor(rng() * 74);
      const src = front[y * W + x];
      if (!foliage.has(src)) continue;             /* never bark, never sky */
      this.leaves.push({ x, y, k: 1.3 + rng() * 4.2, ph: rng() * Math.PI * 2, up: lit[2], dn: lit[1] });
    }

    const rc = C.rock.map(pack);
    this.stoneFn = (arr, x, y, r) => {
      for (let dy = -r; dy <= r * 0.8; dy++)
        for (let dx = -r * 1.3; dx <= r * 1.3; dx++) {
          const q = (dx * dx) / (r * r * 1.7) + (dy * dy) / (r * r);
          if (q > 1) continue;
          if (q > 0.6 && nF((x + dx) / W, (y + dy) / H) < 0.42) continue;
          const l = (-dx * 0.5 - dy) / r;
          put(arr, x + dx, y + dy, rc[l > 0.6 ? 4 : l > 0.15 ? 3 : l > -0.4 ? 1 : 0]);
        }
    };
    for (let i = 0; i < 6; i++) this.stoneFn(land, rng() * W, HZ + 1 + rng() * 3, 1.6 + rng() * 2.4);

    const rgb = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
    this.pdDeep = rgb(C.pond.deep); this.pdMid = rgb(C.pond.mid); this.pdCool = rgb(C.pond.cool);
    this.shaftRGB = rgb(C.shaft);
    this.rocks = []; this.shelves = []; this.rockC = rc;
    this.foamC = pack("#8FB8C8");
    /* ── lily pads: rafts on the surface, sized by how near they are ────── */
    this.lily = [];
    this.lilyC = (C.lily || ["#16311F", "#22462C", "#3C6B40", "#E4D2DE", "#F0E4B8"]).map(pack);
    for (let cl = 0; cl < 6; cl++) {
      const cxp = 14 + rng() * (W - 28);
      const xi0 = Math.max(0, Math.min(W - 1, Math.round(cxp)));
      const cy = shore[xi0] + 10 + Math.pow(rng(), 0.7) * (H - shore[xi0] - 24);
      const n = 2 + Math.floor(rng() * 4);
      for (let i = 0; i < n; i++) {
        const px2 = cxp + (rng() - 0.5) * 34;
        const py2 = cy + (rng() - 0.5) * 16;
        const xi = Math.max(0, Math.min(W - 1, Math.round(px2)));
        if (py2 <= shore[xi] + 4 || py2 >= H - 1) continue;
        /* keep the bird's own patch of water clear */
        if (Math.abs(px2 - W * 0.37) < W * 0.057 && py2 < shore[xi] + 46) continue;
        const p = (py2 - shore[xi]) / Math.max(1, H - shore[xi]);
        const rx = 1.8 + p * 4.2 + rng() * 1.2;
        this.lily.push({ x: px2, y: py2, rx, ry: Math.max(1, rx * (0.3 + p * 0.14)),
                         ph: rng() * 6.283, notch: rng() < 0.55 ? 1 : -1,
                         tone: rng(), vein: rng() < 0.4,
                         flower: rng() < 0.14 ? (rng() < 0.5 ? 3 : 4) : 0 });
      }
    }
    this.lily.sort((a, b) => a.y - b.y);

    /* ── fish: closed paths, so the loop stays seamless ──────────────────── */
    this.fish = [];
    for (let i = 0; i < 4; i++) {
      const cxp = 30 + rng() * (W - 60);
      const xi = Math.max(0, Math.min(W - 1, Math.round(cxp)));
      const cy = shore[xi] + 26 + rng() * (H - shore[xi] - 40);
      this.fish.push({ cx: cxp, cy, ax: 16 + rng() * 34, ay: 3 + rng() * 7,
                       ph: rng() * 6.283, sp: rng() < 0.5 ? 1 : 2, len: 3 + Math.floor(rng() * 3) });
    }

    if (C.bare) {
      this.bareTrees(land, 1); this.bareTrees(this.landSrc, 1); this.bareTrees(front, 0);
      /* the shimmer list points at leaves that no longer exist */
      this.leaves = [];
    }
    if (C.winter) {
      this.snowLoad(land, C); this.snowLoad(this.landSrc, C); this.snowLoad(front, C);
      this.leaves = [];          /* nothing green left to catch the light */
    }
    if (C.snow) { this.snowSettle(land); this.snowSettle(this.landSrc); }

    this.creekBase = land;
    this.creekCanopy = front;
    {
      const sky0 = (this.SKY[0] & 255) | ((this.SKY[1] & 255) << 8) | ((this.SKY[2] & 255) << 16) | (255 << 24);
      for (let x = 0; x < W; x++) if (!land[x]) land[x] = sky0;
      for (let y = 1; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!land[i]) land[i] = land[i - W];
      }
    }
    this.HZ = HZ;
  }

  /* ── the street at dusk ─────────────────────────────────────────────
     Built the way the glade is: a dark near frame on one side, one house
     carrying the middle with real architecture on it, a lighter one set
     back, and warm light that leaves the windows and lands on something.
     No water, no mirror, and nothing symmetrical.                      */
  buildStreet(S, rng) {
    const T = S.town;
    const out = new Uint32Array(W * H);
    const P = {};
    for (const k of Object.keys(T)) if (typeof T[k] === "string") P[k] = pack(T[k]);
    const TR = T.trunk.map(pack);
    const put = (x, y, c) => {
      x = Math.round(x); y = Math.round(y);
      if (x >= 0 && x < W && y >= 0 && y < H) out[y * W + x] = c;
    };
    const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    /* Light lands on a surface; it does not tint the empty air. */
    const wash = (x, y, c, k) => {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || x >= W || y < 0 || y >= H || k <= 0.015) return;
      const i = y * W + x, s = out[i];
      if (!s) return;
      out[i] = (255 << 24)
        | (Math.min(255, Math.round(((s >> 16) & 255) + (c[2] - ((s >> 16) & 255)) * k)) << 16)
        | (Math.min(255, Math.round(((s >> 8) & 255) + (c[1] - ((s >> 8) & 255)) * k)) << 8)
        | Math.min(255, Math.round((s & 255) + (c[0] - (s & 255)) * k));
    };
    const dith = (x, y, k) => (BAYER[(y & 3) * 4 + (x & 3)] + 0.47) < k;

    const GY = 152, LT = 140, KF = 164, RT = 165, KN = 188, NV = 189;
    const winRGB = rgb(T.win), poolRGB = rgb(T.pool);
    const lit = [];

    /* the wood behind the lots */
    for (let i = 0; i < 34; i++) {
      const cx = Math.round(rng() * (W + 30) - 15);
      const th = Math.round(16 + rng() * 26), tw = Math.max(2, Math.round(th * 0.28));
      const c = rng() < 0.4 ? P.treeFar : P.tree;
      for (let r = 0; r < th; r++) {
        let hw = Math.round(tw * Math.pow(r / th, 0.8));
        if (r % 3 === 2) hw = Math.max(0, hw - 1);
        for (let x = cx - hw; x <= cx + hw; x++) put(x, LT + 4 - th + r, c);
      }
      for (let x = cx - 1; x <= cx + 1; x++) for (let y = LT + 1; y < LT + 5; y++) put(x, y, c);
    }

    /* the ground the houses stand in, before the houses */
    for (let y = LT; y < KF; y++) for (let x = 0; x < W; x++)
      put(x, y, dith(x, y, 0.22 + (y - LT) / (KF - LT) * 0.3) ? P.lawnLit : P.lawn);

    const sash = (wx, wy, w, h, state, trim) => {
      const c = state === 2 ? P.win : state === 1 ? P.winDim : P.winOff;
      for (let y = wy; y < wy + h; y++) for (let x = wx; x < wx + w; x++) put(x, y, c);
      for (let x = wx - 1; x <= wx + w; x++) { put(x, wy - 1, trim); put(x, wy + h, trim); }
      for (let y = wy - 1; y <= wy + h; y++) { put(wx - 1, y, trim); put(wx + w, y, trim); }
      for (let y = wy; y < wy + h; y++) put(wx + ((w / 2) | 0), y, trim);
      for (let x = wx; x < wx + w; x++) put(x, wy + ((h / 2) | 0), trim);
      if (state) lit.push({ x: wx + w / 2, y: wy + h, w, k: state === 2 ? 1 : 0.5 });
    };

    const block = (x0, x1, top, base, wall, siding, roof, pitch) => {
      for (let y = top; y < base; y++) for (let x = x0; x <= x1; x++) put(x, y, wall);
      /* clapboard: one lighter course every three rows, dithered so it is a
         texture rather than a set of stripes */
      for (let y = top + 2; y < base; y += 3)
        for (let x = x0; x <= x1; x++) if (dith(x, y, 0.62)) put(x, y, siding);
      const span = x1 - x0;
      const rh = Math.round((span / 2) * pitch);
      for (let r = 0; r <= rh; r++) {
        const q = r / rh;
        const a = Math.round(x0 - 2 + q * (span / 2 + 2));
        const b = Math.round(x1 + 2 - q * (span / 2 + 2));
        if (a > b) break;
        for (let x = a; x <= b; x++) put(x, top - r, roof);
      }
      return rh;
    };

    /* ── the house that carries the frame ── */
    const AX0 = 104, AX1 = 168, ATOP = 116;
    const arh = block(AX0, AX1, ATOP, GY, P.wallA, P.sidingA, P.roofA, 1);
    /* chimney, off to one side */
    for (let y = ATOP - arh - 9; y < ATOP - Math.round(arh * 0.45); y++)
      for (let x = 148; x <= 152; x++) put(x, y, P.roofA);
    for (let x = 147; x <= 153; x++) put(x, ATOP - arh - 9, P.trimA);
    /* a dormer breaking the roof line */
    block(126, 138, ATOP - Math.round(arh * 0.55), ATOP - Math.round(arh * 0.2), P.wallA, P.sidingA, P.roofA, 1.2);
    sash(129, ATOP - Math.round(arh * 0.5), 7, 7, rng() < 0.5 ? 2 : 0, P.trimA);
    /* two ranks of windows */
    sash(112, 124, 9, 11, 2, P.trimA);
    sash(140, 124, 9, 11, 0, P.trimA);
    sash(112, 140, 9, 9, 1, P.trimA);
    /* porch: a roof on posts, a door, and a light beside it */
    const PY = 138;
    for (let x = 132; x <= 172; x++) { put(x, PY, P.roofA); put(x, PY + 1, P.roofA); }
    for (let r = 1; r <= 4; r++) for (let x = 132 + r; x <= 172 - r; x++) put(x, PY - r, P.roofA);
    for (const px of [134, 152, 170]) for (let y = PY + 2; y < GY; y++) { put(px, y, P.trimA); put(px + 1, y, P.wallA); }
    for (let y = GY - 12; y < GY; y++) for (let x = 142; x <= 148; x++) put(x, y, P.roofA);
    for (let y = GY - 10; y < GY - 4; y++) for (let x = 143; x <= 147; x++) put(x, y, P.winDim);
    put(139, GY - 13, P.win); put(140, GY - 13, P.win); put(139, GY - 12, P.win);
    lit.push({ x: 139, y: GY - 11, w: 3, k: 0.6 });
    /* steps down to the path */
    for (let s = 0; s < 3; s++) for (let x = 141 - s; x <= 149 + s; x++) put(x, GY + s, P.trimA);

    /* ── the neighbour, set back and hazier ── */
    const BX0 = 28, BX1 = 74, BTOP = 122;
    const brh = block(BX0, BX1, BTOP, GY - 4, P.wallB, P.sidingB, P.roofB, 1.15);
    for (let y = BTOP - brh - 7; y < BTOP - Math.round(brh * 0.5); y++)
      for (let x = 40; x <= 43; x++) put(x, y, P.roofB);
    sash(36, 130, 7, 9, 0, P.roofB);
    sash(58, 130, 7, 9, 2, P.roofB);
    /* a garage wing joining it to the frame */
    block(76, 96, 134, GY - 2, P.wallB, P.sidingB, P.roofB, 1);
    for (let y = 138; y < GY - 3; y++) for (let x = 80; x <= 92; x++) put(x, y, P.roofB);

    /* hedge along the lot line, ragged on top */
    for (let x = 0; x < W; x++) {
      const h = 5 + Math.round(Math.abs(Math.sin(x * 0.09) * 2.6 + Math.sin(x * 0.31 + 1.4) * 1.8));
      for (let y = KF - h; y < KF; y++) put(x, y, P.hedge);
    }
    /* a path and a driveway cutting it */
    for (let y = GY + 2; y < KF; y++) for (let x = 141; x <= 149; x++) put(x, y, P.kerb);
    for (let y = GY - 2; y < KF; y++) for (let x = 78; x <= 94; x++) put(x, y, P.lawnLit);

    /* kerbs and asphalt */
    for (let x = 0; x < W; x++) { put(x, KF, P.kerb); put(x, KN, P.kerb); }
    for (let y = RT; y < KN; y++)
      for (let x = 0; x < W; x++)
        put(x, y, dith(x, y, 0.16 + (y - RT) / (KN - RT) * 0.22) ? P.roadLit : P.road);

    /* ── light doing something: a wedge under every lit window, a pool
         under the lamp, and both broken up on the wet asphalt ── */
    for (const L of lit) {
      for (let y = GY; y < KF + 2; y++) {
        const q = (y - GY) / (KF + 2 - GY);
        const hw = L.w * 0.5 + q * 7;
        const k = 0.34 * L.k * (1 - q) * (1 - q);
        for (let x = Math.round(L.x - hw); x <= Math.round(L.x + hw); x++) {
          const e = 1 - Math.abs(x - L.x) / Math.max(1, hw);
          if (!dith(x, y, k * e * 2.4)) continue;
          wash(x, y, winRGB, k * e);
        }
      }
    }

    const LX = 190, LHEAD = 104;
    for (let y = LHEAD; y < KF; y++) { put(LX, y, P.trimA); put(LX + 1, y, P.roofA); }
    for (let x = LX - 1; x <= LX + 2; x++) for (let y = LHEAD - 4; y < LHEAD; y++) put(x, y, P.lamp);
    for (let x = LX - 2; x <= LX + 3; x++) put(x, LHEAD - 5, P.trimA);
    for (let y = RT; y < KN; y++) {
      for (let x = LX - 34; x <= LX + 34; x++) {
        const q = Math.pow((x - LX) / 34, 2) + Math.pow((y - 178) / 13, 2);
        if (q > 1) continue;
        const k = (1 - q) * 0.5;
        if (!dith(x, y, k * 1.9)) continue;
        wash(x, y, poolRGB, k);
      }
    }
    /* window light on the wet road, in broken vertical runs */
    for (const L of lit) {
      for (let y = RT; y < KN; y++) {
        const q = (y - RT) / (KN - RT);
        const k = 0.2 * L.k * (1 - q);
        if (Math.sin(y * 1.15 + L.x * 0.7) < 0) continue;
        const x = Math.round(L.x + Math.sin(y * 0.4 + L.x * 0.3) * (1 + q * 3));
        wash(x, y, winRGB, k);
        wash(x + 1, y, winRGB, k * 0.5);
      }
    }

    /* the verge you are standing on */
    for (let x = 0; x < W; x++) {
      const top = NV + 2 + Math.round(Math.sin(x * 0.07) * 1.6 + Math.sin(x * 0.23 + 2) * 1.2);
      for (let y = top; y < H; y++) put(x, y, P.grass);
      if (rng() < 0.5) {
        const bh = 4 + Math.round(Math.pow(rng(), 1.6) * 14);
        const lean = (rng() - 0.5) * 0.5;
        for (let s = 0; s < bh; s++) put(x + lean * s, top - s, rng() < 0.18 ? P.grassTip : P.grass);
      }
    }

    /* ── the near frame: one trunk owning the left edge, canopy over it ── */
    for (let y = 0; y < H; y++) {
      const q = y / H;
      const cx = 8 + Math.sin(q * 2.1 + 0.4) * 7;
      const hw = (16 + q * 20) / 2;
      for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
        const u = (x - (cx - hw)) / Math.max(1, hw * 2);
        const rib = Math.sin(u * 11 + Math.sin(u * 3.4) * 1.7 + y * 0.05);
        let k = u < 0.14 ? 1 : u < 0.4 ? 3 : u < 0.72 ? 2 : 0;
        if (rib > 0.55) k += 1; else if (rib < -0.55) k -= 1;
        put(x, y, TR[Math.max(0, Math.min(4, k))]);
      }
    }
    /* a limb reaching across, and the canopy it carries */
    { let lx = 16, ly = 34, la = -0.16;
      for (let s = 0; s < 96; s++) {
        la += (rng() - 0.5) * 0.05 + 0.004;
        lx += Math.cos(la) * 1.1; ly += Math.sin(la) * 1.1;
        const th = Math.max(0, Math.round(3.5 * (1 - s / 96)));
        for (let k = -th; k <= th; k++) put(lx, ly + k, k < 0 ? TR[3] : TR[1]);
      }
    }
    const leafMass = (cx, cy, r) => {
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r * 0.8); y++)
        for (let x = Math.floor(cx - r * 1.4); x <= Math.ceil(cx + r * 1.4); x++) {
          const q = Math.pow((x - cx) / (r * 1.4), 2) + Math.pow((y - cy) / r, 2);
          if (q > 1) continue;
          if (q > 0.5 && rng() < 0.42) continue;
          put(x, y, P.canopy);
        }
    };
    for (let i = 0; i < 26; i++) {
      const x = Math.pow(rng(), 1.4) * 150 - 14;
      const y = -14 + Math.pow(Math.max(0, x) / 150, 1.4) * 34 + (rng() - 0.4) * 16;
      const r = 7 + rng() * 15 * (1 - Math.max(0, x) / 210);
      if (y >= r * 0.5) continue;
      leafMass(x, y, r);
    }
    for (let i = 0; i < 5; i++) leafMass(W - 6 + rng() * 20, -12 + rng() * 16, 8 + rng() * 10);
    for (let i = 0; i < 7; i++) leafMass(20 + rng() * 26, 30 + rng() * 40, 5 + rng() * 7);

    this.streetBuf = out;
    this.streetLamp = { x: LX, y: LHEAD - 3, rgb: rgb(T.lamp) };
  }

  drawStreet(t, TAU) {
    const buf = this.buf, S = this.S;
    const src = this.streetBuf;
    for (let i = 0; i < W * H; i++) if (src[i]) buf[i] = src[i];

    /* the lamp's own glow, stepped out of it against the sky */
    const L = this.streetLamp;
    for (let dy = -9; dy <= 9; dy++) for (let dx = -9; dx <= 9; dx++) {
      const q = (dx * dx + dy * dy) / 81;
      if (q > 1) continue;
      const k = (1 - q) * 0.5;
      const x = L.x + dx, y = L.y + dy;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      if (BAYER[(y & 3) * 4 + (x & 3)] + 0.47 > k * 2.1) continue;
      const s = buf[y * W + x];
      buf[y * W + x] = (255 << 24)
        | (Math.min(255, Math.round(((s >> 16) & 255) + (L.rgb[2] - ((s >> 16) & 255)) * k)) << 16)
        | (Math.min(255, Math.round(((s >> 8) & 255) + (L.rgb[1] - ((s >> 8) & 255)) * k)) << 8)
        | Math.min(255, Math.round((s & 255) + (L.rgb[0] - (s & 255)) * k));
    }

    if (this.opts.showHeron !== false && !S.noHeron) {
      const base = S.heron.base, ox = S.heron.x;
      for (let dx = -7; dx <= 9; dx++) {
        if (Math.abs(dx - 1) / 8 > 1) continue;
        const x = ox + 12 + dx, y = base + 1;
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        const s = buf[y * W + x];
        buf[y * W + x] = (255 << 24) | ((((s >> 16) & 255) * 0.7) << 16)
          | ((((s >> 8) & 255) * 0.7) << 8) | ((s & 255) * 0.7);
      }
    }
    this.drawHeron(t, TAU);

    for (let y = 0; y < 14; y++) {
      const k = (14 - y) / 14 * 0.42;
      for (let x = 0; x < W; x++) {
        const i = y * W + x, s = buf[i];
        buf[i] = (255 << 24) | ((((s >> 16) & 255) * (1 - k)) << 16)
          | ((((s >> 8) & 255) * (1 - k)) << 8) | ((s & 255) * (1 - k));
      }
    }
    this.ctx.putImageData(this.img, 0, 0);
  }

  /* Snow lies on upward faces and nowhere else. That single rule is what makes
     a snowy scene read, and breaking it is what made every earlier attempt look
     like spray: a vertical trunk face stays wet and dark, which is precisely
     what gives winter the highest contrast of any season. Bark is deliberately
     excluded from taking a load — the near trunks run off the top of the frame,
     so their "top" is a cut edge rather than a real surface. */
  snowLoad(arr, C) {
    const WI = C.winter;
    if (!WI) return;
    const u = h => pack(h) >>> 0;
    const takes = new Set([...C.shade, ...C.wood, ...C.lit, ...C.floor, ...C.moss].map(u));
    const hi = pack(WI.snow[0]), mid = pack(WI.snow[1]);
    const src = arr.slice();
    const isTop = i => !src[i - W];
    for (let y = 2; y < H; y++) {
      let x = 0;
      while (x < W) {
        const i = y * W + x;
        const solid = j => takes.has(src[j] >>> 0) && isTop(j)
          && src[j + W] && (j + 2 * W >= W * H || src[j + 2 * W]);
        if (!solid(i)) { x++; continue; }
        /* how far this upward-facing surface runs before it turns */
        let L = 1;
        while (x + L < W && solid(y * W + x + L)) L++;
        /* Under three pixels is a twig edge, not a shelf: nothing settles.
           Above it, snow fills solid and leaves the two ends grey, so the cap
           has a lit top and a shaded lip instead of a hard white line. */
        if (L >= 3 && hash2(x, y) < 0.72) {
          for (let d = 0; d < L; d++) {
            const q = d / (L - 1);
            arr[y * W + x + d] = (q > 0.13 && q < 0.87) ? hi : mid;
          }
          if (L >= 7)
            for (let d = 1; d < L - 1; d++) {
              const k = (y + 1) * W + x + d;
              if (takes.has(src[k] >>> 0)) arr[k] = mid;
            }
        }
        x += L;
      }
    }
  }

  /* Snow does not coat a drawing, it lands on the edges that face up. Finding
     those by luminance — a dark pixel under a brighter one is a top edge —
     keeps every silhouette in the glade intact and just dusts it. */
  snowSettle(arr) {
    const C = this.S.creek, HZ = this.HZ;
    const hi = pack(C.snow.hi), lo = pack(C.snow.lo);
    const lum = c => (((c & 255) * 3 + ((c >> 8) & 255) * 6 + ((c >> 16) & 255)) / 10) | 0;
    const out = arr.slice();
    for (let x = 0; x < W; x++)
      for (let y = 1; y < Math.min(H - 1, HZ + 30); y++) {
        const i = y * W + x, a = arr[i], b = arr[i - W];
        if (!a || !b) continue;
        /* A bark row is darker than the row above it too, which is how the
           trunks got dusted. Requiring the pixel above to be genuinely bright
           means only an edge open to the sky collects anything. */
        if (lum(b) - lum(a) < 34 || lum(b) < 96) continue;
        const d = BAYER[(y & 3) * 4 + (x & 3)] + 0.47;
        if (d > 0.86) continue;
        out[i] = d > 0.44 ? hi : lo;
        /* a second row only where the surface keeps going down, so a twig
           gets one pixel and a bough gets two */
        if (d < 0.26 && lum(arr[i + W]) <= lum(a) + 8) out[i + W] = lo;
      }
    arr.set(out);
  }

  drawCreek(t, TAU) {
    this.size();
    const buf = this.buf, S = this.S, C = S.creek;
    const sparkle = this.opts.sparkle !== false && this.S.sparkle !== false;
    const HZ = this.HZ, src = this.landSrc;
    const deep = this.pdDeep, mid = this.pdMid, cool = this.pdCool;
    buf.set(this.creekBase);

    /* ── the water: a true mirror, compressed by the viewing angle, its
       displacement growing as the surface comes toward you ─────────────── */
    const shore = this.shore;
    for (let y = HZ - 14; y < H; y++) {
      const ph = y * 0.42 - t * TAU * 6;
      for (let x = 0; x < W; x++) {
        const sh = shore[x];
        const d = y - sh;
        if (d < 1) continue;
        const p = d / Math.max(1, H - sh);
        /* Nearer water shows more of the surface, so ripples throw further. */
        const amp = 0.6 + Math.pow(p, 1.5) * 9;
        const sy = Math.max(0, Math.round(sh - d * 0.58));
        const off = Math.round(Math.sin(ph + x * 0.045) * amp + Math.sin(ph * 0.43 + x * 0.017) * amp * 0.55);
        const s = src[sy * W + Math.max(0, Math.min(W - 1, x + off))];
        const sr = s & 255, sg = (s >> 8) & 255, sb = (s >> 16) & 255;
        /* Water keeps less of the image the closer it gets, and goes cold. */
        const hold = 0.7 * (1 - Math.pow(p, 0.85) * 0.72);
        const wr = mid[0] + (deep[0] - mid[0]) * p, wg = mid[1] + (deep[1] - mid[1]) * p, wb = mid[2] + (deep[2] - mid[2]) * p;
        let r = wr + (sr - wr) * hold, g = wg + (sg - wg) * hold, b = wb + (sb - wb) * hold;
        /* Crests catching the sky. */
        const crest = Math.sin(ph * 1.15 + x * 0.09) * Math.sin(ph * 0.37 + x * 0.031);
        if (crest > 0.72) { const q = (crest - 0.72) * 2.4 * (0.3 + p); r += (cool[0] - r) * q; g += (cool[1] - g) * q; b += (cool[2] - b) * q; }
        buf[y * W + x] = (255 << 24) | (b << 16) | (g << 8) | r;
      }
    }

    /* Fish, under the surface: a darker patch of water, not a drawn animal. */
    for (const fs of this.fish) {
      const a = t * TAU * fs.sp + fs.ph;
      const fx = fs.cx + Math.cos(a) * fs.ax;
      const fy = fs.cy + Math.sin(a * 2) * fs.ay;
      const dir = -Math.sin(a) >= 0 ? 1 : -1;
      const xi = Math.max(0, Math.min(W - 1, Math.round(fx)));
      if (fy <= shore[xi] + 6 || fy >= H - 1) continue;
      for (let s = 0; s < fs.len; s++) {
        const px2 = Math.round(fx - dir * s), py2 = Math.round(fy + Math.sin(a * 6 + s) * 0.3);
        if (px2 < 0 || px2 >= W || py2 < 0 || py2 >= H) continue;
        const k = s === 0 ? 0.66 : s === fs.len - 1 ? 0.86 : 0.74;
        const c = buf[py2 * W + px2];
        buf[py2 * W + px2] = (255 << 24) | ((((c >> 16) & 255) * k) << 16)
          | ((((c >> 8) & 255) * k) << 8) | ((c & 255) * k);
      }
      /* the tail, one pixel behind and flicking */
      const tx = Math.round(fx - dir * fs.len), ty = Math.round(fy + (Math.sin(a * 6) > 0 ? 1 : -1));
      if (tx >= 0 && tx < W && ty >= 0 && ty < H) {
        const c = buf[ty * W + tx];
        buf[ty * W + tx] = (255 << 24) | ((((c >> 16) & 255) * 0.82) << 16)
          | ((((c >> 8) & 255) * 0.82) << 8) | ((c & 255) * 0.82);
      }
    }

    /* Lily pads: flat ellipses with a notch, riding the surface. */
    const LC = this.lilyC;
    for (const lp of this.lily) {
      const bobY = lp.y + Math.sin(t * TAU * 2 + lp.ph) * 0.6;
      const bobX = lp.x + Math.sin(t * TAU + lp.ph * 1.7) * 0.8;
      const rx = lp.rx, ry = lp.ry;
      for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
        const t2 = dy / ry;
        if (Math.abs(t2) > 1) continue;
        const halfW = rx * Math.sqrt(1 - t2 * t2);
        const yy = Math.round(bobY + dy);
        if (yy < 0 || yy >= H) continue;
        for (let dx = -Math.ceil(halfW); dx <= Math.ceil(halfW); dx++) {
          const xx = Math.round(bobX + dx);
          if (xx < 0 || xx >= W) continue;
          /* the notch: a wedge cut toward one side */
          const ang = Math.atan2(dy / Math.max(0.001, ry), dx / Math.max(0.001, rx));
          if (lp.notch > 0 ? (ang > 1.05 && ang < 2.1) : (ang < -1.05 && ang > -2.1)) {
            if (Math.abs(dx) > rx * 0.24) continue;
          }
          /* lit along the top edge, dark along the bottom */
          let c = dy <= -ry * 0.42 ? LC[2] : dy >= ry * 0.45 ? LC[0] : LC[1];
          if (lp.tone > 0.66 && c === LC[1]) c = LC[2];
          else if (lp.tone < 0.3 && c === LC[1]) c = LC[0];
          if (lp.vein && Math.abs(dy) < 0.7 && Math.abs(dx) < halfW * 0.72) c = LC[0];
          buf[yy * W + xx] = c;
        }
      }
      /* a shadow of the pad, immediately under it */
      const shy = Math.round(bobY + ry + 1);
      if (shy < H) {
        for (let dx = -Math.round(rx * 0.7); dx <= Math.round(rx * 0.7); dx++) {
          const xx = Math.round(bobX + dx);
          if (xx < 0 || xx >= W) continue;
          const c = buf[shy * W + xx];
          buf[shy * W + xx] = (255 << 24) | ((((c >> 16) & 255) * 0.7) << 16)
            | ((((c >> 8) & 255) * 0.7) << 8) | ((c & 255) * 0.7);
        }
      }
      if (lp.flower) {
        const fx = Math.round(bobX + rx * 0.2), fy = Math.round(bobY - ry - 1);
        if (fy >= 0 && fy < H && fx >= 0 && fx < W) {
          buf[fy * W + fx] = LC[lp.flower];
          if (fx + 1 < W) buf[fy * W + fx + 1] = LC[lp.flower];
          if (fy + 1 < H) buf[(fy + 1) * W + fx] = LC[lp.flower];
        }
      }
    }

    if (C.ice) {
      const i1 = pack(C.ice.hi), i2 = pack(C.ice.lo), i3 = pack(C.ice.dark);
      const ck = pack(C.ice.crack);
      const mixTo = (c, tgt, k) => {
        const r = c & 255, g = (c >> 8) & 255, b = (c >> 16) & 255;
        const R2 = tgt & 255, G2 = (tgt >> 8) & 255, B2 = (tgt >> 16) & 255;
        return (255 << 24) | (Math.round(b + (B2 - b) * k) << 16)
          | (Math.round(g + (G2 - g) * k) << 8) | Math.round(r + (R2 - r) * k);
      };
      /* a ramp fine enough that stepping between neighbours is invisible */
      const N = 15, RAMP = new Uint32Array(N);
      for (let i = 0; i < N; i++) {
        const q = i / (N - 1);
        RAMP[i] = q < 0.5 ? mixTo(i3, i2, q / 0.5) : mixTo(i2, i1, (q - 0.5) / 0.5);
      }
      for (let x = 0; x < W; x++) {
        const sh = this.shore[x], span = Math.max(1, H - sh);
        for (let y = sh + 1; y < H; y++) {
          const i = y * W + x;
          const dep = (y - sh) / span;
          const patch = vnoise(x * 0.6, y * 1.7, 5) - 0.5;
          /* wind scours the sheet in long shallow streaks along the pool */
          const scour = Math.sin(y * 1.7 + vnoise(x * 0.3, y * 0.4, 6) * 7) * 0.05;
          /* black ice: patches the wind kept clear, where the dark water under
             the sheet reads straight through. Small and high-frequency, so they
             are a texture on the surface and never a hole in it. */
          const clear = Math.max(0, vnoise(x * 1.3, y * 2.6, 3) - 0.58) * 1.9;
          /* palest in the lee of the near bank, swept and dark over the middle,
             and darkest of all in the shadow the far bank throws */
          let v = 0.26 + Math.pow(dep, 1.7) * 0.66 + patch * 0.46 + scour - clear * 0.42;
          v = v < 0 ? 0 : v > 1 ? 1 : v;
          const d = BAYER[(y & 3) * 4 + (x & 3)];
          const idx = Math.max(0, Math.min(N - 1, Math.round(v * (N - 1) + d)));
          buf[i] = RAMP[idx];          /* solid: the water is gone, not veiled */
        }
      }
      /* stress cracks: pale, because a crack in lake ice scatters light */
      for (let s = 0; s < 7; s++) {
        let cx = ((s * 137) % W), cy = this.shore[cx] + 6 + ((s * 53) % Math.max(8, H - this.shore[cx] - 10));
        let a = (s % 2 ? 0.4 : -0.4) + Math.sin(s * 2.1) * 0.9;
        for (let k = 0; k < 60; k++) {
          a += Math.sin(k * 0.31 + s) * 0.12;
          cx += Math.cos(a) * 1.6; cy += Math.sin(a) * 0.7;
          const xi = Math.round(cx), yi = Math.round(cy);
          if (xi < 0 || xi >= W || yi >= H) break;
          if (yi <= this.shore[xi] + 1) break;
          const j = yi * W + xi;
          buf[j] = mixTo(buf[j], ck, 0.75);
          if ((k & 3) === 0 && yi + 1 < H) buf[j + W] = mixTo(buf[j + W], i1, 0.6);
        }
      }
    }
    /* Reeds standing in the water, and their own broken reflections. */
    for (const rd of this.waterReeds) {
      for (let s = 0; s < rd.h; s++) {
        const x = Math.round(rd.x + rd.lean * s), y = Math.round(rd.y - s);
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        buf[y * W + x] = rd.c;
      }
      for (let s = 1; s < rd.h * 0.7; s++) {
        const y = Math.round(rd.y + s * 0.6);
        if (y >= H) break;
        if (Math.sin(y * 1.1 + t * TAU * 5) < 0) continue;
        const x = Math.round(rd.x - rd.lean * s + Math.sin(y * 0.4 - t * TAU * 6) * (1 + s * 0.16));
        if (x < 0 || x >= W) continue;
        const c = buf[y * W + x];
        buf[y * W + x] = (255 << 24) | ((((c >> 16) & 255) * 0.55) << 16)
          | ((((c >> 8) & 255) * 0.55) << 8) | ((c & 255) * 0.55);
      }
    }

    if (sparkle) {
      for (let i = 0; i < 26; i++) {
        const a2 = t * TAU * (1.1 + (i % 5) * 0.5) + i * 2.1;
        const x = Math.round(14 + ((i * 61) % (W - 28)) + Math.cos(a2) * 9);
        const y = Math.round(HZ + 6 + ((i * 31) % (H - HZ - 10)) + Math.sin(a2) * 4);
        if (y < HZ || y >= H || x < 0 || x >= W) continue;
        for (let n = 0; n < 1 + (i % 4); n++) {
          const q = x + n;
          if (q >= W) break;
          const s = buf[y * W + q], m = 0.4;
          buf[y * W + q] = (255 << 24)
            | ((((s >> 16) & 255) * (1 - m) + 226 * m) << 16)
            | ((((s >> 8) & 255) * (1 - m) + 236 * m) << 8)
            | ((s & 255) * (1 - m) + 208 * m);
        }
      }
    }

    /* ── shafts through the gap ────────────────────────────────────────── */
    {
      const SH = this.shaftRGB, ang = 0.44, OX = W * 0.65;
      for (let y = 0; y < H; y++) {
        const fade = Math.max(0, 1 - Math.pow(y / (H * 0.8), 1.5)) * 0.9;
        if (fade < 0.012) continue;
        for (let x = 0; x < W; x++) {
          const s = (x - OX) + y * ang;
          const band = Math.sin(s * 0.045 + Math.sin(s * 0.014) * 1.5 + t * TAU * 0.5);
          if (band < 0.5) continue;
          const k = Math.pow((band - 0.5) / 0.5, 1.35) * fade
                  * (0.7 + 0.3 * Math.sin(t * TAU * 1.2 + s * 0.026))
                  * (0.45 + 0.55 * Math.exp(-Math.pow((x - OX + 20) / (W * 0.39), 2)));
          if (k < 0.014) continue;
          const c = buf[y * W + x];
          const cr = c & 255, cg = (c >> 8) & 255, cb = (c >> 16) & 255;
          buf[y * W + x] = (255 << 24)
            | (Math.min(255, Math.round(cb + (SH[2] - cb) * k * 0.7)) << 16)
            | (Math.min(255, Math.round(cg + (SH[1] - cg) * k * 0.82)) << 8)
            | Math.min(255, Math.round(cr + (SH[0] - cr) * k));
        }
      }
    }

    this.drawHeron(t, TAU);

    const fr = this.creekCanopy;
    for (let i = 0; i < W * H; i++) if (fr[i]) buf[i] = fr[i];
    /* g > r is foliage in this palette; sky, bark and water all fail it. */
    const isFol = (i) => { const c = buf[i]; const r = c & 255, g = (c >> 8) & 255, b = (c >> 16) & 255;
      return g > r + 10 && g > b + 6; };
    const folCount = (x, y) => {
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
        if (isFol(yy * W + xx)) n++;
      }
      return n;
    };
    /* A leaf only catches light if it is part of a mass. */
    for (const l of this.leaves) {
      if (folCount(l.x, l.y) < 6) continue;
      const s = Math.sin(t * TAU * l.k + l.ph);
      if (s > 0.9) buf[l.y * W + l.x] = l.up;
      else if (s > 0.66) buf[l.y * W + l.x] = l.dn;
    }


    for (const m of this.motes) {
      const a2 = t * TAU * m.k + m.phase;
      const x = Math.round(m.x + Math.cos(a2) * m.rx), y = Math.round(m.y * 0.8 + Math.sin(a2 * 2) * m.ry);
      if (x < 0 || x >= W || y < 16 || y >= H) continue;
      if (0.5 + 0.5 * Math.sin(a2 * 3 + m.br * 6) < 0.6) continue;
      buf[y * W + x] = this.moteHot;
    }

    if (C.snow) {
      const SN = C.snow, c1 = pack(SN.hi), c2 = pack(SN.lo);
      for (let i = 0; i < SN.count; i++) {
        const sp = 0.5 + (i % 6) * 0.2;
        const fall = ((t * sp * 9 + i * 0.197) % 1 + 1) % 1;
        const y = Math.round(fall * (H + 8)) - 4;
        const x = Math.round(((i * 149) % W) + Math.sin(fall * 6.283 * 1.6 + i) * (3 + (i % 5)));
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        const near = i % 6 > 3;
        buf[y * W + x] = near ? c1 : c2;
        if (near && x + 1 < W) buf[y * W + x + 1] = c1;
      }
    }

    this.ctx.putImageData(this.img, 0, 0);
  }

  /* ── the frame ──────────────────────────────────────────────────────── */
  draw(tIn) {
    this.size(); HZ = this.S.hz || 132; WATER = H - HZ;
    const buf = this.buf;
    if (!buf) return;
    if (!this.lit) { try { this.build(); } catch (e) { console.error("build failed", e); return; } }
    if (!this.lit) return;
    const S = this.S, SKY = this.SKY, SKY_N = this.SKY_N;
    const t = tIn !== undefined ? tIn : (this.opts.t || 0);
    const TAU = Math.PI * 2;

    if (S.layout === "creek") return this.drawCreek(t, TAU);
    if (S.layout === "hilltop") return this.drawHilltop(t, TAU);

    buf.set(this.sky);

    /* Clouds, coloured off the sky ramp so they can never clash with it. */
    for (const L of this.layers) {
      const off = Math.floor(t * L.speed * W) % W;
      const cumulus = S.clouds.style === "cumulus";
      for (let y = 0; y < L.h; y++) {
        const yy = L.y0 + y;
        if (yy < 1 || yy >= HZ - 2) continue;
        const base = this.rowIdx[yy], row = y * W, drow = yy * W;
        for (let x = 0; x < W; x++) {
          const th = L.field[row + (x + off) % W];
          if (th <= 0) continue;
          /* Streaks: thin edges catch light, thick cores hold shadow.
             Cumulus: bright crown, shaded belly. */
          const shade = cumulus
            ? (th - 0.42) * 7.5
            : (th < 0.30 ? 2.6 - th * 3 : (th > 0.66 ? -2.4 : 0.6 - th * 2));
          const p = base + shade * L.mul + this.glow[drow + x] * (S.sun.glow + 0.8)
            + BAYER[(yy & 3) * 4 + (x & 3)] * 0.85;
          buf[drow + x] = SKY[Math.max(0, Math.min(SKY_N, Math.round(p)))];
        }
      }
    }

    /* A distant flock, once around per loop. */
    for (const b of this.birds) {
      const bx = Math.floor(((t * b.sp + b.off) % 1) * (W + 40)) - 20;
      const by = Math.round(b.y + Math.sin((t * b.sp + b.off) * TAU * 3) * 3);
      const up = Math.floor(t * LOOP / 190 + b.sc) % 2 === 0;
      const c = SKY[Math.max(0, Math.min(SKY_N, Math.round(this.rowIdx[by] - 3)))];
      const px = (x, y) => { if (x >= 0 && x < W && y >= 0 && y < HZ) buf[y * W + x] = c; };
      px(bx, by); px(bx - 1, by + (up ? -1 : 1)); px(bx + 1, by + (up ? -1 : 1));
      if (b.sp > 6) { px(bx - 2, by + (up ? -1 : 0)); px(bx + 2, by + (up ? -1 : 0)); }
    }

    if (S.layout === "street") return this.drawStreet(t, TAU);

    const land = this.land;
    for (let i = 0; i < W * HZ; i++) if (land[i]) buf[i] = land[i];

    /* Water: the sky mirrored, compressed, wobbled, cooled and darkened. */
    const Wc = S.water;
    for (let y = HZ; y < H; y++) {
      const depth = (y - HZ) / WATER;
      let srcY = HZ - 1 - Math.round((y - HZ) * (0.55 + depth * 0.62));
      if (srcY < 0) srcY = 0;
      const amp = 0.5 + depth * depth * 4.4;
      const ph = t * TAU * 13 + y * 0.62;
      const off = Math.round(Math.sin(ph) * amp + Math.sin(ph * 0.41 + y * 0.19) * amp * 0.45);
      const drow = y * W, srow = srcY * W;
      const mix = Wc.mix + depth * Wc.mixDepth, keep = 1 - mix;
      const dim = Wc.dim - depth * Wc.dimDepth;
      for (let x = 0; x < W; x++) {
        const s = buf[srow + (((x + off) % W) + W) % W];
        const r = (s & 255) * dim * keep + Wc.tint[0] * mix;
        const g = ((s >> 8) & 255) * dim * keep + Wc.tint[1] * mix;
        const b = ((s >> 16) & 255) * dim * keep + Wc.tint[2] * mix;
        buf[drow + x] = (255 << 24) | (b << 16) | (g << 8) | r;
      }
    }

    const sparkle = this.opts.sparkle !== false && this.S.sparkle !== false;

    /* Shimmer: broken dashes on alternate rows. Light on water is gaps as
       much as glints — filling every row turns the sun path into a slab. */
    if (sparkle) for (let y = HZ + 2; y < H - 2; y += 2) {
      const depth = (y - HZ) / WATER;
      const step = Wc.shimStep + Math.floor(depth * 4);
      const ph = t * TAU * 9 + y * 1.31;
      for (let x = 0; x < W; x += step) {
        const sunNear = Math.exp(-Math.pow((x - this.sunX) / (24 + depth * 44), 2));
        if (sunNear < 0.3) continue;
        const v = Math.sin(x * 0.21 + ph) * Math.sin(x * 0.07 - ph * 0.6) * Math.sin(x * 0.031 + y * 0.4);
        if (v < 0.58 - sunNear * 0.36) continue;
        const k = (0.26 + sunNear * 0.48) * Wc.glint;
        const len = 1 + Math.round(sunNear * 1.8 + depth);
        for (let n = 0; n < len; n++) {
          const px = x + n;
          if (px >= W) continue;
          const i = y * W + px, s = buf[i];
          buf[i] = (255 << 24)
            | ((((s >> 16) & 255) * (1 - k) + this.lit[2] * k) << 16)
            | ((((s >> 8) & 255) * (1 - k) + this.lit[1] * k) << 8)
            | ((s & 255) * (1 - k) + this.lit[0] * k);
        }
      }
    }

    /* Whitecaps where the creek runs over stones. */
    if (this.capC && sparkle) {
      for (let y = HZ + 34; y < H - 6; y += 7) {
        const depth = (y - HZ) / WATER;
        const ph = t * TAU * 11 + y * 0.9;
        for (let x = 0; x < W; x += 9) {
          const v = Math.sin(x * 0.19 + ph) * Math.sin(x * 0.061 - ph * 0.4) * Math.sin(x * 0.027 + y * 0.3);
          if (v < 0.90 - depth * 0.2) continue;
          for (let n = 0; n < 2 + Math.round(depth * 3); n++) {
            const px = x + n;
            if (px >= W) continue;
            const i = y * W + px, s = buf[i], k = 0.2 + depth * 0.22;
            buf[i] = (255 << 24)
              | ((((s >> 16) & 255) * (1 - k) + ((this.capC >> 16) & 255) * k) << 16)
              | ((((s >> 8) & 255) * (1 - k) + ((this.capC >> 8) & 255) * k) << 8)
              | ((s & 255) * (1 - k) + (this.capC & 255) * k);
          }
        }
      }
    }

    this.drawHeron(t, TAU);

    /* Mist drifts against the clouds, so the air reads as having depth. */
    if (this.mist) {
      const M = this.mist;
      const off = ((Math.floor(t * M.speed * W) % W) + W) % W;
      for (let y = 0; y < M.h; y++) {
        const yy = M.y0 + y;
        if (yy < 0 || yy >= H) continue;
        const drow = yy * W;
        for (let x = 0; x < W; x++) {
          const a = M.field[y * W + (x + off) % W] * M.strength;
          if (a <= 0.02) continue;
          const k = Math.min(0.86, a), s = buf[drow + x];
          const r = (s & 255) * (1 - k) + M.colour[0] * k;
          const g = ((s >> 8) & 255) * (1 - k) + M.colour[1] * k;
          const b = ((s >> 16) & 255) * (1 - k) + M.colour[2] * k;
          buf[drow + x] = (255 << 24) | (b << 16) | (g << 8) | r;
        }
      }
    }

    /* Motes over the water, breathing in and out. */
    for (const m of this.motes) {
      const a = t * TAU * m.k + m.phase;
      const x = Math.round(m.x + Math.cos(a) * m.rx);
      const y = Math.round(m.y + Math.sin(a * 2) * m.ry);
      const br = 0.5 + 0.5 * Math.sin(a * 3 + m.br * 6);
      if (br < 0.35 || x < 0 || x >= W || y < HZ || y >= H) continue;
      buf[y * W + x] = br > 0.8 ? this.moteHot : this.moteC;
    }

    /* Reeds last, leaning on a slow breeze. */
    for (const r of this.reeds) {
      const bend = Math.sin(t * TAU * 9 + r.phase) * r.sway;
      for (let k = 0; k < r.h; k++) {
        const f = k / r.h, y = r.base - k;
        if (y < 0 || y >= H) continue;
        const x = Math.round(r.x + (r.lean + bend) * f * f);
        if (x < 0 || x >= W) continue;
        buf[y * W + x] = r.colour;
        if (f < 0.5 && x + 1 < W) buf[y * W + x + 1] = r.colour;
      }
      if (r.cat && r.h > 40) {
        const y0 = r.base - r.h, x = Math.round(r.x + (r.lean + bend));
        for (let j = 0; j < 8; j++) for (let i = -1; i <= 1; i++) {
          const px = x + i, py = y0 + j + 1;
          if (px < 0 || px >= W || py < 0 || py >= H) continue;
          buf[py * W + px] = (i === 1 && j > 1 && j < 6) ? this.catColour : r.colour;
        }
      }
    }

    /* Weather, last of the moving things. Rain blends with what it crosses;
       snow replaces it, because a snowflake is opaque and rain is not. */
    if (S.rain) {
      const RN = S.rain, rc = pack(RN.colour);
      const rr = rc & 255, rg = (rc >> 8) & 255, rb = (rc >> 16) & 255;
      for (let i = 0; i < RN.count; i++) {
        const fall = ((t * RN.speed + i * 0.137) % 1 + 1) % 1;
        const x0 = ((i * 149) % (W + 80)) - 40 + fall * RN.slant * H;
        const y0 = Math.round(fall * (H + RN.len * 2)) - RN.len;
        for (let k = 0; k < RN.len; k++) {
          const yy = y0 + k, xx = Math.round(x0 - k * RN.slant);
          if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
          const s = buf[yy * W + xx], m = k === 0 ? 0.46 : 0.26;
          buf[yy * W + xx] = (255 << 24)
            | (Math.round(((s >> 16) & 255) * (1 - m) + rb * m) << 16)
            | (Math.round(((s >> 8) & 255) * (1 - m) + rg * m) << 8)
            | Math.round((s & 255) * (1 - m) + rr * m);
        }
      }
    }
    if (S.snow) {
      const SN = S.snow, c1 = pack(SN.colour), c2 = pack(SN.dim);
      for (let i = 0; i < SN.count; i++) {
        const sp = SN.speed * (0.5 + (i % 5) * 0.22);
        const fall = ((t * sp * 22 + i * 0.211) % 1 + 1) % 1;
        const yy = Math.round(fall * (H + 6)) - 3;
        const xx = Math.round(((i * 173) % W) + Math.sin(fall * 6.283 * 2 + i) * SN.sway);
        if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue;
        const near = i % 5 > 2;
        buf[yy * W + xx] = near ? c1 : c2;
        if (near && xx + 1 < W) buf[yy * W + xx + 1] = c1;
      }
    }

    /* A soft darkening at the very top, so a form or a headline sits clean. */
    for (let y = 0; y < 14; y++) {
      const k = (14 - y) / 14 * 0.42;
      for (let x = 0; x < W; x++) {
        const i = y * W + x, s = buf[i];
        buf[i] = (255 << 24) | ((((s >> 16) & 255) * (1 - k)) << 16)
          | ((((s >> 8) & 255) * (1 - k)) << 8) | ((s & 255) * (1 - k));
      }
    }

    this.ctx.putImageData(this.img, 0, 0);

  }


  /* ── The hilltop: receding ridges at sundown ──────────────────────────── */
  buildHilltop(S, rng) {
    this.size();
    HZ = S.hz || 128;
    const land = new Uint32Array(W * H);
    const sunX = Math.round(W * htClamp(this.opts.sunAzimuth ?? 0.68, 0.12, 0.88));
    this.htSunX = sunX;

    this.baseV = new Float32Array(HZ + 46);
    for (let y = 0; y < HZ + 46; y++)
      this.baseV[y] = Math.pow(htClamp(y / HZ, 0, 1), 1.95) * 0.90;
    const skyFlat = y => this.SKY[htClamp(Math.round(this.baseV[htClamp(Math.round(y), 0, HZ + 45)]
      * (this.SKY.length - 1)), 0, this.SKY.length - 1)];

    this.crests = [];
    const smooth1 = (x, wl, seed) => {
      const p = x / wl, i0 = Math.floor(p), f = p - i0;
      const a = htHash2(i0, seed), b = htHash2(i0 + 1, seed);
      const k = f * f * (3 - 2 * f);
      return a + (b - a) * k - 0.5;
    };

    HT_RANKS.forEach((R, rank) => {
      const top = new Int16Array(W);
      for (let x = 0; x < W; x++) {
        let h = R.crest;
        h += smooth1(x, 1 / R.f[0] * 0.9, rank * 7 + 1) * R.a[0] * 2.6;
        h += smooth1(x, 1 / R.f[1] * 0.9, rank * 7 + 2) * R.a[1] * 1.15;
        h += smooth1(x, 1 / R.f[2] * 0.9, rank * 7 + 3) * R.a[2] * 0.42;
        h += (htHash2(x * 0.7, rank * 31) - 0.5) * R.rough * 2.4;
        top[x] = Math.round(h);
      }
      const sm = new Int16Array(W);
      for (let x = 0; x < W; x++) {
        const a = top[Math.max(0, x - 1)], b = top[x], c = top[Math.min(W - 1, x + 1)];
        sm[x] = Math.round((a + b * 2 + c) / 4);
      }
      this.crests.push(sm);

      for (let x = 0; x < W; x++) {
        for (let y = sm[x]; y < H; y++) {
          const depth = htClamp((y - sm[x]) / 46, 0, 1);
          const base = htMixc(HT_RIDGE_DARK, skyFlat(sm[x]), R.fade);
          land[y * W + x] = htMixc(base, HT_RIDGE_DARK, depth * (1 - R.fade) * 0.52);
        }
        if (R.fade > 0.70) continue;
        const slope = sm[Math.min(W - 1, x + 2)] - sm[Math.max(0, x - 2)];
        const facing = (x < sunX ? slope > 0 : slope < 0) ? Math.min(1, Math.abs(slope) / 3) : 0;
        if (!facing) continue;
        const near = Math.exp(-Math.pow((x - sunX) / 150, 2));
        const k = facing * near * (0.30 + (1 - R.fade) * 0.34);
        for (let d = 0; d < 2; d++) {
          const y = sm[x] + d;
          if (BAYER[(y & 3) * 4 + (x & 3)] + 0.47 > k * (d ? 0.5 : 1.1)) continue;
          land[y * W + x] = htMixc(land[y * W + x], this.SKY[16 - d * 2], 0.62);
        }
      }
    });

    for (let rank = 4; rank <= 4; rank++) {
      const crest = this.crests[rank];
      const R = HT_RANKS[rank];
      const dark = htMixc(htMixc(HT_RIDGE_DARK, skyFlat(R.crest), R.fade), HT_RIDGE_DARK, 0.20);
      for (let x = 2; x < W - 2; x++) {
        const grove = smooth1(x, 52, 900 + rank) + 0.5;
        if (grove < 0.60) continue;
        if (htHash2(x, 500 + rank) > (grove - 0.60) * (rank === 4 ? 2.0 : 1.3)) continue;
        const h = 4 + Math.round(Math.pow(htHash2(x, 611 + rank), 1.8) * 4);
        const cap = 1;
        for (let r = 0; r < h; r++) {
          const hw = Math.min(cap, Math.floor(r * 0.5));
          const y = crest[x] - h + r;
          for (let d = -hw; d <= hw; d++) {
            const xx = x + d;
            if (y < 0 || y >= H || xx < 0 || xx >= W) continue;
            land[y * W + xx] = dark;
          }
        }
      }
    }

    const hillTop = new Int16Array(W);
    for (let x = 0; x < W; x++) {
      let h = 177 + (x / W) * 10 + Math.sin(x * 0.0125 + 0.7) * 5
        + Math.sin(x * 0.034 + 2.1) * 2.2 + Math.sin(x * 0.088) * 1.1;
      h += (htHash2(x * 0.9, 77) - 0.5) * 2.0;
      const d = (x - HT_HERON_X) / 46;
      h -= 15 * Math.exp(-d * d);
      hillTop[x] = Math.round(h);
    }
    for (let x = 0; x < W; x++) {
      const t = hillTop[x];
      for (let y = t; y < H; y++) {
        const d = htClamp((y - t) / 34, 0, 1);
        land[y * W + x] = HT_HILL[htClamp(3 - Math.round(d * 3.4 + (BAYER[(y & 3) * 4 + (x & 3)] < 0 ? 0 : 0.4)), 0, 3)];
      }
    }
    this.hillTop = hillTop;

    for (let x = 0; x < W; x++) {
      const clump = smooth1(x, 26, 313) + 0.5;
      if (htHash2(x, 401) > clump * 0.72) continue;
      const n = 1 + Math.round(htHash2(x, 907) * 3 + clump * 2);
      const lean = (htHash2(x, 55) - 0.5) * 0.7;
      for (let k = 0; k < n; k++) {
        const xx = Math.round(x + lean * k), yy = hillTop[x] - 1 - k;
        if (xx < 0 || xx >= W || yy < 0) continue;
        land[yy * W + xx] = HT_GRASS[k > n - 2 ? 2 : 0];
      }
    }

    const stone = (cx, cy, r) => {
      for (let j = -r; j <= r * 0.7; j++)
        for (let k = -r * 1.35; k <= r * 1.35; k++) {
          const q = Math.pow(k / (r * 1.35), 2) + Math.pow(j / r, 2);
          if (q > 1) continue;
          const x = Math.round(cx + k), y = Math.round(cy + j);
          if (x < 0 || x >= W || y < 0 || y >= H) continue;
          land[y * W + x] = j < -r * 0.35 ? HT_HILL[3] : j < 0 ? HT_HILL[2] : HT_HILL[0];
        }
    };
    stone(58, hillTop[58] + 3, 5);
    stone(322, hillTop[322] + 5, 7);
    {
      const pxp = 316, ph = 20, ln = 0.14;
      for (let k = 0; k < ph; k++) {
        const x = Math.round(pxp + ln * k), y = hillTop[pxp] - k;
        if (y < 0 || y >= H) continue;
        land[y * W + x] = HT_HILL[1];
        land[y * W + x + 1] = HT_HILL[0];
      }
    }

    this.land = land;

    this.stems = [];
    for (let i = 0; i < 46; i++) {
      const x = Math.round(rng() * W);
      const edge = Math.min(x, W - x) / (W * 0.5);
      if (rng() < edge * 0.62) continue;
      const bs = hillTop[htClamp(x, 0, W - 1)] + Math.round(rng() * 3);
      this.stems.push({
        x, base: bs, h: 4 + Math.round(rng() * 6), ph: rng() * 6.283,
        lean: (rng() - 0.5) * 0.5, seed: rng() < 0.34,
      });
    }

    this.htClouds = [];
    const shelf = (n, y0, y1, len0, len1, hi0, hi1, speed) => {
      for (let i = 0; i < n; i++) {
        const len = Math.round(htLerp(len0, len1, rng()));
        const hgt = Math.round(htLerp(hi0, hi1, rng()));
        const nb = 3 + Math.floor(rng() * 5);
        const grid = new Uint8Array(len * (hgt + 4));
        const GH = hgt + 4;
        for (let b = 0; b < nb; b++) {
          const bx = (0.10 + 0.80 * (b / Math.max(1, nb - 1)) + (rng() - 0.5) * 0.12) * len;
          const t = 1 - Math.abs(b / Math.max(1, nb - 1) - 0.5) * 1.7;
          const rx = (0.10 + rng() * 0.16) * len * (0.45 + t);
          const ry = Math.max(1, (0.30 + rng() * 0.42) * hgt * (0.5 + t));
          const by = 2 + hgt * 0.5 + (rng() - 0.5) * hgt * 0.5;
          for (let y = Math.floor(by - ry); y <= Math.ceil(by + ry); y++)
            for (let x = Math.floor(bx - rx); x <= Math.ceil(bx + rx); x++) {
              if (x < 0 || x >= len || y < 0 || y >= GH) continue;
              const q = Math.pow((x - bx) / rx, 2) + Math.pow((y - by) / ry, 2);
              if (q > 1) continue;
              if (q > 0.66 && htHash2(x + i * 97, y + b * 31) < (q - 0.66) * 1.5) continue;
              grid[y * len + x] = 1;
            }
        }
        const top = new Int16Array(len).fill(-1), bot = new Int16Array(len).fill(-1);
        for (let x = 0; x < len; x++)
          for (let y = 0; y < GH; y++)
            if (grid[y * len + x]) { if (top[x] < 0) top[x] = y; bot[x] = y; }
        this.htClouds.push({
          x: rng() * (W + 300) - 150, y: Math.round(htLerp(y0, y1, rng())),
          len, top, bot, speed, tilt: (rng() - 0.5) * 0.04,
        });
      }
    };
    shelf(7, 8, 40, 34, 76, 7, 15, 1.0);
    shelf(8, 40, 76, 48, 116, 5, 11, 1.5);
    shelf(9, 76, 114, 70, 165, 3, 7, 2.2);

    this.htFlock = [];
    for (let i = 0; i < 7; i++)
      this.htFlock.push({ o: rng(), y: 52 + rng() * 40, sp: 0.5 + rng() * 0.3, ph: rng() * 6.283 });
  }

  drawHilltop(t, TAU) {
    this.size();
    HZ = this.S.hz || 128;
    const buf = this.buf, land = this.land;
    const sunX = this.htSunX || Math.round(W * 0.68);
    const sunY = HZ - 6 + (this.opts.sunHeight ?? 0) + t * 5;

    const px = (x, y, c) => {
      x = Math.round(x); y = Math.round(y);
      if (x >= 0 && x < W && y >= 0 && y < H) buf[y * W + x] = c;
    };
    const blend = (x, y, c, k) => {
      x = Math.round(x); y = Math.round(y);
      if (!(k > 0.01) || !(x >= 0) || x >= W || !(y >= 0) || y >= H) return;
      buf[y * W + x] = htMixc(buf[y * W + x], c, k > 1 ? 1 : k);
    };

    const gl = this.opts.glow ?? 1;
    const NS = this.SKY.length - 1;
    for (let y = 0; y < HZ + 46; y++) {
      const bv = this.baseV[y];
      for (let x = 0; x < W; x++) {
        const dx = (x - sunX), dy = (y - sunY);
        const near = Math.exp(-(dx * dx / 5200 + dy * dy / 1500));
        const wide = Math.exp(-(dx * dx / 46000 + dy * dy / 9000));
        const v = bv + gl * (near * 0.30 + wide * 0.17);
        buf[y * W + x] = this.SKY[htClamp(Math.round(v * NS + BAYER[(y & 3) * 4 + (x & 3)]), 0, NS)];
      }
    }

    const sr = 9;
    for (let j = -sr - 1; j <= sr + 1; j++)
      for (let k = -sr - 1; k <= sr + 1; k++) {
        const q = (k * k) / (sr * sr) + (j * j) / (sr * 0.86 * sr * 0.86);
        if (q > 1) continue;
        px(sunX + k, sunY + j, q > 0.66 ? HT_SUN_EDGE : HT_SUN_CORE);
      }

    const NC = HT_CLOUD.length - 1;
    for (const c of this.htClouds) {
      const cx = Math.round(((c.x + t * c.speed * 400) % (W + 300)) - 150);
      if (!(cx <= W + 4) || !(cx + c.len >= -4)) continue;
      for (let d = 0; d < c.len; d++) {
        const x = cx + d;
        if (x < 0 || x >= W) continue;
        const tp = c.top[d], bt = c.bot[d];
        if (tp < 0) continue;
        const span = Math.max(1, bt - tp);
        const near = Math.exp(-Math.pow((x - sunX) / 150, 2));
        const yOff = c.y + Math.round(c.tilt * d);
        for (let j = tp; j <= bt; j++) {
          const y = yOff + j;
          if (y < 0 || y >= HZ + 30) continue;
          const under = (j - tp) / span;
          const lip = j >= bt - 1 ? 1 : Math.pow(under, 1.7);
          const v = 0.06 + lip * 0.30 + near * (0.10 + lip * 0.62);
          const idx = htClamp(Math.round(v * NC + BAYER[(y & 3) * 4 + (x & 3)]), 0, NC);
          buf[y * W + x] = HT_CLOUD[idx];
        }
      }
    }

    for (const b of this.htFlock) {
      const p = (t * b.sp + b.o) % 1;
      const x = -20 + p * (W + 40);
      const y = b.y + Math.sin(p * 9 + b.ph) * 3;
      const up = Math.floor((t * LOOP / 1000) * 5 + b.ph * 3) % 2 === 0;
      const c = htMixc(this.SKY[htClamp(Math.round(this.baseV[htClamp(Math.round(y), 0, HZ + 45)] * (this.SKY.length - 1)), 0, this.SKY.length - 1)], HT_RIDGE_DARK, 0.55);
      px(x, y, c);
      if (up) { px(x - 1, y - 1, c); px(x + 1, y - 1, c); }
      else { px(x - 1, y + 1, c); px(x + 1, y + 1, c); }
    }

    for (let y = 0; y < H; y++) {
      const r = y * W;
      for (let x = 0; x < W; x++) { const c = land[r + x]; if (c) buf[r + x] = c; }
    }

    for (let rank = 0; rank < HT_RANKS.length; rank++) {
      const crest = this.crests[rank];
      const R = HT_RANKS[rank];
      const depth = 7 + rank * 3;
      const strength = (0.50 - rank * 0.075) * (this.opts.haze ?? 1);
      if (strength <= 0) continue;
      for (let x = 0; x < W; x++) {
        const drift = Math.sin(x * 0.021 + t * TAU * 0.5 + rank) * 0.5
          + Math.sin(x * 0.058 - t * TAU * 0.34) * 0.3;
        const near = 0.55 + 0.45 * Math.exp(-Math.pow((x - sunX) / 190, 2));
        for (let d = 0; d < depth; d++) {
          const y = crest[x] - d;
          if (y < 0 || y >= H) continue;
          const k = strength * Math.pow(1 - d / depth, 1.7) * near * (0.72 + drift * 0.4);
          if (BAYER[(y & 3) * 4 + (x & 3)] + 0.47 > k * 1.9) continue;
          blend(x, y, HT_MIST, k * 0.66);
        }
      }
    }

    if (this.opts.showHeron !== false) this.drawHilltopHeron(t, TAU, sunX, sunY);

    for (const s of this.stems) {
      const sway = Math.sin(t * TAU * 1.6 + s.ph) * 1.9
        + Math.sin(t * TAU * 3.7 + s.ph * 2) * 0.6;
      let lastX = s.x, lastY = s.base;
      for (let k = 0; k < s.h; k++) {
        const q = k / s.h;
        lastX = s.x + (s.lean + sway * 0.32) * q * q * s.h * 0.34;
        lastY = s.base - k;
        px(lastX, lastY, HT_GRASS[k > s.h - 3 ? 2 : k > s.h * 0.5 ? 1 : 0]);
      }
      if (s.seed) { px(lastX, lastY - 1, HT_SEED); px(lastX, lastY - 2, HT_SEED); }
    }

    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const ex = Math.max(0, 1 - Math.min(x, W - 1 - x) / 62);
        const ey = Math.max(0, 1 - Math.min(y, H - 1 - y) / 34);
        const k = Math.max(ex, ey) * 0.30;
        if (k < 0.02) continue;
        const i = y * W + x, c = buf[i];
        buf[i] = (255 << 24)
          | (Math.round(((c >> 16) & 255) * (1 - k)) << 16)
          | (Math.round(((c >> 8) & 255) * (1 - k)) << 8)
          | Math.round((c & 255) * (1 - k));
      }

    this.ctx.putImageData(this.img, 0, 0);
  }

  drawHilltopHeron(t, TAU, sunX, sunY) {
    const buf = this.buf;
    const ox = this.opts.heronAt === undefined
      ? HT_HERON_X : Math.round(W * htClamp(this.opts.heronAt, 0.08, 0.92));
    const base = this.hillTop[htClamp(ox, 0, W - 1)] + 2;
    const face = sunX > ox ? 1 : -1;
    const B = HT_HERON;

    let lean = 0, preen = 0, stretch = 0, tilt = 0, turn = 0, ruffle = 0;
    const cyc = (t * LOOP / 1000) % 40;
    const band = (a, b) => (cyc >= a && cyc < b) ? (cyc - a) / (b - a) : -1;
    let u;
    if ((u = band(5, 11)) >= 0) {
      turn = Math.sin(htSs(u) * Math.PI);
    } else if ((u = band(14, 19)) >= 0) {
      stretch = Math.sin(htSs(u) * Math.PI);
    } else if ((u = band(22, 26)) >= 0) {
      preen = Math.sin(htSs(u) * Math.PI) * (0.78 + 0.22 * Math.sin(u * TAU * 5));
    } else if ((u = band(29, 32)) >= 0) {
      tilt = Math.sin(htSs(u) * Math.PI);
    } else if ((u = band(35, 38)) >= 0) {
      ruffle = Math.sin(htSs(u) * Math.PI);
      lean = ruffle * 0.3;
    }

    const TARSUS = 15, THIGH = 8, NECK = 24;
    const breathe = Math.sin(t * TAU * 8) * 0.4;
    const bodyCX = ox + 11 * face + lean * 2 * face;
    const bodyCY = base - (TARSUS + THIGH + 6) + lean * 2 + breathe - stretch * 1.6;
    const hipY = bodyCY + 5;

    const pts = [];
    const put = (x, y, c) => { pts.push(Math.round(x), Math.round(y), c); };

    for (let n = 0; n < 2; n++) {
      const fx = ox + (n ? 13 : 9) * face;
      const lx = bodyCX - 3 * face + n * 6 * face;
      const ankleX = htLerp(lx, fx, 0.42) - 2.2 * face;
      const ankleY = hipY + THIGH;
      for (let k = 0; k <= THIGH; k++) {
        const q = k / THIGH;
        put(htLerp(lx, ankleX, q), htLerp(hipY, ankleY, q), B.body);
        if (k < 4) put(htLerp(lx, ankleX, q) + face, htLerp(hipY, ankleY, q), B.body);
      }
      for (let k = 0; k <= TARSUS; k++) {
        const q = k / TARSUS;
        put(htLerp(ankleX, fx, q), htLerp(ankleY, base, q), B.body);
      }
      for (let k = 0; k < 5; k++) put(fx + (k - 2) * face, base + 1, B.body);
      put(fx - 2 * face, base, B.body);
    }

    for (let my = 0; my < BODY_MASK.length; my++) {
      const row = BODY_MASK[my];
      for (let mx = 0; mx < row.length; mx++) {
        const ch = row[mx];
        if (ch === ".") continue;
        put(bodyCX + (mx - BODY_AX) * face, bodyCY + my - BODY_AY,
          ch === "W" ? B.wing : B.body);
      }
    }

    for (let k = 0; k < 5; k++) {
      const q = k / 4;
      const tx = bodyCX - (8 + k) * face;
      const ty = bodyCY + 2 - k * 0.34;
      const th = Math.max(2, Math.round(3.4 * (1 - q * 0.42)));
      for (let j = 0; j < th; j++) put(tx, ty + j, k > 2 ? B.body : B.wing);
    }

    if (stretch > 0.06) {
      const sp = stretch;
      for (let k = 0; k < 16; k++) {
        const q = k / 15;
        const wx = bodyCX - face * (2 + q * 15 * sp);
        const wy = bodyCY + 2 + Math.sin(q * Math.PI) * 5 * sp - q * 3 * sp;
        const th = Math.round(3 * (1 - q * 0.6));
        for (let j = 0; j < th; j++) put(wx, wy + j, B.wing);
        if (q > 0.55) put(wx - face, wy + th, B.body);
      }
    }

    if (ruffle > 0.3) {
      for (let mx = 0; mx < BODY_MASK[0].length; mx++) {
        let top = -1, bot = -1;
        for (let my = 0; my < BODY_MASK.length; my++)
          if (BODY_MASK[my][mx] !== ".") { if (top < 0) top = my; bot = my; }
        if (top < 0) continue;
        if ((mx + 1) % 3 === 0) continue;
        const bx = bodyCX + (mx - BODY_AX) * face;
        put(bx, bodyCY + bot - BODY_AY + 1, B.wing);
        if (mx < BODY_AX) put(bx, bodyCY + top - BODY_AY - 1, B.wing);
      }
    }

    const headTop = bodyCY - NECK;
    let hx = ox + (24 - turn * 9) * face;
    let hy = headTop - stretch * 2.6 + turn * 3;
    hx = htLerp(hx, bodyCX + 5 * face, preen); hy = htLerp(hy, bodyCY - 1, preen);
    let ang = htLerp(-0.10, -1.02, tilt);
    ang = htLerp(ang, 1.45, preen);
    ang += turn * 0.5;
    if (face < 0) ang = Math.PI - ang;

    const p0x = bodyCX + 4 * face, p0y = bodyCY - 5;
    const c1x = bodyCX - (2 + turn * 2) * face, c1y = bodyCY - NECK * 0.42;
    const c2x = ox + (20 - turn * 8) * face, c2y = headTop + NECK * 0.20 + turn * 2;
    for (let k = 0; k <= 46; k++) {
      const q = k / 46, m = 1 - q;
      const nx = m * m * m * p0x + 3 * m * m * q * c1x + 3 * m * q * q * c2x + q * q * q * hx;
      const ny = m * m * m * p0y + 3 * m * m * q * c1y + 3 * m * q * q * c2y + q * q * q * hy;
      const th = q < 0.26 ? 3 : q < 0.62 ? 2 : 1;
      for (let i = 0; i < th; i++) put(nx + (i - (th - 1) / 2) * face, ny, B.body);
      put(nx, ny + 1, B.body);
    }

    const ux = Math.cos(ang), uy = Math.sin(ang);
    const vx = -uy * face, vy = ux * face;
    for (let a = -4; a <= 2; a++)
      for (let b = -2; b <= 2; b++) {
        const aa = a / (a < 0 ? 3.8 : 2.4), bb = b / 1.9;
        if (aa * aa + bb * bb > 1) continue;
        put(hx + ux * a + vx * b, hy + uy * a + vy * b, B.body);
      }
    put(hx - ux * 0.8 - vx * 1.9, hy - uy * 0.8 - vy * 1.9, B.body);
    put(hx - ux * 2.1 - vx * 1.7, hy - uy * 2.1 - vy * 1.7, B.body);
    for (let k = 0; k < 4; k++)
      put(hx - ux * (2.4 + k * 1.05) - vx * (1.3 - k * 0.42),
          hy - uy * (2.4 + k * 1.05) - vy * (1.3 - k * 0.42), B.body);

    const bl = 10;
    for (let k = 0; k <= bl; k++) {
      const q = k / bl;
      put(hx + ux * (2.2 + k), hy + uy * (2.2 + k), B.body);
      if (q < 0.58) put(hx + ux * (2.2 + k) + vx, hy + uy * (2.2 + k) + vy, B.bill);
    }

    const solid = new Set();
    for (let i = 0; i < pts.length; i += 3) {
      const x = pts[i], y = pts[i + 1];
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      buf[y * W + x] = pts[i + 2];
      solid.add(y * W + x);
    }

    for (const i of solid) {
      const x = i % W, y = (i - x) / W;
      const nx = x + face, ny = y;
      if (nx < 0 || nx >= W) continue;
      const openSide = !solid.has(ny * W + nx);
      const openUp = y > 0 && !solid.has((y - 1) * W + x);
      if (!openSide && !openUp) continue;
      let nb = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++)
          if ((dx || dy) && solid.has((y + dy) * W + (x + dx))) nb++;
      if (nb < 4) continue;
      const dy = (y - sunY) / 60;
      const facingLight = Math.exp(-dy * dy * 0.5);
      const c = openSide && facingLight > 0.45 ? B.rim : B.rimLow;
      const k = openSide ? 0.92 : 0.34;
      if (!openSide && BAYER[(y & 3) * 4 + (x & 3)] + 0.47 > 0.4) continue;
      buf[i] = htMixc(buf[i], c, k);
    }

    const eh = Math.round(hy), ex2 = Math.round(hx + ux * 0.6 - vx * 1.2);
    if (eh < this.hillTop[htClamp(ex2, 0, W - 1)] - 3 && ((t * LOOP) % 5700) > 130)
      buf[htClamp(eh, 0, H - 1) * W + htClamp(ex2, 0, W - 1)] = B.eye;
  }


}
