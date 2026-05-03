// =========================
// GLOBAL STATE
// =========================
let chaptersData = [];
let currentIndex = 0;

// =========================
// BOOT (SAFE FOR GITHUB PAGES)
// =========================
document.addEventListener("DOMContentLoaded", () => {

  const cover = document.getElementById("cover");
  const app = document.getElementById("app");

  if (!cover || !app) {
    document.body.innerHTML =
      "❌ Missing #cover or #app in HTML";
    return;
  }

  setTimeout(() => {
    cover.style.display = "none";
    app.style.display = "block";
    loadBook();
  }, 10000);

});

// =========================
// LOAD BOOK (FIXED FOR YOUR JSON STRUCTURE)
// =========================
async function loadBook() {
  const content = document.getElementById("content");

  try {
    const res = await fetch("/Book-of-Enoch/data/chapters.json");

    if (!res.ok) {
      throw new Error("chapters.json not found");
    }

    const data = await res.json();

    // ✅ FIX: your structure uses data.chapters
    if (!data.chapters || !Array.isArray(data.chapters)) {
      throw new Error("chapters.json must contain 'chapters' array");
    }

    chaptersData = data.chapters;

    initUI();
    renderChapter(0);

  } catch (err) {
    console.error(err);

    content.innerHTML = `
      <div style="color:red;padding:10px;">
        ❌ Failed to load book<br><br>
        ${err.message}
      </div>
    `;
  }
}

// =========================
// INIT UI
// =========================
function initUI() {
  const tabs = document.getElementById("tabs");
  const app = document.getElementById("app");

  tabs.innerHTML = "";

  chaptersData.forEach((ch, index) => {

    const tab = document.createElement("div");
    tab.className = "tab";
    tab.innerText = `Chapter ${ch.n}`;

    tab.onclick = () => renderChapter(index);

    tabs.appendChild(tab);
  });

  if (!document.querySelector(".navbar")) {
    const nav = document.createElement("div");
    nav.className = "navbar";

    nav.innerHTML = `
      <button class="nav-btn" onclick="prevChapter()">⬅ Previous</button>
      <button class="nav-btn" onclick="nextChapter()">Next ➡</button>
    `;

    app.appendChild(nav);
  }
}

// =========================
// RENDER CHAPTER (HANDLES verses[])
// =========================
function renderChapter(index) {
  currentIndex = index;

  const chapter = chaptersData[index];
  const content = document.getElementById("content");

  if (!chapter) return;

  content.innerHTML = "";

  highlightTab(index);

  // Title
  const title = document.createElement("h2");
  title.innerText = chapter.title;
  title.style.textAlign = "center";
  content.appendChild(title);

  // ✅ FIX: iterate verses array
  (chapter.verses || []).forEach(v => {

    const div = document.createElement("div");
    div.className = "verse";

    const match = v.match(/^(\d+)\.(.*)/);

    if (match) {
      div.innerHTML = `
        <span class="verse-number">${match[1]}.</span>
        <span>${match[2].trim()}</span>
      `;
    } else {
      div.innerText = v;
    }

    content.appendChild(div);
  });

  localStorage.setItem("lastChapter", index);
}

// =========================
// TAB HIGHLIGHT
// =========================
function highlightTab(index) {
  document.querySelectorAll(".tab").forEach((tab, i) => {
    tab.classList.toggle("active", i === index);
  });
}

// =========================
// NAVIGATION
// =========================
function nextChapter() {
  if (currentIndex < chaptersData.length - 1) {
    renderChapter(currentIndex + 1);
  }
}

function prevChapter() {
  if (currentIndex > 0) {
    renderChapter(currentIndex - 1);
  }
}
