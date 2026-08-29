/**
 * Mutation runner for the masthead guards. Scratch tooling, not part of the
 * build: it edits a tracked file, runs the suite, and restores from an
 * in-memory copy of the original bytes.
 *
 * Restoring from memory rather than `git checkout --` is deliberate. A checkout
 * also discards any uncommitted work in the same file, which is how two
 * in-progress assertions were lost earlier in this project.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const MUTATIONS = [
  {
    label: "token block not injected",
    file: "tools/sync-homepage-masthead.mjs",
    find: "${MARK}\\n${tokenBlock}\\n${mastheadCss}",
    replace: "${MARK}\\n${mastheadCss}",
  },
  {
    label: "sync-time token assertion removed",
    file: "tools/sync-homepage-masthead.mjs",
    find: "  assertTokensResolve(mastheadCss, tokenBlock);\n",
    replace: "",
  },
  {
    label: "post-write token assertion removed",
    file: "tools/sync-homepage-masthead.mjs",
    find: "  assertTokensResolve(injectedBlock, injectedBlock);",
    replace: "",
  },
  {
    label: "masthead.css reads an undefined token",
    file: "src/styles/masthead.css",
    append: "\n.mast { outline-color: var(--not-a-real-token); }\n",
  },
  {
    label: "click decides from .open again",
    file: "tools/sync-homepage-masthead.mjs",
    find: 'var wasLatched = parent.hasAttribute("data-latched");',
    replace: 'var wasLatched = parent && parent.classList.contains("open");',
  },
  {
    label: "mouseleave ignores the latch",
    file: "tools/sync-homepage-masthead.mjs",
    find: '          if (container.hasAttribute("data-latched")) return;\\n` +\n',
    replace: "",
  },
  {
    label: "dismissal filters on .open again",
    file: "tools/sync-homepage-masthead.mjs",
    find: '        m.querySelectorAll(".has-dropdown").forEach(shut);\\n` +\n',
    replace: '        m.querySelectorAll(".has-dropdown.open").forEach(shut);\\n` +\n',
  },
  {
    label: "shut() stops clearing the latch attribute",
    file: "tools/sync-homepage-masthead.mjs",
    find: '      el.removeAttribute("data-latched");\\n` +\n',
    replace: "",
  },
  {
    label: "mouseenter width guard removed",
    file: "tools/sync-homepage-masthead.mjs",
    find: "if (window.innerWidth > 860)",
    replace: "if (true)",
    once: true,
  },
];

function suite() {
  try {
    const out = execFileSync("node", ["--test", "tests/homepage-modal.test.mjs"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return parse(out);
  } catch (err) {
    return parse(String(err.stdout || "") + String(err.stderr || ""));
  }
}

function parse(out) {
  const grab = (key) => {
    const at = out.indexOf(" " + key + " ");
    if (at === -1) return "?";
    return out.slice(at + key.length + 2).split("\n")[0].trim();
  };
  return { pass: grab("pass"), fail: grab("fail") };
}

const originals = new Map();
const read = (f) => {
  if (!originals.has(f)) originals.set(f, readFileSync(f, "utf8"));
  return originals.get(f);
};
const restoreAll = () => { for (const [f, text] of originals) writeFileSync(f, text); };

const row = (label, r) => console.log(label.padEnd(40) + String(r.pass).padStart(4) + " pass" + String(r.fail).padStart(4) + " fail");

row("clean", suite());

for (const m of MUTATIONS) {
  const original = read(m.file);
  let mutated;
  if (m.append) {
    mutated = original + m.append;
  } else {
    // Every file in this repo is CRLF. A find string written with bare \n
    // matches nothing, which reads exactly like a mutation the guard caught.
    const crlf = original.includes("\r\n");
    if (crlf) {
      m.find = m.find.split("\r\n").join("\n").split("\n").join("\r\n");
      m.replace = m.replace.split("\r\n").join("\n").split("\n").join("\r\n");
    }
    const at = original.indexOf(m.find);
    if (at === -1) {
      console.log(`${m.label.padEnd(40)}  ANCHOR MISSED — mutation not applied, result below is meaningless`);
      continue;
    }
    mutated = m.once
      ? original.slice(0, at) + m.replace + original.slice(at + m.find.length)
      : original.split(m.find).join(m.replace);
    if (mutated === original) {
      console.log(`${m.label.padEnd(40)}  NO-OP — find and replace are identical`);
      continue;
    }
  }
  writeFileSync(m.file, mutated);
  row(m.label, suite());
  writeFileSync(m.file, original);
}

restoreAll();
row("restored", suite());
