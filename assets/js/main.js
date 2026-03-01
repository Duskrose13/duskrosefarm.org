// Dusk Rose Farm - simple data-driven sections
// - /assets/data/animals.json controls "Our Animals"
// - /assets/data/available.json controls "Available Animals"
// - /assets/data/contact.json controls contact info/links

const $ = (sel, root=document) => root.querySelector(sel);

function setYear(){
  const el = $("#year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function setupNav(){
  const btn = $("#navBtn");
  const nav = $("#nav");
  if (!btn || !nav) return;

  const close = () => {
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  // close on click
  nav.addEventListener("click", (e) => {
    if (e.target && e.target.matches("a")) close();
  });

  // close on escape
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

async function loadJSON(path){
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return await res.json();
}

function renderAnimals(data){
  const grid = $("#animalsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  (data.categories || []).forEach(cat => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${escapeHTML(cat.title || "")}</h3>
      <div class="pills">
        ${(cat.items || []).map(i => `<span class="pill">${escapeHTML(i)}</span>`).join("")}
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderAvailability(data){
  const note = $("#availabilityNote");
  const list = $("#availableList");
  if (!note || !list) return;

  note.querySelector(".notice__title").textContent =
    `Updated: ${data.updated || "unknown"} • ${data.note || ""}`.trim();

  list.innerHTML = "";

  const items = data.items || [];
  if (!items.length){
    list.innerHTML = `<div class="item"><p class="muted" style="margin:0">Nothing listed right now — check back soon.</p></div>`;
    return;
  }

  items.forEach(it => {
    const status = (it.status || "Ask").toLowerCase();
    const tagClass =
      status.includes("avail") ? "tag--available"
      : status.includes("wait") ? "tag--waitlist"
      : "tag--ask";

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="item__top">
        <div>
          <p class="item__name">${escapeHTML(it.name || "")}</p>
          <div class="item__type">${escapeHTML(it.type || "")}</div>
        </div>
        <span class="tag ${tagClass}">${escapeHTML(it.status || "Ask")}</span>
      </div>
      <p class="item__details">${escapeHTML(it.details || "")}</p>
    `;
    list.appendChild(el);
  });
}

function renderContact(data){
  // Buttons / links
  const fb = $("#fbLink");
  if (fb && data.facebook) fb.href = data.facebook;

  const ig = $("#igLink");
  if (ig && data.instagram) ig.href = data.instagram;

  const store = $("#storeLink");
  if (store && data.store) store.href = data.store;

  // Mini rows
  const site = $("#siteUrl");
  if (site && data.website) site.textContent = data.website.replace(/^https?:\/\//, "");

  const email = $("#emailVal");
  if (email && (data.email !== undefined)) email.textContent = data.email ? data.email : "(coming soon)";

  // Card fields
  const city = $("#contactCity");
  if (city && data.city) city.textContent = data.city;

  const addr = $("#contactAddress");
  if (addr && data.address) addr.textContent = data.address;

  const dir = $("#contactDirections");
  if (dir && data.directions) dir.href = data.directions;

  const phone = $("#contactPhone");
  if (phone && data.phone){
    phone.textContent = data.phoneDisplay || data.phone;
    phone.href = `tel:${String(data.phone).replace(/[^\d+]/g, "")}`;
  }

  const hours = $("#contactHours");
  if (hours && data.hours) hours.textContent = data.hours;
}

// tiny escape to keep JSON safe
function escapeHTML(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function init(){
  setYear();
  setupNav();

  try{
    const animals = await loadJSON("/assets/data/animals.json");
    renderAnimals(animals);
  }catch(e){
    console.warn(e);
  }

  try{
    const availability = await loadJSON("/assets/data/available.json");
    renderAvailability(availability);
  }catch(e){
    console.warn(e);
    const note = $("#availabilityNote");
    if (note){
      note.querySelector(".notice__title").textContent = "Availability couldn't load.";
      note.querySelector(".notice__text").textContent =
        "If you are previewing locally, use a local server (or just deploy to GitHub Pages).";
    }
  }

  try{
    const contact = await loadJSON("/assets/data/contact.json");
    renderContact(contact);
  }catch(e){
    console.warn(e);
  }
}

document.addEventListener("DOMContentLoaded", init);