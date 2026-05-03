// =========================
// GLOBAL STATE
// =========================
let chaptersData = [];
let currentIndex = 0;

// =========================
// COVER PAGE FLOW (10s)
// =========================
window.onload = () => {
  setTimeout(() => {
    document.getElementById("cover").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadBook();
  }, 10000);
};

// =========================
// LOAD CHAPTER DATA
// =========================
async function loadBook() {
  try {
    const res = await fetch("./data/chapters.json");

    if (!res.ok) {
      throw new Error("chapters.json missing or failed to load");
    }

    chaptersData = await res.json();

    initUI();
    renderChapter(0);

  } catch (err) {
    console.error(err);
    document.getElementById("content").innerText =
      "❌ Load Error: chapters.json missing or invalid";
  }
}

// =========================
// INIT UI (TABS + NAV)
// =========================
function initUI() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = "";

  // Create chapter tabs
  chaptersData.forEach((ch, index) => {
    const tab = document.createElement("div");
    tab.className = "tab";
    tab.innerText = `Chapter ${ch.chapter}`;

    tab.onclick = () => {
      renderChapter(index);
    };

    tabs.appendChild(tab);
  });

  // Add navigation bar once
  const nav = document.createElement("div");
  nav.className = "navbar";

  nav.innerHTML = `
    <button class="nav-btn" onclick="prevChapter()">⬅ Previous</button>
    <button class="nav-btn" onclick="nextChapter()">Next ➡</button>
  `;

  document.getElementById("app").appendChild(nav);
}

// =========================
// RENDER CHAPTER CONTENT
// =========================
function renderChapter(index) {
  currentIndex = index;

  const chapter = chaptersData[index];
  const content = document.getElementById("content");

  content.innerHTML = "";

  // Highlight active tab
  highlightTab(index);

  // Title
  const title = document.createElement("h2");
  title.innerText = chapter.title;
  title.style.textAlign = "center";
  title.style.marginBottom = "15px";

  content.appendChild(title);

  // Verse parsing (clean + readable)
  const verses = chapter.text.split("\n\n");

  verses.forEach(v => {
    const div = document.createElement("div");
    div.className = "verse";

    // Extract verse number if exists
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

  // Save last position (optional future use)
  localStorage.setItem("lastChapter", index);
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
// NAVIGATION FUNCTIONS
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
