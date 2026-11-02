import { assetUrl, escapeHtml as e, fileSize } from "./html";
import type { Gallery } from "./types";

// One function per gallery section. Each reads the seed and canon snapshot
// and returns HTML; none touches canon/world.ts.

const money = (value: number) =>
  `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

function image(gallery: Gallery, path: string, alt: string) {
  const asset = gallery.assets.find((item) => item.path === path);
  const size = asset?.image
    ? ` width="${asset.image.width}" height="${asset.image.height}"`
    : "";
  return `<img src="${assetUrl(path)}" alt="${e(alt)}"${size} loading="lazy" decoding="async">`;
}

function nameOf(gallery: Gallery, id: string | null): string {
  if (id === null) return "Unassigned";
  return gallery.seed.people.find((person) => person.id === id)?.name ?? id;
}

const label = (value: string) => value.replaceAll("_", " ");

export function people(gallery: Gallery): string {
  return gallery.seed.people
    .map((person) => {
      const canon = gallery.canon.people.find((item) => item.id === person.id);
      return `<article class="person" id="person-${e(person.id)}">
        <a class="photo" href="${assetUrl(person.portrait)}">${image(gallery, person.portrait, `Portrait of ${person.name}`)}</a>
        <div class="card-body"><h3>${e(person.name)}</h3>
        <p class="role">${e(person.jobTitle)}, ${e(person.employer)}</p>
        <dl><div><dt>Seat</dt><dd>${e(person.role ?? "Outside contact")}</dd></div><div><dt>Age</dt><dd>${canon?.age ?? ""}</dd></div></dl>
        <p class="contact">${e(person.email)}<br>${e(person.phone)}</p>
        <p class="links"><a href="${assetUrl(person.avatar)}">Avatar</a></p></div>
      </article>`;
    })
    .join("");
}

export function equipment(gallery: Gallery): string {
  return gallery.seed.equipment
    .map(
      (item) => `<article class="item">
        <a class="photo" href="${assetUrl(item.photo)}">${image(gallery, item.photo, `${item.make} ${item.model}`)}</a>
        <div class="card-body"><p class="eyebrow">${e(label(item.type))}</p><h3>${e(item.make)} ${e(item.model)}</h3>
        <dl><div><dt>Serial</dt><dd><code>${e(item.serialNumber)}</code></dd></div><div><dt>Purchased</dt><dd>${e(item.purchaseDate)}</dd></div><div><dt>Assigned to</dt><dd>${e(nameOf(gallery, item.assignee))}</dd></div></dl></div>
      </article>`,
    )
    .join("");
}

export function work(gallery: Gallery): string {
  const { audits, issues, projects } = gallery.seed;
  const projectList = projects
    .map(
      (project) =>
        `<li><strong>${e(project.name)}</strong> for ${e(project.client)}. ${e(project.description)} <span class="muted">Crew: ${e(project.members.map((id) => nameOf(gallery, id)).join(", ") || "none yet")}.</span></li>`,
    )
    .join("");
  const auditList = audits
    .map(
      (audit) =>
        `<li><strong>${e(audit.location)}</strong>: ${e(label(audit.status))}, started ${e(audit.startedOn)} by ${e(nameOf(gallery, audit.startedBy))}.</li>`,
    )
    .join("");
  const issueCards = issues
    .map(
      (issue) => `<article class="issue priority-${e(issue.priority)}">
        ${issue.photo ? `<a class="photo" href="${assetUrl(issue.photo)}">${image(gallery, issue.photo, issue.title)}</a>` : ""}
        <div class="card-body"><p class="eyebrow">${e(issue.priority)} · ${e(issue.status)}</p><h3>${e(issue.title)}</h3><p>${e(issue.description)}</p>
        <p class="muted">Raised ${e(issue.raisedOn)} by ${e(nameOf(gallery, issue.createdBy))}; assigned to ${e(nameOf(gallery, issue.assignee))}.</p></div>
      </article>`,
    )
    .join("");
  return `<div class="columns"><div><h3>Projects</h3><ul class="plain">${projectList}</ul></div><div><h3>Audits</h3><ul class="plain">${auditList}</ul></div></div><div class="grid">${issueCards}</div>`;
}

export function finance(gallery: Gallery): string {
  const { accounts, categories, transactions } = gallery.seed.finance;
  const category = (id: string) =>
    categories.find((item) => item.id === id)?.name ?? id;
  const account = (id: string) =>
    accounts.find((item) => item.id === id)?.name ?? id;
  const rows = transactions
    .map(
      (txn) =>
        `<tr><td>${e(txn.date)}</td><td>${e(txn.merchantName)}<span class="descriptor">${e(txn.name)}</span></td><td>${e(category(txn.category))}</td><td>${e(account(txn.account))}</td><td class="amount">${money(txn.amount)}</td></tr>`,
    )
    .join("");
  const totals = gallery.canon.categoryTotals
    .map(
      (item) =>
        `<li><span>${e(item.category)}</span><span>${money(item.total)}</span></li>`,
    )
    .join("");
  const balances = accounts
    .map(
      (item) =>
        `<li><span>${e(item.name)} ··${e(item.mask)}<span class="descriptor">${e(item.institution)}</span></span><span>${money(item.currentBalance)}</span></li>`,
    )
    .join("");
  return `<div class="columns"><div><h3>Accounts</h3><ul class="ledger">${balances}</ul></div><div><h3>Spending by category</h3><ul class="ledger">${totals}</ul></div></div>
    <div class="table-wrap"><table><thead><tr><th>Date</th><th>Payee</th><th>Category</th><th>Account</th><th class="amount">Amount</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

export function records(gallery: Gallery): string {
  const { contracts, library, requirements } = gallery.seed;
  const contractList = contracts
    .map(
      (contract) =>
        `<li><a href="${assetUrl(contract.document.file)}">${e(contract.title)}</a> <span class="muted">${e(contract.status)} · ${money(contract.value)} · ${e(contract.signers.map((signer) => `${signer.name} (${signer.status})`).join(", "))}</span></li>`,
    )
    .join("");
  const documentList = library.documents
    .map(
      (item) =>
        `<li><a href="${assetUrl(item.file)}">${e(item.title)}</a> <span class="muted">${e(library.folders.find((folder) => folder.id === item.folder)?.name ?? "")} · ${item.pageCount} page${item.pageCount === 1 ? "" : "s"} · ${fileSize(item.size)}</span></li>`,
    )
    .join("");
  const requirementList = requirements
    .map(
      (item) =>
        `<li><strong>${e(item.title)}</strong> for ${e(nameOf(gallery, item.person))} <span class="muted">${e(label(item.status))} · due ${e(item.dueOn)}</span></li>`,
    )
    .join("");
  return `<div class="columns three"><div><h3>Contracts</h3><ul class="plain">${contractList}</ul></div><div><h3>Library</h3><ul class="plain">${documentList}</ul></div><div><h3>Employee requests</h3><ul class="plain">${requirementList}</ul></div></div>`;
}

export function downloads(gallery: Gallery): string {
  return gallery.assets
    .map(
      (asset) =>
        `<li><a href="${assetUrl(asset.path)}" download><span>${e(asset.path)}</span><span class="file-size">${fileSize(asset.bytes)}</span></a></li>`,
    )
    .join("");
}
