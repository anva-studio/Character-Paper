"use strict";
const featureBase = { shell, navItems, library, home: home09, bind, action, options: bookOptions, about: aboutPage09, media, render, export: exportDialog };
let featureRenderKey = "", featurePageScroll = {}, featureWorkspaceScroll = {};
let featureHistory = [], featureForward = [], featureOwner = "", featureSearchResults = [], featureTag = "", featureFavorites = false, featureSort = "updated", featureMapFilter = "", featurePageDraft = null;
const featureContext = (c) => c.view.length === 1 ? c.view[0] : "all";
const featureAvatar = (c) => {
  const a = P.characterPortrait(c);
  return a ? `<img loading="lazy" decoding="async" src="${a.data}" alt="${esc(c.name)}">` : `<span class="person-initial" style="background:${c.color}">${esc(c.name[0])}</span>`;
};
const featureCheck = (id, label, yes) => `<label class="check"><input type="checkbox" id="${id}" ${yes ? "checked" : ""}>${esc(label)}</label>`;
function featureToolbar() {
  return `<div class="feature-toolbar">${btn("Search everything", "search-all")}${btn("Relationship map", "relationship-map")}${btn("Import character", "import-character")}${btn("Library health", "library-health")}</div>`;
}
function featureLocation() {
  return { ui: P.clone(ui), screen: screen09, scroll: window.scrollY };
}
function featureRemember() {
  const current = featureLocation();
  if (featureHistory[featureHistory.length - 1]?.ui.id !== current.ui.id || featureHistory[featureHistory.length - 1]?.ui.tab !== current.ui.tab) featureHistory.push(current);
  if (featureHistory.length > 60) featureHistory.shift();
}
async function featureBack() {
  if (!featureHistory.length) return action("back-library101");
  const loc = featureHistory[featureHistory.length - 1];
  return navigate(() => {
    featureHistory.pop();
    featureForward.push(featureLocation());
    Object.assign(ui, loc.ui);
    if (ui.id && !object()) ui.id = null;
    screen09 = loc.screen;
    requestAnimationFrame(() => window.scrollTo(0, loc.scroll));
  });
}
openItem = function(id) {
  const target = [...w.characters, ...w.stories, ...w.projects].find((x) => x.id === id);
  if (!target) return notice("That book is no longer in this library.");
  return navigate(() => {
    featureRemember();
    ui.id = id;
    ui.tab = target.kind === "character" ? "Character Page" : target.kind === "story" ? "Writing" : "Contents";
    ui.chapter = null;
    ui.focus = false;
    screen09 = "app";
    target.openedAt = Date.now();
  });
};
navItems = function(o) {
  const entries = featureBase.navItems(o);
  return o.kind === "character" ? [["Character Page", "Character Page"], ...entries] : o.kind === "project" ? [...entries, ["Cast", "Cast View"]] : entries;
};
function featurePage(c) {
  const ctx = featureContext(c), v = P.characterPage(c, w, ctx), grouped = /* @__PURE__ */ new Map();
  for (const f of v.details) {
    if (!grouped.has(f.section)) grouped.set(f.section, []);
    grouped.get(f.section).push(f);
  }
  const empty = '<p class="quiet">There is more to discover. Add details in the Workspace whenever you are ready.</p>';
  const content2 = { about: v.about ? `<section><h2>About</h2><div class="reading">${markdown(v.about)}</div></section>` : "", facts: v.facts.length ? `<section><h2>Quick facts</h2><dl class="quick-facts">${v.facts.map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("")}</dl></section>` : "", details: [...grouped].map(([name, items]) => `<section><h2>${esc(name)}</h2>${items.map((f) => `<div class="present-field">${f.label !== "Freeform" ? `<h3>${esc(f.label)}</h3>` : ""}<div class="reading">${markdown(f.value)}</div></div>`).join("")}</section>`).join(""), connections: v.connections.length ? `<section><h2>Connections</h2><div class="relationship-cards">${v.connections.map((x) => `<article class="relationship-card">${x.portrait ? `<img loading="lazy" src="${x.portrait}" alt="">` : ""}<h3>${x.linkedId ? btn(esc(x.name), "open", x.linkedId, "flat") : esc(x.name || "Someone")}</h3><strong>${esc(x.relationship)}</strong>${x.description || x.history ? `<details><summary>Relationship details</summary><div class="reading">${markdown(x.description)}${x.history ? "<h4>Shared history</h4>" + markdown(x.history) : ""}</div></details>` : ""}</article>`).join("")}</div>${btn("Explore relationship map", "relationship-map")}</section>` : "", appearances: [...v.appearances.stories, ...v.appearances.projects].length ? `<section><h2>Appears in</h2><div class="feature-toolbar">${[...v.appearances.stories, ...v.appearances.projects].map((x) => btn(esc(x.name), "open", x.id)).join("")}</div></section>` : "", gallery: v.gallery.length ? `<section><h2>Gallery</h2><div class="profile-gallery">${v.gallery.map((a) => `<figure><img loading="lazy" decoding="async" src="${a.data}" alt="${esc(a.title)}"><figcaption>${esc(a.title)}</figcaption></figure>`).join("")}</div></section>` : "", versions: v.versions.length ? `<section><h2>Other versions</h2>${v.versions.map((x) => btn(esc(x.name), "open", x.id)).join("")}</section>` : "" };
  return `<main class="character-page theme-${v.theme}"><div class="feature-toolbar">${btn("\u2190 Back", "feature-back")}${btn("Library", "back-library101")}${btn(c.favorite ? "\u2605 Favorite" : "\u2606 Favorite", "favorite", c.id)}${btn("Edit Character", "edit-character", "", "primary")}${btn("More", "character-more")}</div><div class="profile-identity">${v.portrait ? `<img class="hero-portrait" src="${v.portrait.data}" alt="${esc(c.name)}">` : `<div class="hero-placeholder" style="background:${c.color}">${esc(c.name[0])}</div>`}<div><p class="eyebrow">${esc(v.contexts.join(" \xB7 "))}</p><h1>${esc(v.name)}</h1>${v.epithet ? `<p class="epithet">${esc(v.epithet)}</p>` : ""}${v.hook ? `<blockquote>${esc(v.hook)}</blockquote>` : ""}<div class="feature-tags">${c.libraryTags.map((t) => `<span>${esc(t)}</span>`).join("")}</div></div></div><div class="page-context">${contextBar(c).replace(btn("Change", "uses", "", "tiny"), "")}<p class="quiet">Character Page \xB7 ${ctx === "all" ? "All contexts" : esc(ctx)} \xB7 Your selected presentation</p></div>${v.blocks.map((b) => content2[b] || "").join("") || empty}<footer class="page-footer">A place for every character. ${btn("Customize Character Page", "customize-page")}</footer></main>`;
}
shell = function(o) {
  if (o.kind === "character" && ui.tab === "Character Page") return featurePage(o);
  let html = featureBase.shell(o);
  if (o.kind === "character") html = html.replace('<div class="story-actions">', `<div class="story-actions">${btn("Character Page", "show-character-page")}`);
  return html;
};
home09 = function() {
  return featureBase.home().replace('<div class="section-heading">', featureToolbar() + '<div class="section-heading">');
};
library = function() {
  if (ui.page === "relationships") return featureMap();
  if (ui.page !== "characters") return featureToolbar() + featureBase.library();
  const q = ui.query.toLocaleLowerCase(), tags = [...new Set(w.characters.flatMap((c) => c.libraryTags || []))].sort();
  let list = w.characters.filter((c) => !!c.archived === ui.archive && (ui.filter === "all" || c.uses.includes(ui.filter)) && (!featureFavorites || c.favorite) && (!featureTag || c.libraryTags?.includes(featureTag)) && [P.searchable(c), ...c.libraryTags || []].join(" ").toLocaleLowerCase().includes(q));
  list.sort((a, b) => featureSort === "name" ? a.name.localeCompare(b.name) : featureSort === "recent" ? (b.openedAt || 0) - (a.openedAt || 0) : b.updated - a.updated);
  return `<main class="library"><div class="heading"><div><p class="eyebrow">YOUR WRITING SPACE \xB7 ${PaperRelease.version}</p><h1>Every character has a story.</h1><p>A personal library of fictional people.</p></div>${btn("+ New character", "create", "characters", "primary")}</div>${featureToolbar()}<div class="library-tabs">${["characters", "stories", "projects"].map((k) => btn(k[0].toUpperCase() + k.slice(1), "library", k, k === ui.page ? "selected" : "")).join("")}</div><div class="toolbar"><label class="search-inline">Search characters<input id="library-search" type="search" value="${esc(ui.query)}" placeholder="Name, writing or library tags\u2026"></label><label>Library tag<select id="feature-tag"><option value="">All tags</option>${tags.map((t) => `<option ${t === featureTag ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label><label>Sort<select id="feature-sort">${[["updated", "Recently edited"], ["recent", "Recently opened"], ["name", "Name"]].map(([v, l]) => `<option value="${v}" ${featureSort === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>${btn(featureFavorites ? "\u2605 Favorites only" : "\u2606 All characters", "favorite-filter")}${btn(ui.archive ? "Show active" : "Archive", "toggle-archive")}</div><div class="character-filter">${["all", ...P.contexts].map((k) => btn(k[0].toUpperCase() + k.slice(1), "filter", k, k === ui.filter ? "selected" : "")).join("")}</div><p class="quiet">${list.length} characters${q ? " \xB7 For matches by field, use Search everything." : ""}</p><div class="books">${list.slice(0, ui.libraryLimit || 60).map((c) => `<article class="book-wrap"><button class="book-button" data-action="open" data-value="${c.id}" aria-label="Open ${esc(c.name)}">${cover(c)}<div class="book-meta"><strong>${esc(c.name)}</strong><small>${esc(c.libraryTags.join(" \xB7 ")) || esc(c.uses.join(" \xB7 "))}</small></div></button>${btn(c.favorite ? "\u2605 Favorite" : "\u2606 Favorite", "favorite", c.id, "tiny")}${ui.archive ? btn("Unarchive", "unarchive", c.id, "tiny") : ""}</article>`).join("")}</div>${list.length > (ui.libraryLimit || 60) ? btn("Show more characters", "library-more") : ""}${!list.length ? `<div class="empty"><h2>No characters here yet</h2><p>Change your filters or start with a name.</p>${btn("Clear filters", "clear-filters")}${btn("Create character", "create", "characters")}${btn("Import character", "import-character")}</div>` : ""}</main>`;
};
const featureProject = projectContent;
projectContent = function(o, path) {
  if (ui.tab !== "Cast") return featureProject(o, path);
  const list = P.projectCast(o, w), q = ui.castQuery || "";
  return `<p class="section-desc">The cast includes project members and characters linked through this project\u2019s stories. One book, wherever they appear.</p><label>Find a cast member<input id="cast-search" value="${esc(q)}"></label>${btn("Manage contents", "project-members")}<div class="cast-grid">${list.filter((c) => [c.name, ...c.libraryTags].join(" ").toLowerCase().includes(q.toLowerCase())).map((c) => `<button class="cast-card" data-action="open" data-value="${c.id}">${featureAvatar(c)}<strong>${esc(c.name)}</strong><span>${esc(w.stories.filter((s) => o.stories.includes(s.id)).flatMap((s) => s.cast.filter((x) => x.characterId === c.id).map((x) => x.role)).filter(Boolean).join(" \xB7 "))}</span><small>${esc(c.libraryTags.join(" \xB7 "))}</small></button>`).join("") || "<p>No matching cast members. Link characters or stories using Manage contents.</p>"}</div>`;
};
function featureMetadata() {
  const c = object(), path = objectPath();
  dialog("Identity & library tags", `<p>Library tags organize your collection. Platform tags in Chatbot Setup remain separate.</p>${input("Epithet / subtitle", path + ".epithet", c.epithet)}${input("Character hook / quotation", path + ".hook", c.hook, "textarea")}<label>Library tags (one per line)<textarea id="feature-tags">${esc(c.libraryTags.join("\n"))}</textarea></label>`, [["Done", "metadata-done", "", "primary"]]);
}
function featureCustomize(ctx = featureContext(object()), draft) {
  const c = object();
  featurePageDraft = draft || P.clone(P.pageSettings(c, ctx));
  const d = featurePageDraft, fields = P.presentationFields(c, ctx);
  dialog("Customize Character Page", `<p>This controls the ${esc(ctx)} presentation and its shareable HTML. Private notes never appear. Review freeform text for spoilers before showing it.</p><label>Context<select id="custom-context">${["all", ...P.contexts].map((v) => `<option value="${v}" ${v === ctx ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label><label>Presentation style<select id="page-theme">${["paper", "codex", "profile"].map((t) => `<option ${d.theme === t ? "selected" : ""}>${t}</option>`).join("")}</select></label><h3>Page blocks</h3><p class="quiet">Use arrows to reorder, check a block to show it.</p>${[...d.blocks, ...["about", "facts", "details", "connections", "appearances", "gallery", "versions"].filter((x) => !d.blocks.includes(x))].map((b, i) => `<div class="custom-row"><label class="check"><input type="checkbox" data-page-block="${b}" ${d.blocks.includes(b) ? "checked" : ""}>${esc(b)}</label>${btn("\u2191", "page-block-up", b, "tiny")}${btn("\u2193", "page-block-down", b, "tiny")}</div>`).join("")}<h3>Visible fields</h3><p class="quiet">Hidden Workspace fields are not presented. Secret and private-persona fields start unchecked.</p>${fields.map((f) => `<label class="check"><input type="checkbox" data-page-field="${esc(f.id)}" ${d.fields.includes(f.id) && !f.hidden ? "checked" : ""} ${f.hidden ? "disabled" : ""}>${esc(f.section + " \u2192 " + f.label)}${f.hidden ? " (hidden in Workspace)" : ""}</label>`).join("")}<h3>Quick facts in display order</h3>${d.quickFacts.map((id) => {
    const f = fields.find((f2) => f2.id === id);
    return f ? `<div class="custom-row"><span>${esc(f.label)}</span>${btn("\u2191", "fact-up", id, "tiny")}${btn("\u2193", "fact-down", id, "tiny")}${btn("Remove", "fact-remove", id, "tiny")}</div>` : "";
  }).join("")}<label>Add quick fact<select id="fact-add"><option value="">Choose a field</option>${fields.filter((f) => !f.hidden && !d.quickFacts.includes(f.id)).map((f) => `<option value="${esc(f.id)}">${esc(f.section + " \u2192 " + f.label)}</option>`).join("")}</select></label>${featureCheck("page-gallery", "Show gallery preview", d.gallery)}${featureCheck("page-relations", "Show relationships", d.relationships)}${featureCheck("page-history", "Show shared relationship history (may contain spoilers)", d.history)}<details><summary>Hide individual connections or images</summary>${c.connections.map((x) => `<label class="check"><input data-hide-connection="${x.id}" type="checkbox" ${d.hiddenConnections.includes(x.id) ? "checked" : ""}>Hide ${esc(w.characters.find((b) => b.id === x.linkedId)?.name || x.name || "Unnamed connection")}</label>`).join("")}${c.gallery.map((x) => `<label class="check"><input data-hide-image="${x.id}" type="checkbox" ${d.hiddenImages.includes(x.id) ? "checked" : ""}>Hide image: ${esc(x.title || "Untitled")}</label>`).join("")}</details>`, [["Restore defaults", "page-defaults"], ["Cancel", "close-modal"], ["Save presentation", "page-save", "", "primary"]]);
  const groups = /* @__PURE__ */ new Map();
  for (const f of fields) {
    const box = modal.querySelector('[data-page-field="' + CSS.escape(f.id) + '"]');
    if (!box) continue;
    let group = groups.get(f.sectionId);
    if (!group) {
      const details = document.createElement("details");
      details.className = "page-field-group";
      const summary = document.createElement("summary");
      summary.textContent = f.section;
      details.append(summary);
      const label = document.createElement("label");
      label.className = "check";
      const toggle = document.createElement("input");
      toggle.type = "checkbox";
      label.append(toggle, document.createTextNode("Show section fields"));
      details.append(label);
      box.closest("label").before(details);
      group = { details, toggle, boxes: [] };
      groups.set(f.sectionId, group);
      toggle.onchange = () => group.boxes.forEach((b) => {
        if (!b.disabled) b.checked = toggle.checked;
      });
    }
    group.boxes.push(box);
    group.details.append(box.closest("label"));
  }
  for (const group of groups.values()) group.toggle.checked = group.boxes.filter((b) => !b.disabled).every((b) => b.checked);
  const collect = () => {
    d.theme = $("#page-theme").value;
    d.blocks = [...modal.querySelectorAll("[data-page-block]:checked")].map((x) => x.dataset.pageBlock);
    d.fields = [...modal.querySelectorAll("[data-page-field]:checked")].map((x) => x.dataset.pageField);
    d.gallery = $("#page-gallery").checked;
    d.relationships = $("#page-relations").checked;
    d.history = $("#page-history").checked;
    d.hiddenConnections = [...modal.querySelectorAll("[data-hide-connection]:checked")].map((x) => x.dataset.hideConnection);
    d.hiddenImages = [...modal.querySelectorAll("[data-hide-image]:checked")].map((x) => x.dataset.hideImage);
  };
  $("#custom-context").onchange = (e) => featureCustomize(e.target.value);
  $("#fact-add").onchange = (e) => {
    collect();
    if (e.target.value) {
      d.quickFacts.push(e.target.value);
      if (!d.fields.includes(e.target.value)) d.fields.push(e.target.value);
    }
    featureCustomize(ctx, d);
  };
  modal.querySelectorAll('[data-action^="page-block-"],[data-action^="fact-"]').forEach((b) => b.onclick = () => {
    collect();
    const a = b.dataset.action, id = b.dataset.value;
    if (a === "fact-remove") d.quickFacts = d.quickFacts.filter((x) => x !== id);
    else {
      const arr = a.startsWith("fact-") ? d.quickFacts : d.blocks;
      move(arr, arr.indexOf(id), a.endsWith("up") ? -1 : 1);
    }
    featureCustomize(ctx, d);
  });
  modal.querySelector('[data-action="page-defaults"]').onclick = () => featureCustomize(ctx, P.pageDefaults(c, ctx));
  modal.querySelector('[data-action="page-save"]').onclick = () => {
    collect();
    transact(() => c.presentation[ctx] = P.clone(d));
    closeDialog();
  };
}
function featureClone(fork) {
  const c = object();
  dialog(fork ? "Fork character" : "Duplicate character", `<p>Creates an independent book. Linked copies never change another character\u2019s relationships.</p><label>New name<input id="clone-name" value="${esc(c.name + (fork ? " \u2014 Alternate version" : " \u2014 Copy"))}" maxlength="150"></label>${fork ? '<label>Version label<input id="clone-label" placeholder="Cyberpunk AU"></label>' + featureCheck("clone-original", "Link to original version", true) : ""}<details><summary>Choose section writing to copy</summary>${c.sections.map((s) => `<label class="check"><input name="clone-section" type="checkbox" value="${s.id}" checked>${esc(s.name)}</label>`).join("")}</details>${featureCheck("clone-appearances", "Link this version to the same stories and projects", false)}${[["writing", "Section writing, appearance and personality", true], ["gallery", "Gallery and portraits", true], ["references", "References", true], ["greetings", "Greetings", true], ["dialogues", "Dialogue examples", true], ["notes", "Private Creator Notes (explicit copy)", false], ["connections", "Independent connections (no reciprocal changes)", false]].map(([key, label, on]) => featureCheck("clone-" + key, label, on)).join("")}`, [["Cancel", "close-modal"], ["Create independent version", "clone-submit", "", "primary"]]);
  modal.querySelector('[data-action="clone-submit"]').onclick = () => {
    const name = $("#clone-name").value.trim();
    if (!name) return inlineError09(Error("Give the new character a name."));
    const opts = { name, fork, label: $("#clone-label")?.value, linkOriginal: $("#clone-original")?.checked, sectionIds: [...modal.querySelectorAll("[name=clone-section]:checked")].map((x) => x.value) };
    const appearances = $("#clone-appearances").checked;
    for (const k of ["writing", "gallery", "references", "greetings", "dialogues", "notes", "connections"]) opts[k] = $("#clone-" + k).checked;
    transact(() => {
      const n = P.cloneCharacter(c, w, opts);
      w.characters.push(n);
      if (appearances) {
        for (const p of w.projects) if (p.members.includes(c.id)) p.members.push(n.id);
        for (const story of w.stories) {
          const role = story.cast.find((x) => x.characterId === c.id);
          if (role) story.cast.push({ characterId: n.id, role: role.role });
        }
      }
      featureRemember();
      ui.id = n.id;
      ui.tab = "Character Page";
    });
    closeDialog();
  };
}
async function featureImport() {
  const picker = $("#file-picker");
  picker.accept = ".characterpaper,.json,application/json";
  picker.multiple = false;
  picker.value = "";
  picker.onchange = async () => {
    try {
      const f = picker.files[0];
      if (!f) return;
      if (f.size > P.packageLimit) throw Error("Choose a character file under 40 MB.");
      const text = await f.text();
      const raw = JSON.parse(text);
      let pkg, c, warnings;
      if (raw.format === "character-paper-character") {
        pkg = P.parseCharacterPackage(text);
        c = pkg.character;
        warnings = pkg.warnings || [];
      } else {
        const result = P.importExternalCard(raw);
        c = result.character;
        warnings = result.warnings;
      }
      const conflicts = w.characters.filter((x) => x.name.toLocaleLowerCase() === c.name.toLocaleLowerCase() || x.id === c.id || x.importSourceId === c.id);
      dialog("Preview character import", `<h3>${esc(c.name)}</h3><p>${c.sections.length} sections \xB7 ${c.gallery.length} gallery images \xB7 ${c.connections.length} connections</p><p>${esc(c.sections.find((s) => s.name === "Information")?.fields.find((f2) => f2.label === "Bio")?.value.slice(0, 600) || "No biography supplied.")}</p>${conflicts.length ? '<p class="banner">A related name or source already exists. This import creates a separate book; nothing will be overwritten.</p>' : ""}<label>Import name<input id="import-name" value="${esc(c.name + (conflicts.length ? " \u2014 Imported" : ""))}" maxlength="150"></label>${pkg ? featureCheck("import-links", "Link to existing characters when both original ID and name match", false) : ""}<ul>${warnings.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><p>Private notes and snapshots are excluded. Review the new book before sharing.</p>`, [["Cancel", "close-modal"], ["Import as new character", "import-submit", "", "primary"]]);
      modal.querySelector('[data-action="import-submit"]').onclick = () => {
        try {
          const name = $("#import-name").value.trim();
          if (!name) throw Error("Give the import a name.");
          const next = pkg ? P.importCharacterPackage(pkg, w, { name, reconcile: $("#import-links").checked }) : P.cloneCharacter(c, w, { name, connections: false });
          const candidate = P.clone(w);
          candidate.characters.push(next);
          P.validate(candidate);
          transact(() => {
            w.characters.push(next);
            ui.id = next.id;
            ui.tab = "Character Page";
            screen09 = "app";
          });
          closeDialog();
        } catch (e) {
          inlineError09(e);
        }
      };
    } catch (e) {
      notice("Import was not applied: " + e.message);
    }
  };
  picker.click();
}
function featureSearch() {
  dialog("Search everything", `<label>Search your writing<input id="advanced-query" type="search" placeholder="Try faded red scarf"></label><label>Type<select id="advanced-kind"><option value="">All books</option><option value="character">Characters</option><option value="story">Stories</option><option value="project">Projects</option></select></label><p class="quiet">All words must occur in the same field. Includes private notes only inside this local workspace. Platform publishing tags stay excluded.</p><div id="advanced-results" aria-live="polite"></div>`);
  let t;
  const run = () => {
    const q = $("#advanced-query").value;
    featureSearchResults = P.advancedSearch(w, q, { archive: ui.archive });
    const kind = $("#advanced-kind").value;
    $("#advanced-results").innerHTML = featureSearchResults.map((r, i) => kind && r.kind !== kind ? "" : `<button class="search-result" data-action="search-result" data-value="${i}"><strong>${esc(r.name)}</strong><span>${esc(r.path)}</span><small>${featureHighlight(r.text, q)}</small></button>`).join("") || (q.trim() ? "<p>No matches. Try fewer words.</p>" : "<p>Start typing to find a detail across your library.</p>");
    bind($("#advanced-results"));
  };
  $("#advanced-query").oninput = () => {
    clearTimeout(t);
    t = setTimeout(run, 150);
  };
  $("#advanced-kind").onchange = run;
  $("#advanced-query").focus();
  run();
}
function featureHighlight(text, query) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  let out = "", at = 0;
  const lower = text.toLowerCase();
  while (at < text.length) {
    const hits = words.map((w2) => ({ at: lower.indexOf(w2, at), len: w2.length })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at);
    if (!hits.length) {
      out += esc(text.slice(at));
      break;
    }
    const h = hits[0];
    out += esc(text.slice(at, h.at)) + "<mark>" + esc(text.slice(h.at, h.at + h.len)) + "</mark>";
    at = h.at + h.len;
  }
  return out;
}
function featureHealth(id) {
  const issues = P.characterHealth(w, id);
  dialog(id ? "Character health" : "Library health", `<p>${issues.length ? issues.length + " structural warnings or errors" : "No issues found"}. This checks links and files, never writing quality.</p><div class="health-list">${issues.map((x, i) => `<article><strong>${esc(x.name)}</strong><p>${esc(x.message)}</p>${btn("Open book", "open", x.id)}${x.target ? btn("Clear broken selection", "health-repair", i) : ""}</article>`).join("")}</div><p class="quiet">Repairs only clear broken selections or original-version links. Creative writing is never removed.</p>`);
  modal.querySelectorAll('[data-action="health-repair"]').forEach((b) => b.onclick = () => {
    const issue = issues[+b.dataset.value], c = w.characters.find((c2) => c2.id === issue.id) || [...w.stories, ...w.projects].find((c2) => c2.id === issue.id);
    if (!c) return;
    transact(() => {
      if (issue.target === "cover") c.cover = null;
      if (issue.target === "portrait") c.portraitId = "";
      if (issue.target === "fork") c.forkOf = "";
      if (issue.target === "presentation") {
        const ids = new Set(P.presentationFields(c).map((f) => f.id));
        for (const s of Object.values(c.presentation)) {
          s.fields = s.fields.filter((x) => ids.has(x));
          s.quickFacts = s.quickFacts.filter((x) => ids.has(x));
        }
      }
    });
    featureHealth(id);
  });
}
function featureMap() {
  const ids = featureMapFilter ? P.projectCast(w.projects.find((p) => p.id === featureMapFilter) || { members: [], stories: [] }, w).map((c) => c.id) : null, g = P.relationshipGraph(w, ids), max = 120, nodes = g.nodes.slice(0, max), width = Math.max(800, Math.ceil(Math.sqrt(nodes.length)) * 240), height = Math.max(650, Math.ceil(nodes.length / Math.max(1, Math.floor(width / 240))) * 150), positions = new Map(nodes.map((n, i) => [n.id, { x: 130 + i % Math.floor(width / 240) * 240, y: 85 + Math.floor(i / Math.floor(width / 240)) * 150 }]));
  return `<main class="library"><div class="heading"><div><h1>Relationship map</h1><p>Explore your cast. Select a name to meet the character.</p></div>${btn("\u2190 Back", "feature-back")}</div><label>Project<select id="map-project"><option value="">Whole library</option>${w.projects.map((p) => `<option value="${p.id}" ${featureMapFilter === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label><div class="feature-toolbar">${btn("\u2212 Zoom out", "map-out")}${btn("+ Zoom in", "map-in")}${btn("Reset zoom", "map-reset")}</div><p class="quiet">Scroll or drag to pan; use zoom controls on touch screens. ${g.nodes.length} characters \xB7 ${g.edges.length} relationships${g.nodes.length > max ? " \xB7 Showing the first 120; filter by project for a smaller map." : ""}</p><div class="map-viewport" tabindex="0" aria-label="Relationship map. Scroll to pan."><div class="map-canvas" style="width:${width}px;height:${height}px"><svg aria-hidden="true" width="${width}" height="${height}">${g.edges.map((e) => {
    const a = positions.get(e.a), b = positions.get(e.b);
    return a && b ? `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/><text x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 14}">${esc(e.label.slice(0, 28))}</text>` : "";
  }).join("")}</svg>${nodes.map((n) => {
    const pos = positions.get(n.id);
    return `<button class="map-node" style="left:${pos.x - 80}px;top:${pos.y - 26}px" data-action="open" data-value="${n.id}">${esc(n.name)}</button>`;
  }).join("")}</div></div>${!nodes.length ? "<p>Connect characters in the Workspace to build your map.</p>" : ""}</main>`;
}
bookOptions = function() {
  featureBase.options();
  if (object()?.kind === "character") {
    modal.querySelector(".option-grid").insertAdjacentHTML("beforeend", `${btn("Identity & library tags", "character-metadata")}${btn("Character Page", "show-character-page")}${btn("Customize Character Page", "customize-page")}${btn("Duplicate character", "duplicate-character")}${btn("Fork character", "fork-character")}${btn("Character health", "character-health")}${btn("Export portable character", "portable-export")}${btn("Export Character Page (HTML)", "page-export")}`);
    bind(modal);
  }
};
exportDialog = function() {
  featureBase.export();
  if (object()?.kind === "character") {
    modal.querySelector(".dialog-actions").insertAdjacentHTML("beforebegin", `<div class="feature-toolbar">${btn("Portable character package", "portable-export")}${btn("Shareable Character Page (HTML)", "page-export")}</div>`);
    bind(modal);
  }
};
aboutPage09 = function(creator = false) {
  let html = featureBase.about(creator);
  if (creator) return html;
  html = html.replace("It is not an arbitrary CHub or Janitor card importer. Character card JSON is an export format; use a full profile backup to move your whole workspace.", "Use Import character for native .characterpaper packages or Character Card V2 JSON. Full backups remain a separate Restore workflow. PNG metadata cards are not supported.");
  const questions = [["What is a Character Page?", "Opening a character shows a reading view. Edit Character opens the Workspace; Character Page returns to the presentation. Changes appear automatically."], ["How do I hide spoilers?", "Customize Character Page controls the fields, blocks, images, relationships and shared history shown for each context. Private working notes never appear. Review freeform writing for spoilers before publishing."], ["How do duplicate and fork work?", "Both create independent books. Fork can link to an original. Private notes and connections are explicit optional copies; reciprocal connections are never changed."], ["How do I transfer a character?", "Choose Export portable character in Book options. Import character previews .characterpaper packages and Character Card V2 JSON before creating a separate book. Packages preserve facts and media but exclude private notes, snapshots and story/project memberships."], ["Can I share a beautiful profile?", "Export Character Page creates a self-contained HTML file using the current context and visibility choices. Open it in a browser and use Print \u2192 Save as PDF. Direct PDF/image export and embedded PNG character cards are not supported."], ["What are library tags and favorites?", "Library tags in Identity & library tags organize your collection and are searchable. Chatbot publishing tags remain separate. Mark a favorite from its Character Page or library card."], ["What do health checks do?", "Character health or Library health detects broken links, missing selected media and obsolete page selections. It does not grade creativity. Repair actions only clear broken selections; back up before broader changes."], ["How do I explore a cast?", "Use Cast View inside a project, Appears in on a Character Page, and Relationship map from Home or the library. Map information comes from existing connections."], ["How does Search everything work?", "Search finds all words within a field and shows the matching section and a highlighted excerpt. Results go directly to that writing. Private notes are searched only inside your local workspace."]];
  return html.replace('<h2 id="faq">', questions.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("") + '<h2 id="faq">');
};
bind = function(root) {
  featureBase.bind(root);
  for (const [id, fn] of [["feature-tag", (e) => {
    featureTag = e.target.value;
    render();
  }], ["feature-sort", (e) => {
    featureSort = e.target.value;
    render();
  }], ["map-project", (e) => {
    featureMapFilter = e.target.value;
    render();
  }], ["cast-search", (e) => {
    const at = e.target.selectionStart;
    ui.castQuery = e.target.value;
    render();
    $("#cast-search").focus();
    $("#cast-search").setSelectionRange(at, at);
  }]]) {
    const el = root.querySelector("#" + id);
    if (el) el.oninput = fn;
  }
  const map = root.querySelector(".map-viewport");
  if (map) {
    let pan;
    map.onpointerdown = (e) => {
      if (e.target.closest("button") || e.pointerType === "touch") return;
      pan = { x: e.clientX, y: e.clientY, left: map.scrollLeft, top: map.scrollTop };
      map.setPointerCapture(e.pointerId);
    };
    map.onpointermove = (e) => {
      if (pan) {
        map.scrollLeft = pan.left + pan.x - e.clientX;
        map.scrollTop = pan.top + pan.y - e.clientY;
      }
    };
    map.onpointerup = () => pan = null;
  }
  root.querySelectorAll("img:not([loading])").forEach((i) => {
    i.loading = "lazy";
    i.decoding = "async";
  });
};
render = function() {
  if (profile09 && featureOwner !== profile09.id) {
    featureOwner = profile09.id;
    featureHistory = [];
    featureForward = [];
    featureTag = "";
    featureFavorites = false;
  }
  if (!profile09) featureOwner = "";
  w.characters.forEach(P.normalizeCharacter);
  featureBase.render();
  const key = [profile09?.id, screen09, ui.page, ui.id, ui.tab, ui.chapter].join("|");
  if (key !== featureRenderKey) {
    featureRenderKey = key;
    window.scrollTo(0, 0);
  }
};
action = async function(name, value) {
  const c = object();
  if (name === "feature-back") {
    closeDialog();
    return featureBack();
  }
  if (name === "edit-character") return navigate(() => {
    featurePageScroll[c.id] = window.scrollY;
    ui.workspaceTab = ui.workspaceTab || "Loose pages";
    ui.tab = ui.workspaceTab;
    requestAnimationFrame(() => window.scrollTo(0, featureWorkspaceScroll[c.id] || 0));
  });
  if (name === "show-character-page") {
    closeDialog();
    return navigate(() => {
      if (ui.tab !== "Character Page") {
        ui.workspaceTab = ui.tab;
        featureWorkspaceScroll[c.id] = window.scrollY;
      }
      ui.tab = "Character Page";
      requestAnimationFrame(() => window.scrollTo(0, featurePageScroll[c.id] || 0));
    });
  }
  if (name === "character-more") return dialog("Character actions", `<div class="option-grid">${btn("Customize Character Page", "customize-page")}${btn("Identity & library tags", "character-metadata")}${btn("Duplicate character", "duplicate-character")}${btn("Fork character", "fork-character")}${btn("Export Character Page", "page-export")}${btn("Portable character package", "portable-export")}${btn("Character health", "character-health")}${btn("Book options", "book-options")}</div>`);
  if (name === "favorite") return transact(() => {
    const item = w.characters.find((x) => x.id === value);
    if (item) item.favorite = !item.favorite;
  });
  if (name === "favorite-filter") {
    featureFavorites = !featureFavorites;
    render();
    return;
  }
  if (name === "library-more") {
    ui.libraryLimit = (ui.libraryLimit || 60) + 60;
    render();
    return;
  }
  if (name === "clear-filters") {
    featureTag = "";
    featureFavorites = false;
    ui.query = "";
    ui.filter = "all";
    render();
    return;
  }
  if (name === "character-metadata") return featureMetadata();
  if (name === "metadata-done") {
    transact(() => {
      c.libraryTags = [...new Set($("#feature-tags").value.split(/[\n,]/).map((x) => x.trim()).filter(Boolean))].slice(0, 80);
    });
    closeDialog();
    return;
  }
  if (name === "customize-page") return featureCustomize();
  if (name === "duplicate-character" || name === "fork-character") return featureClone(name === "fork-character");
  if (name === "portable-export") {
    const text = JSON.stringify(P.portableCharacter(c, w), null, 2);
    if (text.length > P.packageLimit) throw Error("This character exceeds the 40 MB portable package limit. Keep a full profile backup or reduce media in a duplicate before exporting.");
    return download(safeName(c.name) + ".characterpaper", text, "application/json");
  }
  if (name === "page-export") return download(safeName(c.name) + "-profile.html", P.shareableHtml(c, w, featureContext(c)), "text/html");
  if (name === "import-character") return featureImport();
  if (name === "search-all") return featureSearch();
  if (name === "search-result") {
    const r = featureSearchResults[+value];
    if (!r) return;
    const searchQuery = $("#advanced-query")?.value || "";
    closeDialog();
    return navigate(() => {
      featureRemember();
      ui.searchFocus = r;
      ui.searchQuery = searchQuery;
      ui.id = r.id;
      ui.tab = r.tab;
      ui.focus = false;
      screen09 = "app";
      const o = object();
      if (o?.kind === "character") {
        if (["Greetings", "Dialogue", "Setup"].includes(r.tab) && !o.view.includes("chatbot")) o.view = ["chatbot"];
        const s = o.sections.find((s2) => s2.id === r.tab);
        if (s && !P.applicable(s.scope, o.view)) o.view = s.scope.slice();
        if (s) s.collapsed = false;
      }
      if (o?.kind === "story" && r.fieldId) ui.chapter = r.fieldId;
      requestAnimationFrame(() => {
        let field = r.fieldId ? document.querySelector(`[data-bind$=".value"]`) : null;
        if (o?.sections) {
          const si = o.sections.findIndex((s) => s.id === r.tab), fi = o.sections[si]?.fields.findIndex((f) => f.id === r.fieldId);
          if (si >= 0 && fi >= 0) field = document.querySelector(`[data-bind="${objectPath()}.sections.${si}.fields.${fi}.value"]`);
        }
        field?.scrollIntoView({ block: "center" });
        field?.focus();
        if (field?.setSelectionRange) {
          const q = (ui.searchQuery || "").trim().split(/\s+/)[0], start = field.value.toLowerCase().indexOf(q.toLowerCase());
          field.setSelectionRange(Math.max(0, start), Math.max(0, start) + q.length);
        }
      });
    });
  }
  if (name === "library-health" || name === "character-health") return featureHealth(name === "character-health" ? c.id : null);
  if (name === "relationship-map") return navigate(() => {
    featureRemember();
    screen09 = "app";
    ui.id = null;
    ui.page = "relationships";
  });
  if (name.startsWith("map-")) {
    const canvas = $(".map-canvas");
    if (canvas) {
      const zoom = name === "map-reset" ? 1 : Math.max(0.4, Math.min(2.5, (+canvas.dataset.zoom || 1) + (name === "map-in" ? 0.2 : -0.2)));
      canvas.dataset.zoom = zoom;
      canvas.style.transform = `scale(${zoom})`;
      canvas.style.transformOrigin = "top left";
    }
    return;
  }
  if (name === "open" && modal.open) closeDialog();
  if (["lock09", "unlock09", "apply-import", "example-reset"].includes(name)) {
    featureHistory = [];
    featurePageScroll = {};
    featureWorkspaceScroll = {};
  }
  ;
  return featureBase.action(name, value);
};
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "ArrowLeft" && profile09 && !modal.open) {
    e.preventDefault();
    featureBack();
  }
});
const featureCover = cover;
cover = function(o) {
  const image = o.gallery.find((a) => a.id === o.cover?.id);
  return featureCover(image?.thumbnail ? { ...o, gallery: o.gallery.map((a) => a === image ? { ...a, data: a.thumbnail } : a) } : o);
};
media = function(o, path, reference) {
  const key = reference ? "references" : "gallery", limit = ui.mediaLimit || 24, list = o[key].slice(0, limit);
  let html = featureBase.media({ ...o, [key]: list }, path, reference);
  for (const a of list) if (a.thumbnail) html = html.split('src="' + a.data + '"').join('loading="lazy" decoding="async" src="' + a.thumbnail + '"');
  const bytes = o[key].reduce((n, a) => n + (a.data?.length || 0) * 0.75, 0);
  return `<p class="storage-summary">${o[key].length} items \xB7 about ${(bytes / 1048576).toFixed(1)} MB of original images. Originals are preserved; gallery thumbnails are display copies.</p>` + html + (o[key].length > limit ? btn("Show more items", "media-more") : "");
};
imageFiles = async function(key) {
  const picker = $("#file-picker"), owner = object();
  picker.accept = "image/png,image/jpeg,image/webp,image/gif";
  picker.multiple = true;
  picker.value = "";
  picker.onchange = async () => {
    try {
      const files = [...picker.files];
      if (files.reduce((n, f) => n + f.size, 0) > 32 * 1048576) throw Error("Add up to 32 MB of images at a time.");
      const images = [];
      for (const file of files) {
        if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 8 * 1048576) throw Error("Choose PNG, JPEG, WebP or GIF images under 8 MB each.");
        const data = await readData09(file), img = new Image();
        img.src = data;
        await img.decode();
        if (img.naturalWidth * img.naturalHeight > 4e7) throw Error("This image is too large to work with safely. Choose a copy under 40 megapixels.");
        const scale = Math.min(1, 420 / Math.max(img.naturalWidth, img.naturalHeight)), canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        images.push({ id: P.uid(), type: "image", title: file.name.replace(/\.[^.]+$/, ""), description: "", source: "", data, thumbnail: canvas.toDataURL("image/webp", 0.82) });
      }
      if (![...w.characters, ...w.stories, ...w.projects].some((o) => o.id === owner.id)) throw Error("The destination book is no longer open.");
      transact(() => owner[key].push(...images));
    } catch (e) {
      notice("Images were not added: " + e.message);
    }
  };
  picker.click();
};
const featureActionMedia = action;
action = async function(name, value) {
  if (name === "media-more") {
    ui.mediaLimit = (ui.mediaLimit || 24) + 24;
    render();
    return;
  }
  if (name === "create" && value === "characters") {
    await featureActionMedia(name, value);
    const select = $("#new-template");
    if (select) {
      for (const [ctx, label] of [["story", "Novel Character"], ["roleplay", "Roleplay Character"], ["chatbot", "Chatbot Character"], ["game", "Game NPC"]]) {
        const opt = document.createElement("option");
        opt.value = "builtin:" + ctx;
        opt.textContent = label;
        select.append(opt);
      }
      const submit = modal.querySelector('[data-action="create-confirm"]'), original = submit.onclick;
      submit.onclick = () => {
        const ctx = select.value.startsWith("builtin:") ? select.value.slice(8) : null;
        original();
        if (ctx && object()?.kind === "character") transact(() => {
          object().uses = [ctx];
          object().view = [ctx];
        });
      };
      $("#new-name").onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submit.click();
        }
      };
    }
    return;
  }
  return featureActionMedia(name, value);
};
const featureContent = content;
content = function(o, path) {
  const match = ui.searchFocus;
  if (o.kind === "character" && match?.id === o.id) {
    const s = o.sections.find((s2) => s2.id === ui.tab);
    if (s) {
      const copy = P.clone(o), section = copy.sections.find((x) => x.id === s.id);
      section.collapsed = false;
      if (match.path.endsWith("\u2192 Freeform")) section.mode = "Freeform";
      else if (match.fieldId) {
        section.mode = "Structured";
        section.fields.forEach((f) => {
          if (f.id === match.fieldId) f.hidden = false;
        });
      }
      return featureContent(copy, path);
    }
  }
  return featureContent(o, path);
};
const featureNavigationAction = action;
action = async function(name, value) {
  if (["tab", "open", "mode", "back-library101", "home", "library"].includes(name)) ui.searchFocus = null;
  if (name === "metadata-done") {
    const tags = $("#feature-tags").value.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
    if (tags.length > 80 || tags.some((t) => t.length > 200)) return inlineError09(Error("Use up to 80 tags, with at most 200 characters per tag."));
  }
  return featureNavigationAction(name, value);
};
