let chaptersData = [];
let historyData = null;
let currentIndex = 0;

/* =========================
   ENSURE DOM IS READY
========================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");
});

/* =========================
   COVER FLOW
========================= */
function enterBook() {
  const cover = document.getElementById("cover");
  const app = document.getElementById("app");

  if (cover) cover.style.display = "none";
  if (app) app.style.display = "block";

  loadBook();
}

/* =========================
   LOAD DATA (BOTH FILES)
========================= */
async function loadBook() {
  const content = document.getElementById("content");

  try {
    const [chaptersRes, historyRes] = await Promise.all([
      fetch("./data/chapters.json"),
      fetch("./data/history.json")
    ]);

    if (!chaptersRes.ok || !historyRes.ok) {
      throw new Error("Failed to fetch JSON files");
    }

    const chaptersJson = await chaptersRes.json();
    const historyJson = await historyRes.json();

    if (!chaptersJson?.chapters || !Array.isArray(chaptersJson.chapters)) {
      throw new Error("Invalid chapters.json structure");
    }

    chaptersData = chaptersJson.chapters;
    historyData = historyJson;

    initUI();
    showHistory();

  } catch (err) {
    console.error(err);

    if (content) {
      content.innerHTML = "❌ Failed to load book: " + err.message;
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
   HISTORY PAGE (NOW DYNAMIC)
========================= */
function showHistory() {
  const content = document.getElementById("content");
  const resultsDiv = document.getElementById("searchResults");

  if (!content || !resultsDiv) return;

  resultsDiv.style.display = "none";
  content.style.display = "block";
  highlightTab(0);

  if (!historyData) {
    content.innerHTML = "<p>History not available.</p>";
    return;
  }

  content.innerHTML = `<h2 style="text-align:center;">${historyData.title}</h2>`;

  (historyData.sections || []).forEach(section => {
    const div = document.createElement("div");

    div.innerHTML = `
      <h3>${section.heading}</h3>
      <p>${section.text}</p>
    `;

    content.appendChild(div);
  });

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