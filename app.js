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

/* ─── SANITIZE HISTORY HTML ──────────────────────────────── */
// Handles both clean editor HTML and Microsoft Word HTML.
// Word wraps every individual word in its own <span> with
// font-family and mso-* styles — this collapses those spans
// into plain text and strips all layout-breaking styles.

function sanitizeHistoryHTML(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;

  // ── Step 1: Remove Word-specific tags entirely ──────────
  // <o:p> tags are Word-only and contain only &nbsp; noise
  tmp.querySelectorAll("o\\:p, [class*='Mso']").forEach(function(el) {
    // If it only contains whitespace / &nbsp;, remove it fully
    if (el.textContent.trim() === "" || el.textContent === "\u00a0") {
      el.remove();
    }
  });

  // ── Step 2: Collapse pure font-family spans ─────────────
  // Word wraps every word in <span style="font-family:Nirmala UI,sans-serif">
  // These spans carry no meaningful formatting — unwrap them.
  tmp.querySelectorAll("span").forEach(function(span) {
    const s = span.style;
    // A "Word word-span" has only font-family set and nothing else useful
    const hasOnlyFont = s.fontFamily &&
      !s.color &&
      !s.backgroundColor &&
      !s.fontWeight &&
      !s.fontStyle &&
      !s.fontSize &&
      !s.textDecoration;

    if (hasOnlyFont) {
      // Replace the span with its children (unwrap)
      while (span.firstChild) {
        span.parentNode.insertBefore(span.firstChild, span);
      }
      span.remove();
    }
  });

  // ── Step 3: Strip layout-breaking styles from all elements
  const SAFE_INLINE_PROPS = new Set([
    "color", "backgroundColor", "fontWeight", "fontStyle",
    "fontSize", "textDecoration", "textDecorationLine", "textAlign"
  ]);

  const BLOCK_TAGS = new Set([
    "DIV","P","H1","H2","H3","H4","H5","H6",
    "LI","UL","OL","BLOCKQUOTE","TD","TH","TR","THEAD","TBODY"
  ]);

  tmp.querySelectorAll("*").forEach(function(el) {
    const tag = el.tagName;

    if (tag === "TABLE") {
      el.removeAttribute("style");
      el.removeAttribute("width");
      el.removeAttribute("border");
      el.removeAttribute("cellspacing");
      el.removeAttribute("cellpadding");
      el.style.display        = "block";
      el.style.width          = "100%";
      el.style.maxWidth       = "100%";
      el.style.overflowX      = "auto";
      el.style.borderCollapse = "collapse";
      el.style.boxSizing      = "border-box";
      return;
    }

    if (tag === "TD" || tag === "TH") {
      const align = el.style.textAlign;
      el.removeAttribute("style");
      el.removeAttribute("width");
      el.removeAttribute("height");
      el.style.padding    = "8px 10px";
      el.style.border     = "1px solid #c2a97a";
      el.style.whiteSpace = "normal";
      el.style.overflowWrap = "break-word";
      el.style.wordBreak  = "normal";
      if (align) el.style.textAlign = align;
      return;
    }

    if (BLOCK_TAGS.has(tag)) {
      const align = el.style.textAlign;
      el.removeAttribute("style");
      el.removeAttribute("width");
      // Remove all Word class attributes
      el.removeAttribute("class");
      if (align) el.style.textAlign = align;
      el.style.maxWidth    = "100%";
      el.style.boxSizing   = "border-box";
      el.style.whiteSpace  = "normal";
      el.style.overflowWrap = "break-word";
      el.style.wordBreak   = "normal";
      return;
    }

    // Inline elements: keep only safe formatting props
    if (el.style && el.style.length > 0) {
      const saved = {};
      SAFE_INLINE_PROPS.forEach(function(prop) {
        if (el.style[prop]) saved[prop] = el.style[prop];
      });
      el.removeAttribute("style");
      el.removeAttribute("class");
      Object.keys(saved).forEach(function(prop) {
        el.style[prop] = saved[prop];
      });
    } else {
      el.removeAttribute("class");
    }

    el.removeAttribute("width");
    el.removeAttribute("height");
  });

  // ── Step 4: Remove empty paragraphs left by Word ─────────
  // Word inserts many <p>&nbsp;</p> spacer paragraphs
  tmp.querySelectorAll("p").forEach(function(p) {
    if (p.textContent.trim() === "" || p.textContent === "\u00a0") {
      p.remove();
    }
  });

  return tmp.innerHTML;
}

/* ─── HISTORY PAGE ───────────────────────────────────────── */
function showHistory() {
  currentIndex = -1;
  saveBookmark();
  updateDropdown();
  updateProgressLabel();
  updateNavButtons();

  const content  = document.getElementById("content");
  const safeHTML = sanitizeHistoryHTML(historyContent);

  content.innerHTML = `
    <h2 style="text-align:center; font-family:Georgia,serif; color:#5c3a1e; margin-bottom:20px;">
      હનોખના પુસ્તકનો ઇતિહાસ
    </h2>
    <div class="history-body">
      ${safeHTML}
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

    const match = v.match(/^([\d\u0AE6-\u0AEF]+)\.\s*([\s\S]*)/);

    if (match) {
      const numSpan = document.createElement("span");
      numSpan.className = "verse-number";
      numSpan.textContent = match[1] + ".";

      const bodySpan = document.createElement("span");
      bodySpan.innerHTML = match[2];

      div.appendChild(numSpan);
      div.appendChild(document.createTextNode(" "));
      div.appendChild(bodySpan);
    } else {
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
