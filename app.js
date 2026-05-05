let chaptersData = [];
let currentIndex = 0;

/* =========================
   ENSURE DOM IS READY
========================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");
});

/* =========================
   COVER FLOW (BUTTON ONLY)
========================= */
function enterBook() {
  const cover = document.getElementById("cover");
  const app = document.getElementById("app");

  if (cover) cover.style.display = "none";
  if (app) app.style.display = "block";

  loadBook();
}

/* =========================
   LOAD DATA (GITHUB SAFE)
========================= */
async function loadBook() {
  const content = document.getElementById("content");

  try {
    const res = await fetch("/Book-of-Enoch/data/chapters.json");

    if (!res.ok) {
      throw new Error("Failed to fetch JSON");
    }

    const data = await res.json();

    if (!data || !Array.isArray(data.chapters)) {
      throw new Error("Invalid JSON structure");
    }

    chaptersData = data.chapters;

    initUI();
    showHistory();

  } catch (err) {
    console.error(err);

    if (content) {
      content.innerHTML = "❌ Failed to load book: " + err.message;
    } else {
      console.error("Missing #content element in HTML");
    }
  }
}

/* =========================
   UI INIT
========================= */
function initUI() {
  const tabs = document.getElementById("tabs");
  if (!tabs) return;

  tabs.innerHTML = "";

  /* HISTORY TAB */
  const historyTab = document.createElement("div");
  historyTab.className = "tab";
  historyTab.innerText = "History";
  historyTab.onclick = showHistory;
  tabs.appendChild(historyTab);

  /* CHAPTER TABS */
  chaptersData.forEach((ch, index) => {
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.innerText = `Chapter ${ch.n}`;
    tab.onclick = () => renderChapter(index);
    tabs.appendChild(tab);
  });

  /* NAV */
  if (!document.querySelector(".navbar")) {
    const nav = document.createElement("div");
    nav.className = "navbar";

    nav.innerHTML = `
      <button class="nav-btn" onclick="prevChapter()">⬅ Previous</button>
      <button class="nav-btn" onclick="nextChapter()">Next ➡</button>
    `;

    const app = document.getElementById("app");
    if (app) app.appendChild(nav);
  }
}

/* =========================
   SEARCH LOGIC
========================= */
function executeSearch() {
  const queryEl = document.getElementById("searchInput");
  const resultsDiv = document.getElementById("searchResults");
  const contentDiv = document.getElementById("content");

  if (!queryEl || !resultsDiv || !contentDiv) return;

  const query = queryEl.value.toLowerCase().trim();

  if (!query) {
    resultsDiv.style.display = "none";
    contentDiv.style.display = "block";
    return;
  }

  let matches = [];

  chaptersData.forEach((chapter, index) => {
    if (chapter.title.toLowerCase().includes(query)) {
      matches.push(`
        <div style="margin-bottom:15px; padding:10px; background:rgba(176,138,91,0.1); border-radius:5px; cursor:pointer;" onclick="renderChapter(${index})">
          <strong style="color:#8b5e34;">અધ્યાય ${chapter.n}: ${chapter.title}</strong>
          <p style="font-size:0.9em; margin:2px 0;">(Title match)</p>
        </div>
      `);
    }

    chapter.verses.forEach(verse => {
      if (verse.toLowerCase().includes(query)) {
        matches.push(`
          <div style="margin-bottom:15px; padding:10px; border-bottom:1px solid #ddd; cursor:pointer;" onclick="renderChapter(${index})">
            <strong style="color:#8b5e34;">અધ્યાય ${chapter.n} Reference:</strong>
            <p style="font-size:0.95em; margin:5px 0;">"...${verse}..."</p>
          </div>
        `);
      }
    });
  });

  contentDiv.style.display = "none";
  resultsDiv.style.display = "block";
  highlightTab(-1);

  if (matches.length > 0) {
    resultsDiv.innerHTML = `<h3 style="text-align:center;">"${query}" માટેના પરિણામો</h3>` + matches.join("");
  } else {
    resultsDiv.innerHTML = `<h3 style="text-align:center;">"${query}"</h3><p style="text-align:center;">કોઈ સંદર્ભ મળ્યો નથી.</p>`;
  }

  window.scrollTo(0, 0);
}

/* =========================
   RENDER CHAPTER
========================= */
function renderChapter(index) {
  const content = document.getElementById("content");
  const resultsDiv = document.getElementById("searchResults");

  if (!content || !resultsDiv) return;

  currentIndex = index;
  const chapter = chaptersData[index];

  resultsDiv.style.display = "none";
  content.style.display = "block";
  content.innerHTML = "";

  highlightTab(index + 1);

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

  window.scrollTo(0, 0);
}

/* =========================
   HISTORY PAGE
========================= */
function showHistory() {
  const content = document.getElementById("content");
  const resultsDiv = document.getElementById("searchResults");

  if (!content || !resultsDiv) return;

  resultsDiv.style.display = "none";
  content.style.display = "block";
  highlightTab(0);

  content.innerHTML = `<h2 style="text-align:center;">હનોખના પુસ્તકનો ઇતિહાસ</h2>`;

  window.scrollTo(0, 0);
}

/* =========================
   NAVIGATION
========================= */
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

/* =========================
   TAB HIGHLIGHT
========================= */
function highlightTab(index) {
  document.querySelectorAll(".tab").forEach((t, i) => {
    t.classList.toggle("active", i === index);
  });
}