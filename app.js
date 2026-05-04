let chaptersData = [];
let currentIndex = 0;

// =========================
// BOOT
// =========================
document.addEventListener("DOMContentLoaded", () => {

  const cover = document.getElementById("cover");
  const app = document.getElementById("app");

  if (!cover || !app) {
    document.body.innerHTML = "❌ Missing #cover or #app";
    return;
  }

  setTimeout(() => {
    cover.style.display = "none";
    app.style.display = "block";
    loadBook();
  }, 10000);

});

// =========================
// LOAD JSON (YOUR STRUCTURE FIXED)
// =========================
async function loadBook() {
  const content = document.getElementById("content");

  try {
    const res = await fetch("/Book-of-Enoch/data/chapters.json");

    const data = await res.json();

    if (!data || !Array.isArray(data.chapters)) {
      throw new Error("Invalid JSON: expected { chapters: [] }");
    }

    chaptersData = data.chapters;

    initUI();
    renderChapter(0);

  } catch (err) {
    console.error(err);
    content.innerHTML = "❌ Failed to load book: " + err.message;
  }
}

// =========================
// UI INIT (RESTORED HISTORY + CHAPTERS)
// =========================
function initUI() {
  const tabs = document.getElementById("tabs");
  const app = document.getElementById("app");

  tabs.innerHTML = "";

  // HISTORY TAB
  const historyTab = document.createElement("div");
  historyTab.className = "tab";
  historyTab.innerText = "History";
  historyTab.onclick = showHistory;
  tabs.appendChild(historyTab);

  // CHAPTER TABS
  chaptersData.forEach((ch, index) => {
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.innerText = `Chapter ${ch.n}`;
    tab.onclick = () => renderChapter(index);
    tabs.appendChild(tab);
  });

  // NAV (once only)
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
// CHAPTER RENDER
// =========================
function renderChapter(index) {
  currentIndex = index;

  const content = document.getElementById("content");
  const chapter = chaptersData[index];

  content.innerHTML = "";

  highlightTab(index + 1); // +1 because history tab is 0

  const title = document.createElement("h2");
  title.innerText = chapter.title;
  title.style.textAlign = "center";
  content.appendChild(title);

  (chapter.verses || []).forEach(v => {
    const div = document.createElement("div");
    div.className = "verse";

    const match = v.match(/^(\d+)\.(.*)/);

    if (match) {
      div.innerHTML = `
        <span class="verse-number">${match[1]}.</span>
        <span>${match[2]}</span>
      `;
    } else {
      div.innerText = v;
    }

    content.appendChild(div);
  });
}

// =========================
// HISTORY PAGE (RESTORED)
// =========================
function showHistory() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <h2 style="text-align:center;">History of the Book of Enoch</h2>

    <p>
      The Book of Enoch is an ancient Jewish text attributed to Enoch,
      great-grandfather of Noah. It describes fallen angels, divine judgment,
      and prophetic visions.
    </p>

    <p>
      It is considered canonical in Ethiopian Orthodox tradition but not in most other biblical canons.
    </p>
  `;
}

// =========================
// TAB HIGHLIGHT
// =========================
function highlightTab(index) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((t, i) => t.classList.toggle("active", i === index));
}

// =========================
// NAV
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
