let chaptersData = [];
let currentIndex = 0;

/* =========================
   COVER FLOW (BUTTON ONLY)
========================= */
function enterBook() {
  document.getElementById("cover").style.display = "none";
  document.getElementById("app").style.display = "block";
  loadBook();
}

/* =========================
   LOAD DATA (GITHUB SAFE)
========================= */
async function loadBook() {
  const content = document.getElementById("content");

  try {
    const res = await fetch("/Book-of-Enoch/data/chapters.json");
    const data = await res.json();

    if (!data || !Array.isArray(data.chapters)) {
      throw new Error("Invalid JSON structure");
    }

    chaptersData = data.chapters;

    initUI();
    renderChapter(0);

  } catch (err) {
    console.error(err);
    content.innerHTML = "❌ Failed to load book: " + err.message;
  }
}

/* =========================
   UI INIT
========================= */
function initUI() {
  const tabs = document.getElementById("tabs");
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

    document.getElementById("app").appendChild(nav);
  }
}

/* =========================
   RENDER CHAPTER
========================= */
function renderChapter(index) {
  currentIndex = index;

  const content = document.getElementById("content");
  const chapter = chaptersData[index];

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
}

/* =========================
   HISTORY PAGE
========================= */
function showHistory() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <h2 style="text-align:center;">History of the Book of Enoch</h2>

    <p>
      The Book of Enoch is an ancient Jewish text attributed to Enoch,
      describing visions, fallen angels, and divine judgment.
    </p>

    <p>
      It is part of Ethiopian Orthodox canon but not in most modern Bibles.
    </p>
  `;
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
