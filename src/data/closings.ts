import type { SceneKey } from "../components/PixelSky.astro";
type Closing = { headline: string; scene: SceneKey; seed: number };
const pages: Record<string, [string, SceneKey]> = {
  "/": ["More time for your neighborhood.", "dawn"],
  "/product": ["Your next board meeting starts here.", "street"],
  "/pricing": ["A good fit for your association.", "autumn"],
  "/about": ["For the place you call home.", "dusk"],
  "/why-common-parcel": ["Make time for your neighborhood.", "hilltop"],
  "/security": ["Your association’s work, together.", "winter"],
  "/contact": ["Let’s get your HOA organized.", "street"],
  "/blog": ["Put your next board plan into action.", "dawn"],
  "/product/dues-and-payments": ["Make collecting dues easier.", "dusk"],
  "/product/collections": ["Know where every account stands.", "dawn"],
  "/product/accounting-and-budgets": ["Make sense of the numbers.", "autumn"],
  "/product/rules-and-enforcement": ["Give every request your full attention.", "winter"],
  "/product/meetings-and-voting": ["Be ready for your next meeting.", "street"],
  "/product/documents-and-answers": ["Your HOA documents, ready to answer.", "storm"],
  "/product/vendors-and-insurance": ["Be ready before the renewal.", "street"],
  "/product/resident-portal": ["A better connection with your residents.", "autumn"],
  "/product/records-and-audit": ["Give the next board a head start.", "dawn"],
};
export function closingFor(path: string): Closing {
  const seed = [...path].reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 197);
  const scenes: SceneKey[] = ["dawn", "street", "autumn", "dusk", "winter", "hilltop"];
  const [headline, scene] = pages[path] ?? ["More time for your neighborhood.", scenes[seed % scenes.length]];
  return { headline, scene, seed };
}
