/* ============================================================
   Book of Enoch — app.js
   Renders verse content as innerHTML so bold, color, italic
   saved from the editor display correctly in the book.
============================================================ */

let chaptersData   = [];
let historyContent = "";
let currentIndex   = -1;   // -1 = History page

const GU_DIGITS = '૦૧૨૩૪૫૬૭૮૯';

/* ─── COVER ─────────────────────────────────────────────── */
function enterBook() {
  document.getElementById("cover").style.display = "none";
  document.getElementById("app").style.display   = "block";
  loadBook();
}

/* ─── LOAD DATA ─────────────────────────────────────────── */
async function loadBook() {
  try {
    const base = document.querySelector("base")?.href || "";

    const [chRes, hiRes] = await Promise.all([
      fetch(base + "data/chapters.json"),
      fetch(base + "data/history.json")
    ]);

    if (!chRes.ok) throw new Error(`chapters.json: HTTP ${chRes.status}`);
    if (!hiRes.ok) throw new Error(`history.json: HTTP ${hiRes.status}`);

    const chData = await chRes.json();
    const hiData = await hiRes.json();

    if (!Array.isArray(chData.chapters)) throw new Error("Invalid chapters.json");

    chaptersData   = chData.chapters;
    historyContent = hiData.content || "";

    buildUI();
    restoreBookmark();

  } catch (err) {
    document.getElementById("content").innerHTML =
      `<p style="color:red;">❌ Failed to load: ${err.message}</p>`;
  }
}

/* ─── BUILD UI ───────────────────────────────────────────── */
function buildUI() {
  const select = document.getElementById("chapterSelect");
  select.innerHTML = "";

  const histOpt = document.createElement("option");
  histOpt.value = -1;
  histOpt.textContent = "📜 History";
  select.appendChild(histOpt);

  chaptersData.forEach((ch, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Chapter ${ch.n} – ${ch.title}`;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    const v = parseInt(select.value);
    v === -1 ? showHistory() : renderChapter(v);
  });

  updateProgressLabel();
}

/* ─── HISTORY PAGE ───────────────────────────────────────── */
function showHistory() {
  currentIndex = -1;
  saveBookmark();
  updateDropdown();
  updateProgressLabel();
  updateNavButtons();

  document.getElementById("content").innerHTML = `
    <h2 style="text-align:center; font-family:Georgia,serif; color:#5c3a1e; margin-bottom:20px;">
      હનોખના પુસ્તકનો ઇતિહાસ
    </h2>
    <div style="line-height:1.85; color:#2c2c2c; padding:10px;">
      ${historyContent}
    </div>
  `;
}

/* ─── RENDER CHAPTER ─────────────────────────────────────── */
function renderChapter(index) {
  currentIndex = index;
  saveBookmark();
  updateDropdown();
  updateProgressLabel();
  updateNavButtons();

  const chapter = chaptersData[index];
  const content = document.getElementById("content");
  content.innerHTML = "";

  window.scrollTo({ top: 0, behavior: "smooth" });

  const title = document.createElement("h2");
  title.innerText = chapter.title;
  title.style.textAlign = "center";
  content.appendChild(title);

  (chapter.verses || []).forEach(v => {
    const div = document.createElement("div");
    div.className = "verse";

    // Split off the leading Gujarati or ASCII numeral prefix (e.g. "૧. ")
    // The rest may be plain text OR HTML (with bold, color, etc.)
    const match = v.match(/^([0-9૦-૯]+)\.\s*([\s\S]*)/);

    if (match) {
      const numPart  = match[1];
      const bodyPart = match[2];

      const numSpan  = document.createElement("span");
      numSpan.className = "verse-number";
      numSpan.textContent = numPart + ".";

      const bodySpan = document.createElement("span");
      // Use innerHTML so that bold, color, italic tags render properly
      bodySpan.innerHTML = bodyPart;

      div.appendChild(numSpan);
      div.appendChild(document.createTextNode(" "));
      div.appendChild(bodySpan);
    } else {
      // No numeral prefix — render as HTML anyway in case it's formatted
      div.innerHTML = v;
    }

    content.appendChild(div);
  });
}

/* ─── NAVIGATION ─────────────────────────────────────────── */
function nextChapter() {
  if (currentIndex === -1) {
    renderChapter(0);
  } else if (currentIndex < chaptersData.length - 1) {
    renderChapter(currentIndex + 1);
  }
}

function prevChapter() {
  if (currentIndex === 0) {
    showHistory();
  } else if (currentIndex > 0) {
    renderChapter(currentIndex - 1);
  }
}

function updateNavButtons() {
  const prev = document.getElementById("prevBtn");
  const next = document.getElementById("nextBtn");
  if (prev) prev.disabled = (currentIndex === -1);
  if (next) next.disabled = (currentIndex === chaptersData.length - 1);
}

/* ─── DROPDOWN SYNC ──────────────────────────────────────── */
function updateDropdown() {
  const select = document.getElementById("chapterSelect");
  if (select) select.value = currentIndex;
}

/* ─── PROGRESS LABEL ─────────────────────────────────────── */
function updateProgressLabel() {
  const label = document.getElementById("progressLabel");
  if (!label) return;
  if (currentIndex === -1) {
    label.textContent = "📜 History";
  } else {
    label.textContent =
      `Chapter ${chaptersData[currentIndex]?.n} of ${chaptersData.length}`;
  }
}

/* ─── BOOKMARK (localStorage) ────────────────────────────── */
function saveBookmark() {
  try { localStorage.setItem("enoch_bookmark", currentIndex.toString()); } catch (_) {}
}

function restoreBookmark() {
  try {
    const saved = localStorage.getItem("enoch_bookmark");
    const idx   = saved !== null ? parseInt(saved) : -1;
    if (idx >= 0 && idx < chaptersData.length) {
      renderChapter(idx);
    } else {
      showHistory();
    }
  } catch (_) {
    showHistory();
  }
}
