/*
 * Horizontal overflow on an emulated phone, measured the way a phone actually
 * shows it.
 *
 * Three instruments were wrong before this one, and each was wrong silently:
 *
 *  1. documentElement.scrollWidth - innerWidth. Reports 0 with a 404px child
 *     injected on a 390px viewport. On a mobile viewport with
 *     width=device-width, overflowing content does not create a scroll delta:
 *     the LAYOUT VIEWPORT WIDENS. innerWidth went 390 -> 425 and the delta
 *     stayed 0. This is the instrument the earlier "zero overflow on 19 routes"
 *     claim was made with.
 *  2. max right edge of every element. Reports 6172px on the homepage, because
 *     a deliberate horizontal scroller's children legitimately sit off-screen.
 *  3. max right edge minus innerWidth, excluding scrollers. Scale-invariant,
 *     so it is blind to exactly the widening in (1): -1 with the canary in.
 *
 * So: measure innerWidth against the width we asked Chrome to emulate. If the
 * page forced the layout viewport wider than the device, something overflows.
 * Report the widest non-scroller element too, to name the culprit.
 */
// Not in npm run verify: it needs a Chrome on a debugging port and a preview
// server. Run it by hand before claiming a phone layout holds.
//
//   npm run build && npx astro preview --port 4321 &
//   chrome --headless=new --remote-debugging-port=9333 --user-data-dir=/tmp/p about:blank &
//   node tools/measure-mobile.mjs 9333 390 844
const port=process.argv[2], device=Number(process.argv[3]), height=Number(process.argv[4]);
const targets=await fetch(`http://127.0.0.1:${port}/json/list`).then(r=>r.json());
const page=targets.find(t=>t.type==="page");
const ws=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res,rej)=>{ws.addEventListener("open",res,{once:true});ws.addEventListener("error",rej,{once:true});});
let id=0;const pending=new Map();
ws.addEventListener("message",e=>{const m=JSON.parse(e.data);if(!m.id||!pending.has(m.id))return;const{res,rej,t}=pending.get(m.id);pending.delete(m.id);clearTimeout(t);m.error?rej(new Error(m.error.message)):res(m.result);});
function send(method,params={}){const i=++id;ws.send(JSON.stringify({id:i,method,params}));return new Promise((res,rej)=>{const t=setTimeout(()=>{pending.delete(i);rej(new Error("timeout "+method));},20000);pending.set(i,{res,rej,t});});}
const ev=async(e)=>{const r=await send("Runtime.evaluate",{expression:e,returnByValue:true});if(r.exceptionDetails)throw new Error(String(r.exceptionDetails.exception&&r.exceptionDetails.exception.description));return r.result.value;};
await send("Emulation.setDeviceMetricsOverride",{width:device,height,deviceScaleFactor:1,mobile:device<900});
const ROUTES=["/","/about","/pricing","/security","/contact","/privacy","/terms","/why-common-parcel","/product","/blog",
"/product/dues-and-payments","/product/collections","/product/accounting-and-budgets","/product/rules-and-enforcement",
"/product/meetings-and-voting","/product/documents-and-answers","/product/vendors-and-insurance","/product/resident-portal","/product/records-and-audit"];
const MEASURE=(dev)=>`(()=>{
  const CLIPPED=new Set(["auto","scroll","hidden","clip"]);
  const inScroller=(el)=>{for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){if(CLIPPED.has(getComputedStyle(p).overflowX))return true;}return false;};
  let worst=null,worstRight=0;
  for(const el of document.querySelectorAll("body *")){
    const cs=getComputedStyle(el);
    if(cs.display==="none"||cs.visibility==="hidden")continue;
    const b=el.getBoundingClientRect();
    if(b.width===0&&b.height===0)continue;
    if(inScroller(el))continue;
    if(b.right>worstRight){worstRight=b.right;worst=el;}
  }
  const label=worst?worst.tagName.toLowerCase()+(worst.className?"."+String(worst.className).trim().split(/\s+/)[0]:""):"none";
  return JSON.stringify({vw:innerWidth,widened:Math.round(innerWidth-${dev}),pastDevice:Math.round(worstRight-${dev}),who:label});
})()`;
let bad=0;
for(const r of ROUTES){
  await send("Page.navigate",{url:"http://localhost:4321"+r});
  await new Promise(x=>setTimeout(x,900));
  const v=JSON.parse(await ev(MEASURE(device)));
  const over = Math.max(v.widened, v.pastDevice);
  if(over>0.5)bad++;
  console.log(String(v.widened).padStart(6), String(v.pastDevice).padStart(6), r.padEnd(38), v.who);
}
console.log(`\n${ROUTES.length} routes emulated at ${device}px: ${bad} force the layout viewport wider or push content past the device edge`);
console.log("columns: viewport widened beyond the device | widest non-scroller element past the device edge");

// Control. The probe has to see one when there is one.
await send("Page.navigate",{url:"http://localhost:4321/product/records-and-audit"});
await new Promise(x=>setTimeout(x,900));
const clean=JSON.parse(await ev(MEASURE(device)));
await ev(`(()=>{const p=document.querySelector(".band .page");const d=document.createElement("div");d.style.cssText="width:${device+14}px;height:4px";d.id="canary";p.appendChild(d);return 1;})()`);
await new Promise(x=>setTimeout(x,300));
const dirty=JSON.parse(await ev(MEASURE(device)));
await ev(`document.getElementById("canary").remove(),1`);
await new Promise(x=>setTimeout(x,300));
const back=JSON.parse(await ev(MEASURE(device)));
console.log(`\ncontrol on /product/records-and-audit, injecting one ${device+14}px child:`);
console.log(`  clean   widened=${clean.widened} pastDevice=${clean.pastDevice}`);
console.log(`  canary  widened=${dirty.widened} pastDevice=${dirty.pastDevice}`);
console.log(`  removed widened=${back.widened} pastDevice=${back.pastDevice}`);
ws.close();
