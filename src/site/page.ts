import { assetUrl, escapeHtml as e } from "./html";
import {
  downloads,
  equipment,
  finance,
  people,
  records,
  work,
} from "./sections";
import type { Gallery } from "./types";

function section(id: string, title: string, lede: string, body: string) {
  return `<section id="${id}" aria-labelledby="${id}-title"><div class="section-heading"><h2 id="${id}-title">${e(title)}</h2><p>${e(lede)}</p></div>${body}</section>`;
}

export function galleryPage(gallery: Gallery): string {
  const { canon, seed } = gallery;
  const members = seed.people.filter((person) => person.role !== null).length;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <meta name="description" content="Balebase continuity: the fictional company, people, equipment, and records behind Balebase screenshots and demos.">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#f4f3ef">
  <title>Continuity — Balebase</title>
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/style.css">
</head>
<body id="top">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><a class="wordmark" href="#top">continuity<span>/ balebase</span></a>
    <nav aria-label="Page sections"><a href="#people">People</a><a href="#equipment">Equipment</a><a href="#work">Jobs</a><a href="#finance">Finance</a><a href="#records">Records</a><a href="#files">Files</a></nav>
  </header>
  <main id="main">
    <section class="intro" aria-labelledby="intro-title"><div><p class="eyebrow">The Balebase specimen workspace</p>
      <h1 id="intro-title">${e(canon.organization.name)}</h1>
      <p class="lede">${e(canon.organization.tagline)}. A fictional company whose people, equipment, jobs, and books agree with one another everywhere Balebase shows them.</p></div>
      <aside class="collection-info" aria-label="Collection details"><dl>
        <div><dt>Members</dt><dd>${members}</dd></div>
        <div><dt>People</dt><dd>${seed.people.length}</dd></div>
        <div><dt>Story date</dt><dd><time datetime="${e(canon.asOf)}">${e(canon.asOf)}</time></dd></div></dl>
        <p class="fine-print">${e(canon.organization.address)}. Every person, company, and place here is fictional.</p></aside>
    </section>
    ${section("people", "People", "The crew, the office, and the clients and vendors they deal with.", `<div class="grid people">${people(gallery)}</div>`)}
    ${section("equipment", "Equipment", "Every device on the register, photographed for its record.", `<div class="grid">${equipment(gallery)}</div>`)}
    ${section("work", "Jobs, audits, and issues", "What the crew is working on and what it found.", work(gallery))}
    ${section("finance", "Finance", "The bank feed the Finance group files under expense categories.", finance(gallery))}
    ${section("records", "Records", "Contracts out for signature, the company library, and requests to employees.", records(gallery))}
    ${section("files", "Files", `${gallery.assets.length} files in the genesis package.`, `<p><a class="text-link" href="${assetUrl("balebase/seed.json")}">Balebase seed</a> · <a class="text-link" href="${assetUrl("manifest.json")}" download>Manifest</a></p><ul class="file-list">${downloads(gallery)}</ul>`)}
  </main>
  <footer><a class="wordmark" href="#top">continuity<span>/ balebase</span></a><p>Fictional by design. Consistent by construction.</p><a href="https://github.com/a2f0/balebase-continuity">Source on GitHub</a></footer>
</body>
</html>
`;
}
