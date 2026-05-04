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
    const res = await fetch("data/chapters.json");
    const data = await res.json();

    if (!data || !Array.isArray(data.chapters)) {
      throw new Error("Invalid JSON structure");
    }

    chaptersData = data.chapters;

    initUI();
    
    // Default to History
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
  
  highlightTab(0);

  content.innerHTML = `
    <h2 style="text-align:center;">હનોખના પુસ્તકનો ઇતિહાસ</h2>

    <div style="line-height:1.8; color: #2c2c2c; padding: 10px;">
      <p>હાનોખનું પુસ્તક (ખાસ કરીને ૧ હાનોખ) એક અત્યંત ગહન વિષય છે. આ પવિત્ર પુસ્તકને ક્યારેય બાઈબલમાંથી સત્તાવાર રીતે "દૂર" કરવામાં આવ્યું નહોતું, પરંતુ જ્યારે વિશ્વાસીઓના અગ્રેસરોએ પવિત્ર શાસ્ત્રના પુસ્તકોની અંતિમ યાદી તૈયાર કરી, ત્યારે મોટાભાગના આગેવાનોએ તેનો સમાવેશ કર્યો નહીં.</p>
      
      <h3>૧. શું તે અગાઉ પવિત્ર શાસ્ત્રનો ભાગ હતું?</h3>
      <p>ખ્રિસ્તી મંડળીના પ્રારંભિક સમયમાં, આજે આપણે જોઈએ છીએ તેવું કોઈ એક સંગઠિત "બાઈબલ" નહોતું. મંડળીના પિતૃઓ, જેમ કે તર્તુલિયન, આ પુસ્તકને ઈશ્વરપ્રેરિત માનતા હતા.</p>

      <h3>૨. કોણે અને ક્યારે આ નિર્ણય લીધો?</h3>
      <p>ચોથી સદીમાં (મુખ્યત્વે લાઓદિકિયા અને કાર્થેજની ધર્મસભાઓમાં), મંડળીના આગેવાનોએ ભેગા મળીને જે પુસ્તકોને પવિત્ર આત્માની પ્રેરણાથી લખાયેલા માન્યા, તેની સત્તાવાર યાદી તૈયાર કરી.</p>

      <h3>૩. તેને કેમ બાકાત રાખવામાં આવ્યું?</h3>
      <p>મુખ્ય કારણોમાં લેખકત્વની વિશ્વસનીયતા અને દૂતો તથા નેફિલિમનું વિગતવાર વર્ણન હતું, જે અન્ય શાસ્ત્રવચનો સાથે કેટલાકને અસંગત લાગ્યું હતું.</p>

      <h3>૪. ઇથોપિયાના બાઈબલમાં તે કેમ સચવાયેલું છે?</h3>
      <p>ઇથોપિયન ઓર્થોડોક્સ મંડળીએ તેને પવિત્ર અને આત્મિક રીતે મૂલ્યવાન ગણીને સાચવી રાખ્યું છે.</p>

      <br>
      <h3 style="border-bottom: 2px solid #5d4037; padding-bottom: 5px;">પવિત્ર શાસ્ત્રની વિવિધ પરંપરાઓનો તફાવત</h3>
      
      <table style="width:100%; border-collapse: collapse; margin-top: 15px; font-size: 0.9em;">
        <thead>
          <tr style="background-color: #d7ccc8; text-align: left;">
            <th style="padding: 10px; border: 1px solid #bcaaa4;">ખ્રિસ્તી પરંપરા</th>
            <th style="padding: 10px; border: 1px solid #bcaaa4;">સમાવેશ?</th>
            <th style="padding: 10px; border: 1px solid #bcaaa4;">કારણ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border: 1px solid #d7ccc8;"><b>પ્રોટેસ્ટન્ટ</b></td>
            <td style="padding: 10px; border: 1px solid #d7ccc8;">ના</td>
            <td style="padding: 10px; border: 1px solid #d7ccc8;">તેઓ યહૂદીઓ દ્વારા સ્વીકૃત જૂના કરારના પુસ્તકોને જ પ્રમાણિત માને છે.</td>
          </tr>
          <tr style="background-color: #f9f5f0;">
            <td style="padding: 10px; border: 1px solid #d7ccc8;"><b>કેથોલિક ઓર્થોડોક્સ</b></td>
            <td style="padding: 10px; border: 1px solid #d7ccc8;">ના</td>
            <td style="padding: 10px; border: 1px solid #d7ccc8;">ચોથી સદીની ધર્મસભાઓએ તેને સત્તાવાર યાદીમાં સ્થાન આપ્યું નથી.</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #d7ccc8;"><b>ઇથોપિયન ઓર્થોડોક્સ</b></td>
            <td style="padding: 10px; border: 1px solid #d7ccc8;">હા</td>
            <td style="padding: 10px; border: 1px solid #d7ccc8;">તેઓની અતિ પ્રાચીન પરંપરા મુજબ તેને હજુ પણ ઈશ્વરપ્રેરિત માને છે.</td>
          </tr>
        </tbody>
      </table>
    </div>
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
