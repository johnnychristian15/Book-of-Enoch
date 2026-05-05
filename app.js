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
    // Start on History page
    showHistory();

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
   SEARCH LOGIC
========================= */
function executeSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const resultsDiv = document.getElementById("searchResults");
  const contentDiv = document.getElementById("content");

  if (!query) {
    resultsDiv.style.display = "none";
    contentDiv.style.display = "block";
    return;
  }

  let matches = [];

  chaptersData.forEach((chapter, index) => {
    // Search in Chapter Title
    if (chapter.title.toLowerCase().includes(query)) {
      matches.push(`
        <div style="margin-bottom:15px; padding:10px; background:rgba(176,138,91,0.1); border-radius:5px; cursor:pointer;" onclick="renderChapter(${index})">
          <strong style="color:#8b5e34;">અધ્યાય ${chapter.n}: ${chapter.title}</strong>
          <p style="font-size:0.9em; margin:2px 0;">(Title match)</p>
        </div>
      `);
    }

    // Search in Individual Verses
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

  // Toggle view from content to search results
  contentDiv.style.display = "none";
  resultsDiv.style.display = "block";
  highlightTab(-1); // Remove tab highlights during search

  if (matches.length > 0) {
    resultsDiv.innerHTML = `<h3 style="text-align:center;">"${query}" માટેના પરિણામો</h3>` + matches.join("");
  } else {
    resultsDiv.innerHTML = `<h3 style="text-align:center;">"${query}"</h3><p style="text-align:center;">કોઈ સંદર્ભ મળ્યો નથી. (No references found.)</p>`;
  }
  window.scrollTo(0, 0);
}

/* =========================
   RENDER CHAPTER
========================= */
function renderChapter(index) {
  currentIndex = index;

  const content = document.getElementById("content");
  const resultsDiv = document.getElementById("searchResults");
  const chapter = chaptersData[index];

  // Reset View and hide search results if open
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
   HISTORY PAGE (CONSOLIDATED)
========================= */
function showHistory() {
  const content = document.getElementById("content");
  const resultsDiv = document.getElementById("searchResults");
  
  resultsDiv.style.display = "none";
  content.style.display = "block";
  highlightTab(0);

  content.innerHTML = `
    <h2 style="text-align:center;">હનોખના પુસ્તકનો ઇતિહાસ</h2>
    <div style="line-height:1.8; color: #2c2c2c; padding: 10px;">
      <p>હાનોખનું પુસ્તક (ખાસ કરીને ૧ હાનોખ) એક અત્યંત ગહન વિષય છે. આ પવિત્ર પુસ્તકને ક્યારેય બાઈબલમાંથી સત્તાવાર રીતે "દૂર" કરવામાં આવ્યું નહોતું, પરંતુ જ્યારે વિશ્વાસીઓના અગ્રેસરોએ પવિત્ર શાસ્ત્રના પુસ્તકોની અંતિમ યાદી તૈયાર કરી, ત્યારે મોટાભાગના આગેવાનોએ તેનો સમાવેશ કર્યો નહીં.</p>
      <p><b>૧. શું તે અગાઉ પવિત્ર શાસ્ત્રનો ભાગ હતું?</b></p>
      <p>ખ્રિસ્તી મંડળીના પ્રારંભિક સમયમાં, આજે આપણે જોઈએ છીએ તેવું કોઈ એક સંગઠિત "બાઈબલ" નહોતું. તે સમયે હાનોખનું પુસ્તક અત્યંત આદરણીય હતું.</p>
      <p>શાસ્ત્રનો પુરાવો: નવા કરારમાં પ્રભુના શિષ્ય યહુદાની પત્રિકા (કલમ ૧૪-૧૫) માં સીધી રીતે હાનોખના પુસ્તકનું પવિત્ર વચન ટાંકવામાં આવ્યું છે.</p>
      <p><b>૨. કોણે અને ક્યારે આ નિર્ણય લીધો?</b></p>
      <p>આ કોઈ એક વ્યક્તિ દ્વારા લેવાયેલો નિર્ણય નહોતો, પરંતુ મંડળીના આગેવાનો દ્વારા લેવાયેલ સામૂહિક નિર્ણય હતો. ચોથી સદીમાં મંડળીના આગેવાનોએ જે પુસ્તકોને પવિત્ર આત્માની પ્રેરણાથી લખાયેલા માન્યા, તેની સત્તાવાર યાદી તૈયાર કરી.</p>
    </div>
  `;
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
