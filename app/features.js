(function(root, factory) {
  if (typeof module !== "undefined") module.exports = factory;
  else factory(root.Paper);
})(globalThis, function(P) {
  "use strict";
  const cp = P.clone, esc = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]), LIMIT = 40 * 1024 * 1024;
  const blocks = ["about", "facts", "details", "connections", "appearances", "gallery", "versions"];
  function normalize(c) {
    c.libraryTags = Array.isArray(c.libraryTags) ? c.libraryTags : [];
    c.favorite = !!c.favorite;
    c.presentation ??= {};
    c.epithet ??= "";
    c.hook ??= "";
    return c;
  }
  function normalizeWorkspace(w) {
    P.assertWorkspaceVersion(w);
    w.featureVersion = 1;
    w.characters.forEach(normalize);
    return w;
  }
  function fields(c, ctx = "all") {
    return c.sections.filter((s) => ctx === "all" || P.applicable(s.scope, [ctx])).flatMap((s) => s.fields.map((f) => ({ id: f.id, sectionId: s.id, section: s.name, label: f.label, value: f.value, hidden: f.hidden })).concat([{ id: s.id + ":free", sectionId: s.id, section: s.name, label: "Freeform", value: s.free, hidden: false }]));
  }
  function defaults(c, ctx = "all") {
    const f = fields(c, ctx);
    const safe = f.filter((x) => !x.hidden && !/secret|private|author instructions|relationship with|user \/ persona|partner character/i.test(x.section + " " + x.label));
    return { theme: "paper", blocks: blocks.slice(), fields: safe.map((x) => x.id), quickFacts: safe.filter((x) => /^(Age|Pronouns|Occupation|Location|Gender|Species \/ Races)$/.test(x.label)).map((x) => x.id), gallery: true, relationships: true, history: false, hiddenConnections: [], hiddenImages: [] };
  }
  function settings(c, ctx = "all") {
    return { ...defaults(c, ctx), ...c.presentation?.[ctx] || {} };
  }
  function appearances(c, w) {
    const stories = w.stories.filter((s) => s.cast.some((x) => x.characterId === c.id));
    const ids = new Set(stories.map((s) => s.id));
    return { stories, projects: w.projects.filter((p) => p.members.includes(c.id) || p.stories.some((id) => ids.has(id))) };
  }
  function cast(p, w) {
    const ids = new Set(p.members);
    for (const s of w.stories.filter((s2) => p.stories.includes(s2.id))) for (const x of s.cast) ids.add(x.characterId);
    return w.characters.filter((c) => ids.has(c.id));
  }
  function portrait(c) {
    return c.gallery.find((a) => a.id === (c.portraitId || c.cover?.id) && a.type === "image") || null;
  }
  function page(c, w, ctx = "all") {
    normalize(c);
    const s = settings(c, ctx), all = fields(c, ctx), visible = all.filter((f) => s.fields.includes(f.id) && !f.hidden && f.value.trim()), about = visible.find((f) => f.label === "Bio"), app = appearances(c, w);
    return { name: c.name, epithet: c.epithet, hook: c.hook, contexts: c.uses.slice(), theme: ["paper", "codex", "profile"].includes(s.theme) ? s.theme : "paper", portrait: s.hiddenImages.includes(portrait(c)?.id) ? null : portrait(c), blocks: s.blocks.filter((b) => blocks.includes(b)), about: about?.value || "", facts: s.quickFacts.map((id) => visible.find((f) => f.id === id)).filter(Boolean).map((f) => ({ label: f.label, value: f.value })), details: visible.filter((f) => f !== about && !s.quickFacts.includes(f.id)), connections: s.relationships ? c.connections.filter((x) => !s.hiddenConnections.includes(x.id) && (ctx === "all" || P.applicable(x.scope, [ctx]))).map((x) => {
      const other = w.characters.find((o) => o.id === x.linkedId), r = w.relationships.find((r2) => r2.id === x.relationshipId);
      const image = other ? portrait(other) : null;
      const imageHidden = other && settings(other, ctx).hiddenImages.includes(image?.id);
      return { id: x.id, linkedId: other?.id || "", name: other?.name || x.name, relationship: x.relationship, description: x.description, history: s.history ? r?.history || "" : "", portrait: imageHidden ? "" : image?.data || "" };
    }) : [], gallery: s.gallery ? c.gallery.filter((x) => x.type === "image" && !s.hiddenImages.includes(x.id)).slice(0, 8).map((a) => ({ data: a.data, title: a.title, description: a.description })) : [], appearances: { stories: app.stories.map((s2) => ({ id: s2.id, name: s2.name })), projects: app.projects.map((s2) => ({ id: s2.id, name: s2.name })) }, versions: w.characters.filter((x) => x.id === c.forkOf || x.forkOf === c.id).map((x) => ({ id: x.id, name: x.name, label: x.forkLabel || "" })) };
  }
  function sheet(c, w, ctx = "all") {
    const v = page(c, w, ctx), para = (t) => "<p>" + esc(t).replace(/\n/g, "<br>") + "</p>", sections = { about: v.about ? "<section><h2>About</h2>" + para(v.about) + "</section>" : "", facts: v.facts.length ? "<section><h2>Quick facts</h2><dl>" + v.facts.map((f) => "<dt>" + esc(f.label) + "</dt><dd>" + esc(f.value) + "</dd>").join("") + "</dl></section>" : "", details: v.details.map((f) => "<section><h2>" + esc(f.section + " \xB7 " + f.label) + "</h2>" + para(f.value) + "</section>").join(""), connections: v.connections.length ? "<section><h2>Connections</h2>" + v.connections.map((x) => "<article><h3>" + esc(x.name) + "</h3><strong>" + esc(x.relationship) + "</strong>" + para(x.description) + para(x.history) + "</article>").join("") + "</section>" : "", appearances: [...v.appearances.stories, ...v.appearances.projects].length ? "<section><h2>Appears in</h2>" + para([...v.appearances.stories, ...v.appearances.projects].map((x) => x.name).join(" \xB7 ")) + "</section>" : "", gallery: v.gallery.length ? '<section><h2>Gallery</h2><div class="gallery">' + v.gallery.map((a) => '<figure><img loading="lazy" src="' + a.data + '" alt="' + esc(a.title) + '"><figcaption>' + esc(a.title) + para(a.description) + "</figcaption></figure>").join("") + "</div></section>" : "", versions: v.versions.length ? "<section><h2>Versions</h2>" + para(v.versions.map((x) => x.name).join(" \xB7 ")) + "</section>" : "" };
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>` + esc(v.name) + ' \u2014 Character Paper</title><style>body{font:17px/1.7 system-ui,sans-serif;background:#f7f3eb;color:#233436;margin:0}main{max-width:960px;margin:auto;padding:40px 24px}.identity{display:flex;align-items:center;gap:36px}.identity img{width:240px;max-height:380px;object-fit:cover;border-radius:18px}h1{font:52px/1.1 Georgia,serif}h2{font:28px Georgia,serif}section{margin:32px 0;border-top:1px solid #83918a;padding-top:18px}p{white-space:normal;overflow-wrap:anywhere}dl{display:grid;grid-template-columns:1fr 2fr;gap:12px}dd{margin:0}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:20px}figure{margin:0}img{max-width:100%}.codex h1,.codex h2{font-family:system-ui}.profile .identity{flex-direction:column;text-align:center}@media(prefers-color-scheme:dark){body{background:#202627;color:#eee9da}}@media(max-width:600px){.identity{flex-direction:column;align-items:start}h1{font-size:38px}}@media print{body{background:white;color:black}section,figure{break-inside:avoid}main{padding:0}.identity img{max-height:240px}a{color:inherit}}</style></head><body class="' + v.theme + '"><main><header class="identity">' + (v.portrait ? '<img src="' + v.portrait.data + '" alt="' + esc(v.name) + '">' : "") + "<div><p>CHARACTER PAPER</p><h1>" + esc(v.name) + "</h1>" + para(v.epithet) + para(v.hook) + para(v.contexts.join(" \xB7 ")) + "</div></header>" + v.blocks.map((b) => sections[b] || "").join("") + "<footer>Character Paper \xB7 A place for every character.</footer></main></body></html>";
  }
  function cloneCharacter(c, w, opts = {}) {
    const n = cp(c), map = /* @__PURE__ */ new Map(), remap = (id) => {
      if (!map.has(id)) map.set(id, P.uid());
      return map.get(id);
    };
    n.id = P.uid();
    n.name = String(opts.name || c.name + " \u2014 Copy").trim();
    if (!n.name) throw Error("Give this version a name.");
    n.snapshot = null;
    n.updated = Date.now();
    n.openedAt = 0;
    n.favorite = false;
    n.archived = false;
    delete n.forkOf;
    delete n.forkLabel;
    if (opts.fork) {
      n.forkOf = opts.linkOriginal === false ? "" : c.id;
      n.forkLabel = String(opts.label || "Alternate version");
    }
    for (const s of n.sections) {
      const originalSectionId = s.id;
      s.id = remap(s.id);
      s.fields.forEach((f) => f.id = remap(f.id));
      s.notes = opts.notes ? s.notes : "";
      s.linkedId = "";
      if (opts.writing === false || Array.isArray(opts.sectionIds) && !opts.sectionIds.includes(originalSectionId)) {
        s.free = "";
        s.fields.forEach((f) => f.value = "");
      }
    }
    for (const k of ["gallery", "references", "greetings", "dialogues"]) {
      if (opts[k] === false) n[k] = [];
      n[k].forEach((a) => a.id = remap(a.id));
    }
    n.notes = opts.notes ? n.notes : "";
    n.connections = opts.connections ? c.connections.map((x) => {
      const a = cp(x);
      a.id = P.uid();
      map.set(x.id, a.id);
      a.notes = opts.notes ? a.notes : "";
      delete a.relationshipId;
      const r = w.relationships.find((r2) => r2.id === x.relationshipId);
      if (r?.history) a.custom.push({ id: P.uid(), label: "Copied shared history", value: r.history });
      a.custom.forEach((f) => {
        if (f.id) f.id = P.uid();
      });
      return a;
    }) : [];
    n.cover = n.cover && n.gallery.some((a) => a.id === map.get(n.cover.id)) ? { ...n.cover, id: map.get(n.cover.id) } : null;
    n.portraitId = n.gallery.some((a) => a.id === map.get(n.portraitId)) ? map.get(n.portraitId) : "";
    n.presentation = cp(c.presentation || {});
    for (const s of Object.values(n.presentation)) {
      for (const key of ["fields", "quickFacts"]) if (Array.isArray(s[key])) s[key] = s[key].map((id) => id.endsWith(":free") ? (map.get(id.slice(0, -5)) || id.slice(0, -5)) + ":free" : map.get(id) || id);
      s.hiddenConnections = (s.hiddenConnections || []).map((id) => map.get(id)).filter(Boolean);
      s.hiddenImages = (s.hiddenImages || []).map((id) => map.get(id) || id);
    }
    return normalize(n);
  }
  function portable(c, w) {
    const n = cp(c);
    n.notes = "";
    n.snapshot = null;
    delete n.openedAt;
    for (const s of n.sections) s.notes = "";
    for (const x of n.connections) {
      x.notes = "";
      delete x.relationshipId;
    }
    return { format: "character-paper-character", version: 1, createdWith: "1.1.1", manifest: { name: c.name, sourceId: c.id, media: "embedded-data-uris", privacy: "Private notes and snapshots excluded" }, character: n, links: c.connections.filter((x) => x.linkedId).map((x) => ({ id: x.linkedId, name: w.characters.find((c2) => c2.id === x.linkedId)?.name || x.name })), warnings: ["Story and project memberships are not transferred. Relationships import as independent links; reciprocal relationships are not created."] };
  }
  function mediaInfo(data) {
    try {
      const match = /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/=]+)$/.exec(data || "");
      if (!match) return null;
      const raw = atob(match[2].slice(0, 88)), bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0)), view = new DataView(bytes.buffer);
      let width = 0, height = 0;
      if (match[1] === "png") {
        if (bytes.length < 24 || raw.slice(1, 4) !== "PNG" || raw.slice(12, 16) !== "IHDR") return null;
        width = view.getUint32(16);
        height = view.getUint32(20);
      } else if (match[1] === "gif") {
        if (!/^GIF8[79]a/.test(raw)) return null;
        width = view.getUint16(6, true);
        height = view.getUint16(8, true);
      } else if (match[1] === "jpeg") {
        if (bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255) return null;
      } else if (raw.slice(0, 4) !== "RIFF" || raw.slice(8, 12) !== "WEBP") return null;
      return { type: match[1], bytes: Math.floor(match[2].length * 0.75), width, height };
    } catch {
      return null;
    }
  }
  function parsePackage(text) {
    if (typeof text !== "string" || text.length > LIMIT) throw Error("Character package must be under 40 MB.");
    let obj;
    try {
      obj = JSON.parse(text);
    } catch {
      throw Error("This is not a readable JSON character file.");
    }
    const inspect = (v, depth = 0) => {
      if (depth > 32) throw Error("The file is nested too deeply.");
      if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) {
        if (["__proto__", "prototype", "constructor"].includes(k)) throw Error("Unsafe property in import.");
        inspect(x, depth + 1);
      }
    };
    inspect(obj);
    if (obj.format !== "character-paper-character" || obj.version !== 1) throw Error("Unsupported Character Paper package version.");
    const w = P.empty();
    w.characters = [obj.character];
    P.validate(w);
    if (obj.character.snapshot) throw Error("Packages must not contain protected snapshots.");
    for (const a of [...obj.character.gallery, ...obj.character.references]) if (a.type === "image" && !mediaInfo(a.data)) throw Error("An embedded image is malformed or unsupported.");
    const ids = /* @__PURE__ */ new Set(), walk = (v) => {
      if (!v || typeof v !== "object") return;
      if (Array.isArray(v)) {
        v.forEach(walk);
        return;
      }
      for (const [k, x] of Object.entries(v)) {
        if (["cover", "snapshot", "presentation"].includes(k)) continue;
        if (k === "id") {
          if (ids.has(x)) throw Error("Duplicate identifiers in character package.");
          ids.add(x);
        } else if (typeof x === "object") walk(x);
      }
    };
    walk(obj.character);
    return obj;
  }
  function importPackage(pkg, w, { reconcile = false, name } = {}) {
    // Incoming identifiers must never select history from the destination workspace.
    const c = cloneCharacter(pkg.character, { ...w, relationships: [] }, { name: name || pkg.character.name, connections: true, notes: false });
    c.importSourceId = pkg.manifest?.sourceId || pkg.character.id;
    for (const x of c.connections) {
      const source = (pkg.links || []).find((l) => l.id === x.linkedId);
      const match = reconcile && source && typeof source.name === "string" && w.characters.find((o) => o.id === x.linkedId && o.name === source.name);
      if (!match) {
        x.unresolvedName = source?.name || x.name;
        x.name = x.unresolvedName;
        x.linkedId = "";
      }
    }
    for (const s of c.sections) s.linkedId = "";
    if (c.forkOf && !w.characters.some((x) => x.id === c.forkOf)) c.forkOf = "";
    return c;
  }
  function externalCard(obj) {
    const v = obj?.spec === "chara_card_v2" ? obj.data : null;
    if (!v || typeof v.name !== "string" || !v.name.trim()) throw Error("Choose a Character Card V2 JSON file.");
    const text = (k) => {
      if (v[k] === void 0) return "";
      if (typeof v[k] !== "string") throw Error("Invalid card field: " + k);
      return v[k];
    };
    const c = P.character(v.name.slice(0, 150));
    const put = (section, label, value) => {
      const s = c.sections.find((s2) => s2.name === section), f = s.fields.find((f2) => f2.label === label);
      f.value = value;
    };
    put("Information", "Bio", text("description"));
    put("Personality", "Core personality", text("personality"));
    put("Scenario", "Scenario", text("scenario"));
    const greetings = [text("first_mes"), ...Array.isArray(v.alternate_greetings) ? v.alternate_greetings : []];
    if (greetings.some((x) => typeof x !== "string")) throw Error("Invalid alternate greetings.");
    c.greetings = greetings.filter(Boolean).map((text2, i) => ({ id: P.uid(), label: i ? "Alternate " + i : "Primary", text: text2, primary: i === 0 }));
    if (text("mes_example")) c.dialogues = [{ id: P.uid(), label: "Imported examples", text: text("mes_example") }];
    c.setup.publicIntro = text("creator_notes");
    c.setup.system = text("system_prompt");
    c.setup.post = text("post_history_instructions");
    c.setup.tags = Array.isArray(v.tags) ? v.tags.filter((x) => typeof x === "string").join(", ") : "";
    const ext = v.extensions?.character_paper;
    if (ext && typeof ext.tagline === "string") c.setup.tagline = ext.tagline;
    if (ext && typeof ext.chat_name === "string") c.setup.chatName = ext.chat_name;
    return { character: normalize(c), warnings: ["Creator notes mapped to public chatbot introduction. Lorebooks and unrecognized extensions are not imported. Imported text is never executed."] };
  }
  function search(w, query, opts = {}) {
    const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const out = [];
    const add = (o, path, text, tab, fieldId) => {
      const lower = String(text || "").toLocaleLowerCase();
      if (words.every((q) => lower.includes(q))) {
        const at = lower.indexOf(words[0]), start = Math.max(0, at - 45);
        out.push({ id: o.id, kind: o.kind, name: o.name, path, text: String(text).slice(start, start + 180), tab, fieldId });
      }
    };
    for (const c of w.characters) {
      if (!!c.archived !== !!opts.archive || opts.tag && !c.libraryTags?.includes(opts.tag) || opts.favorite && !c.favorite || opts.context && opts.context !== "all" && !c.uses.includes(opts.context)) continue;
      add(c, "Name / tags", [c.name, ...c.libraryTags || [], c.epithet, c.hook].join(" "), "Character Page");
      for (const s of c.sections) {
        add(c, s.name + " \u2192 Freeform", s.free, s.id);
        add(c, s.name + " \u2192 Private notes", s.notes, s.id);
        for (const f of s.fields) add(c, s.name + " \u2192 " + f.label, f.value, s.id, f.id);
      }
      add(c, "Private working notes", c.notes, "Loose pages");
      for (const [k, label] of [["title", "Listing title"], ["chatName", "Chat name"], ["tagline", "Tagline"], ["publicIntro", "Public introduction"], ["system", "System prompt"], ["post", "Post-history instructions"]]) add(c, "Chatbot Setup \u2192 " + label, c.setup[k], "Setup");
      for (const a of c.references) add(c, "References \u2192 " + (a.title || "Untitled"), [a.title, a.description, a.text || "", a.source || ""].join(" "), "References");
      for (const x of c.connections) add(c, "Connections", [x.name, x.relationship, x.description, x.notes].join(" "), "Connections");
      for (const [key, tab] of [["greetings", "Greetings"], ["dialogues", "Dialogue"]]) for (const x of c[key]) add(c, tab, x.text, tab);
    }
    for (const s of w.stories.filter((x) => !!x.archived === !!opts.archive)) {
      add(s, "Story", s.name, "Writing");
      for (const ch of s.chapters) add(s, "Writing \u2192 " + (ch.title || "Untitled part"), ch.text, "Writing", ch.id);
      add(s, "Private notes", s.notes, "Notes");
    }
    for (const p of w.projects.filter((x) => !!x.archived === !!opts.archive)) add(p, "Project", [p.name, p.description, p.notes].join(" "), "Contents");
    return out.slice(0, 500);
  }
  function health(w, onlyId) {
    const issues = [], all = [...w.characters, ...w.stories, ...w.projects], has = (id) => all.some((o) => o.id === id), seen = /* @__PURE__ */ new Set(), add = (o, message, code = "warning", target = "") => issues.push({ id: o.id, name: o.name, message, code, target });
    for (const o of all) {
      if (seen.has(o.id)) add(o, "Duplicate book identifier", "error");
      seen.add(o.id);
      if (onlyId && o.id !== onlyId) continue;
      const local = /* @__PURE__ */ new Set();
      const scan = (v) => {
        if (!v || typeof v !== "object") return;
        if (Array.isArray(v)) {
          v.forEach(scan);
          return;
        }
        for (const [k, x] of Object.entries(v)) {
          if (["snapshot", "cover", "presentation"].includes(k)) continue;
          if (k === "id") {
            if (local.has(x)) add(o, "Duplicate internal identifier", "error");
            local.add(x);
          } else if (typeof x === "object") scan(x);
        }
      };
      scan(o);
      const media = [...o.gallery, ...o.references];
      for (const a of media) {
        if (a.type === "image" && !mediaInfo(a.data)) add(o, "Unreadable image: " + a.title, "error");
      }
      if (o.cover && !o.gallery.some((a) => a.id === o.cover.id)) add(o, "Selected cover image is missing", "warning", "cover");
      if (o.portraitId && !o.gallery.some((a) => a.id === o.portraitId)) add(o, "Selected portrait is missing", "warning", "portrait");
      if (o.kind === "character") {
        for (const x of o.connections) {
          if (x.linkedId && !w.characters.some((c) => c.id === x.linkedId)) add(o, "Missing connected character: " + (x.name || x.linkedId), "warning");
          if (x.relationshipId && !w.relationships.some((r) => r.id === x.relationshipId)) add(o, "Missing shared relationship record", "warning");
        }
        if (o.forkOf && !w.characters.some((c) => c.id === o.forkOf)) add(o, "Original version no longer exists", "warning", "fork");
        for (const s of o.sections) if (s.linkedId && !w.characters.some((c) => c.id === s.linkedId)) add(o, "Missing linked persona: " + s.name);
        const ids = new Set(fields(o).map((f) => f.id));
        for (const s of Object.values(o.presentation || {})) if ([...s.fields || [], ...s.quickFacts || []].some((id) => !ids.has(id))) add(o, "Character Page selects fields that no longer exist", "warning", "presentation");
      }
      if (o.kind === "story") {
        for (const c of o.cast) if (!w.characters.some((x) => x.id === c.characterId)) add(o, "Story cast contains a missing character");
      }
      if (o.kind === "project") {
        for (const id of [...o.members, ...o.stories]) if (!has(id)) add(o, "Project contains a missing book");
      }
    }
    for (const r of w.relationships) {
      const owner = w.characters.find((c) => c.id === r.a) || w.characters[0];
      if (!owner || onlyId && ![r.a, r.b].includes(onlyId)) continue;
      if (!w.characters.some((c) => c.id === r.a) || !w.characters.some((c) => c.id === r.b)) add(owner, "Shared relationship refers to a missing character");
      else for (const id of [r.a, r.b]) if (!w.characters.find((c) => c.id === id).connections.some((x) => x.relationshipId === r.id)) add(owner, "Shared relationship is missing one perspective");
    }
    return issues;
  }
  function graph(w, ids) {
    const nodes = w.characters.filter((c) => !c.archived && (!ids || ids.includes(c.id))).map((c) => ({ id: c.id, name: c.name, portrait: portrait(c)?.data || "" })), set = new Set(nodes.map((n) => n.id)), edges = [], seen = /* @__PURE__ */ new Set();
    for (const c of w.characters.filter((c2) => set.has(c2.id))) for (const x of c.connections) {
      const key = x.relationshipId || [c.id, x.linkedId].sort().join("|");
      if (set.has(x.linkedId) && !seen.has(key)) {
        seen.add(key);
        edges.push({ a: c.id, b: x.linkedId, label: x.relationship });
      }
    }
    return { nodes, edges };
  }
  const previousMigrate = P.migrate, previousCharacter = P.character, previousEmpty = P.empty, previousValidate = P.validate;
  P.empty = () => ({ ...previousEmpty(), featureVersion: 1 });
  P.validate = (w) => {
    previousValidate(w);
    for (const c of w.characters) {
      if (c.libraryTags !== void 0 && (!Array.isArray(c.libraryTags) || c.libraryTags.length > 80 || c.libraryTags.some((t) => typeof t !== "string" || t.length > 200))) throw Error("Invalid library tags.");
      for (const k of ["epithet", "hook", "forkOf", "forkLabel", "importSourceId"]) if (c[k] !== void 0 && typeof c[k] !== "string") throw Error("Invalid character metadata.");
      if (c.presentation !== void 0) {
        if (!c.presentation || typeof c.presentation !== "object" || Array.isArray(c.presentation)) throw Error("Invalid presentation settings.");
        for (const [ctx, s] of Object.entries(c.presentation)) {
          if (!["all", ...P.contexts].includes(ctx) || !s || typeof s !== "object") throw Error("Invalid presentation context.");
          for (const k of ["fields", "quickFacts", "blocks", "hiddenImages", "hiddenConnections"]) if (!Array.isArray(s[k]) || s[k].length > 1e4 || s[k].some((x) => typeof x !== "string")) throw Error("Invalid presentation selection.");
          if (s.blocks.some((x) => !blocks.includes(x)) || new Set(s.blocks).size !== s.blocks.length) throw Error("Invalid page blocks.");
        }
      }
    }
    for (const o of [...w.characters, ...w.stories, ...w.projects]) for (const a of [...o.gallery, ...o.references]) if (a.thumbnail && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(a.thumbnail)) throw Error("Invalid image thumbnail.");
    return true;
  };
  P.migrate = (x) => {
    P.assertWorkspaceVersion(x);
    const w = normalizeWorkspace(previousMigrate(x));
    P.validate(w);
    return w;
  };
  P.character = (name) => normalize(previousCharacter(name));
  Object.assign(P, { mediaInfo, normalizeCharacter: normalize, normalizeWorkspace, presentationFields: fields, pageSettings: settings, pageDefaults: defaults, characterPage: page, shareableHtml: sheet, cloneCharacter, portableCharacter: portable, parseCharacterPackage: parsePackage, importCharacterPackage: importPackage, importExternalCard: externalCard, advancedSearch: search, characterHealth: health, relationshipGraph: graph, characterAppearances: appearances, projectCast: cast, characterPortrait: portrait, packageLimit: LIMIT });
  return P;
});
