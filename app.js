// =========================
// SAFE GLOBAL STATE
// =========================
let chaptersData = [];
let currentIndex = 0;

// =========================
// SAFE INIT (prevents blank page)
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const cover = document.getElementById("cover");
  const app = document.getElementById("app");

  if (!cover || !app) {
    document.body.innerHTML = "❌ Missing #cover or #app in HTML";
    return;
  }

  // Cover timer
  setTimeout(() => {
    cover.style.display = "none";
    app.style.display = "block";
    loadBook();
  }, 10000);
});

// =========================
// LOAD BOOK DATA (SAFE FETCH)
// =========================
async function loadBook() {
  const content = document.getElementById("content");

  try {
    const res = await fetch("./data/chapters.json");

    if (!res.ok) {
      throw new Error("chapters.json not found");
    }

    chaptersData = await res.json();

    if (!Array.isArray(chaptersData)) {
      throw new Error("chapters.json must be an array");
    }

    initUI();
    renderChapter(0);

  } catch (err) {
    console.error(err);

    if (content) {
      content.innerHTML = `
        <div style="color:red;">
          ❌ Failed to load chapters.json<br><br>
          Make sure you are running a local server:<br>
          <code>python -m http.server</code>
        </div>
      `;
    }
  }
}

// =========================
// INIT UI
// =========================
function initUI() {
  const tabs = document.getElementById("tabs");
  const app = document.getElementById("app");

  if (!tabs || !app) return;

  tabs.innerHTML = "";

  // Create chapter tabs
  chaptersData.forEach((ch, index) => {
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.innerText = `Chapter ${ch.chapter}`;

    tab.onclick = () => renderChapter(index);

    tabs.appendChild(tab);
  });

  // Prevent duplicate navbar
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
// RENDER CHAPTER
// =========================
function renderChapter(index) {
  const content = document.getElementById("content");
  if (!content) return;

  currentIndex = index;

  const chapter = chaptersData[index];
  if (!chapter) return;

  content.innerHTML = "";

  highlightTab(index);

  // Title
  const title = document.createElement("h2");
  title.innerText = chapter.title || "Untitled";
  title.style.textAlign = "center";
  content.appendChild(title);

  // Verses safe parsing
  const text = chapter.text || "";
  const verses = text.split("\n\n");

  verses.forEach(v => {
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
}

// =========================
// TAB HIGHLIGHT
// =========================
function highlightTab(index) {
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach((tab, i) => {
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
