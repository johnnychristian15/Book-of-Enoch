/* ============================================================
   Book of Enoch — app.js
   Features: chapter dropdown, localStorage bookmark, prev/next nav,
   mobile-friendly, history page, no broken tab overflow.
============================================================ */

let chaptersData = [];
let currentIndex = -1;   // -1 = History page

/* ─── COVER ─────────────────────────────────────────────── */
function enterBook() {
  document.getElementById("cover").style.display = "none";
  document.getElementById("app").style.display  = "block";
  loadBook();
}

/* ─── LOAD DATA ─────────────────────────────────────────── */
async function loadBook() {
  try {
    // Works on GitHub Pages and locally (uses relative path)
    const base = document.querySelector("base")?.href || "";
    const res  = await fetch(base + "data/chapters.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.chapters)) throw new Error("Invalid JSON");

    chaptersData = data.chapters;
    buildUI();
    restoreBookmark();   // jump to saved place, or History

  } catch (err) {
    document.getElementById("content").innerHTML =
      `<p style="color:red;">❌ Failed to load: ${err.message}</p>`;
  }
}

/* ─── BUILD UI ───────────────────────────────────────────── */
function buildUI() {
  /* ── Dropdown ── */
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

  /* ── Progress label ── */
  updateProgressLabel();
}

/* ─── HISTORY PAGE ───────────────────────────────────────── */
function showHistory() {
  currentIndex = -1;
  saveBookmark();
  updateDropdown();
  updateProgressLabel();
  updateNavButtons();

  const content = document.getElementById("content");
  content.innerHTML = `
    <h2 class="page-title">હનોખના પુસ્તકનો ઇતિહાસ</h2>
    <div class="history-body">
      <p>હાનોખનું પુસ્તક (ખાસ કરીને ૧ હાનોખ) એક અત્યંત ગહન વિષય છે.
         આ પવિત્ર પુસ્તકને ક્યારેય બાઈબલમાંથી સત્તાવાર રીતે "દૂર" કરવામાં
         આવ્યું નહોતું, પરંતુ જ્યારે વિશ્વાસીઓના અગ્રેસરોએ પવિત્ર શાસ્ત્રના
         પુસ્તકોની અંતિમ યાદી તૈયાર કરી, ત્યારે મોટાભાગના આગેવાનોએ
         તેનો સમાવેશ કર્યો નહીં.</p>

      <h3>૧. શું તે અગાઉ પવિત્ર શાસ્ત્રનો ભાગ હતું?</h3>
      <p>ખ્રિસ્તી મંડળીના પ્રારંભિક સમયમાં (પ્રથમ ત્રણ સદીઓ દરમિયાન),
         આજે આપણે જોઈએ છીએ તેવું કોઈ એક સંગઠિત "બાઈબલ" નહોતું.
         વિવિધ પ્રદેશોની મંડળીઓ પાસે અલગ-અલગ પવિત્ર હસ્તપ્રતો હતી.
         તે સમયે હાનોખનું પુસ્તક વિશ્વાસીઓ અને પ્રભુના સેવકોમાં
         અત્યંત આદરણીય હતું.</p>
      <p><strong>શાસ્ત્રનો પુરાવો:</strong> નવા કરારમાં પ્રભુના શિષ્ય
         યહુદાની પત્રિકા (કલમ ૧૪-૧૫) માં સીધી રીતે હાનોખના પુસ્તકનું
         પવિત્ર વચન ટાંકવામાં આવ્યું છે.</p>
      <p><strong>મંડળીના પિતૃઓ:</strong> પ્રારંભિક મંડળીના મહાન સેવકો,
         જેમ કે તર્તુલિયન, આ પુસ્તકને ઈશ્વરપ્રેરિત માનતા હતા.</p>

      <h3>૨. કોણે અને ક્યારે આ નિર્ણય લીધો?</h3>
      <p>આ કોઈ એક વ્યક્તિ દ્વારા લેવાયેલો નિર્ણય નહોતો, પરંતુ
         વર્ષોના પ્રાર્થનાપૂર્ણ મંથન પછી મંડળીના આગેવાનો દ્વારા
         લેવાયેલ સામૂહિક નિર્ણય હતો.</p>
      <p><strong>યહૂદી સભા:</strong> અંદાજે ઈ.સ. ૯૦-૧૦૦ ના સમયગાળામાં,
         યહૂદી વિદ્વાનોએ જૂના કરારના પુસ્તકોની યાદી નક્કી કરી.
         તેઓએ હાનોખના પુસ્તકને સ્વીકાર્યું નહીં, કારણ કે તેઓ
         માનતા હતા કે પ્રબોધકો દ્વારા મળતી ઈશ્વરીય પ્રેરણાનો સમય
         મલાખી પ્રબોધક સાથે પૂર્ણ થયો હતો.</p>
      <p><strong>ખ્રિસ્તી ધર્મસભાઓ:</strong> ચોથી સદીમાં (મુખ્યત્વે
         લાઓદિકિયા અને કાર્થેજની ધર્મસભાઓમાં), મંડળીના આગેવાનોએ
         ભેગા મળીને જે પુસ્તકોને પવિત્ર આત્માની પ્રેરણાથી લખાયેલા
         માન્યા, તેની સત્તાવાર યાદી તૈયાર કરી. આ પ્રક્રિયામાં
         હાનોખના પુસ્તકને સ્થાન આપવામાં આવ્યું નહીં.</p>

      <h3>૩. તેને કેમ બાકાત રાખવામાં આવ્યું?</h3>
      <p><strong>લેખકત્વની વિશ્વસનીયતા:</strong> આ પુસ્તક હાનોખના
         નામે ઓળખાય છે, પરંતુ તે વાસ્તવમાં પવિત્ર હાનોખના
         સ્વર્ગારોહણના હજારો વર્ષો પછી લખાયેલું હતું.</p>
      <p><strong>દૂતો અને નેફિલિમનું વર્ણન:</strong> આ પુસ્તકમાં
         પતન પામેલા દૂતો અને મનુષ્ય પુત્રીઓ વચ્ચેના સંબંધોનું
         જે વર્ણન છે, તે સમયના ઘણા સેવકોને મર્યાદા બહારનું અને
         અન્ય શાસ્ત્રવચનો સાથે અસંગત લાગ્યું હતું.</p>
      <p><strong>મસીહ વિશેની રજૂઆત:</strong> જોકે તેમાં "મનુષ્યના
         પુત્ર" વિશે ઉલ્લેખ છે, પરંતુ તે સુવાર્તાઓમાં પ્રગટ
         થયેલા પ્રભુ ઈસુ ખ્રિસ્તના સંપૂર્ણ સ્વરૂપ સાથે કેટલાક
         અંશે મેળ ખાતું નહોતું.</p>

      <h3>૪. ઇથોપિયાના બાઈબલમાં તે કેમ સચવાયેલું છે?</h3>
      <p>ઇથોપિયન ઓર્થોડોક્સ ટેવાહેડો મંડળી એ વિશ્વની અતિ પ્રાચીન
         ખ્રિસ્તી મંડળીઓમાંની એક છે. આ મંડળી ભૌગોલિક રીતે
         પશ્ચિમી સામ્રાજ્યોથી દૂર હોવાને કારણે, તેઓએ પોતાની
         પ્રાચીન પરંપરાઓ અને પવિત્ર લખાણોને અકબંધ રાખ્યા હતા.</p>
      <p>સદીઓ સુધી આ પુસ્તક માત્ર ઇથોપિયાની પ્રાચીન ગીઝ (Ge'ez)
         ભાષામાં જ ઉપલબ્ધ હતું. ઇથોપિયાના વિશ્વાસીઓ આજે પણ
         તેને ઈશ્વરપ્રેરિત માને છે.</p>

      <h3 style="margin-top:24px;">પવિત્ર શાસ્ત્રની વિવિધ પરંપરાઓ</h3>
      <table>
        <thead>
          <tr>
            <th>ખ્રિસ્તી પરંપરા</th>
            <th>હાનોખ સમાવેશ?</th>
            <th>કારણ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>પ્રોટેસ્ટન્ટ</td>
            <td>ના</td>
            <td>ફક્ત યહૂદી-સ્વીકૃત જૂનો કરાર</td>
          </tr>
          <tr>
            <td>કેથોલિક / ઓર્થોડોક્સ</td>
            <td>ના</td>
            <td>ચોથી સદીની ધર્મસભાઓ દ્વારા બાકાત</td>
          </tr>
          <tr>
            <td>ઇથોપિયન ઓર્થોડોક્સ</td>
            <td>હા ✓</td>
            <td>પ્રાચીન પરંપરા — ઈશ્વરપ્રેરિત ગ્રંથ</td>
          </tr>
        </tbody>
      </table>
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

  // Scroll to top on chapter change
  window.scrollTo({ top: 0, behavior: "smooth" });

  const title = document.createElement("h2");
  title.className = "page-title";
  title.textContent = `અધ્યાય ${chapter.n} — ${chapter.title}`;
  content.appendChild(title);

  (chapter.verses || []).forEach(v => {
    const div = document.createElement("div");
    div.className = "verse";

    const match = v.match(/^([\d૦-૯]+)\.(.*)/s);
    if (match) {
      div.innerHTML =
        `<span class="verse-number">${match[1]}.</span><span>${match[2].trim()}</span>`;
    } else {
      div.textContent = v;
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

  // Prev: disabled only on History
  prev.disabled = (currentIndex === -1);

  // Next: disabled on last chapter
  next.disabled = (currentIndex === chaptersData.length - 1);
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
  try {
    localStorage.setItem("enoch_bookmark", currentIndex.toString());
  } catch (_) {}
}

function restoreBookmark() {
  try {
    const saved = localStorage.getItem("enoch_bookmark");
    const idx   = saved !== null ? parseInt(saved) : -1;

    if (idx === -1 || isNaN(idx)) {
      showHistory();
    } else if (idx >= 0 && idx < chaptersData.length) {
      renderChapter(idx);
    } else {
      showHistory();
    }
  } catch (_) {
    showHistory();
  }
}