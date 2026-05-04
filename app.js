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
    <h2 style="text-align:center;">હનોખના પુસ્તકનો ઇતિહાસ</h2>

    <p>
      હાનોખનું પુસ્તક (ખાસ કરીને ૧ હાનોખ) એક અત્યંત ગહન વિષય છે. આ પવિત્ર પુસ્તકને ક્યારેય બાઈબલમાંથી સત્તાવાર રીતે \"દૂર\" કરવામાં આવ્યું નહોતું, 
      પરંતુ જ્યારે વિશ્વાસીઓના અગ્રેસરોએ પવિત્ર શાસ્ત્રના પુસ્તકોની અંતિમ યાદી તૈયાર કરી, ત્યારે મોટાભાગના આગેવાનોએ તેનો સમાવેશ કર્યો નહીં.
      \n\nઅહીં તેની સચોટ અને વિગતવાર સમજૂતી છે:\n\n
      ૧. શું તે અગાઉ પવિત્ર શાસ્ત્રનો ભાગ હતું?\n\n
      ખ્રિસ્તી મંડળીના પ્રારંભિક સમયમાં (પ્રથમ ત્રણ સદીઓ દરમિયાન), આજે આપણે જોઈએ છીએ તેવું કોઈ એક સંગઠિત \"બાઈબલ\" નહોતું. 
      વિવિધ પ્રદેશોની મંડળીઓ પાસે અલગ-અલગ પવિત્ર હસ્તપ્રતો હતી. તે સમયે હાનોખનું પુસ્તક વિશ્વાસીઓ અને પ્રભુના સેવકોમાં અત્યંત આદરણીય હતું.\n\n
      શાસ્ત્રનો પુરાવો: નવા કરારમાં પ્રભુના શિષ્ય યહુદાની પત્રિકા (કલમ ૧૪-૧૫) માં સીધી રીતે હાનોખના પુસ્તકનું પવિત્ર વચન ટાંકવામાં આવ્યું છે.\n\n
      મંડળીના પિતૃઓ: પ્રારંભિક મંડળીના મહાન સેવકો, જેમ કે તર્તુલિયન, આ પુસ્તકને ઈશ્વરપ્રેરિત માનતા હતા.\n\n
      <p>
      ૨. કોણે અને ક્યારે આ નિર્ણય લીધો?\n\nઆ કોઈ એક વ્યક્તિ દ્વારા લેવાયેલો નિર્ણય નહોતો, પરંતુ વર્ષોના પ્રાર્થનાપૂર્ણ મંથન પછી મંડળીના આગેવાનો દ્વારા લેવાયેલ સામૂહિક નિર્ણય હતો.\n\n
      યહૂદી સભા: અંદાજે ઈ.સ. ૯૦-૧૦૦ ના સમયગાળામાં, યહૂદી વિદ્વાનોએ જૂના કરારના પુસ્તકોની યાદી નક્કી કરી. તેઓએ હાનોખના પુસ્તકને સ્વીકાર્યું નહીં, કારણ કે તેઓ 
      માનતા હતા કે પ્રબોધકો દ્વારા મળતી ઈશ્વરીય પ્રેરણાનો સમય મલાખી પ્રબોધક સાથે પૂર્ણ થયો હતો.\n\n
      ખ્રિસ્તી ધર્મસભાઓ: ચોથી સદીમાં (મુખ્યત્વે લાઓદિકિયા અને કાર્થેજની ધર્મસભાઓમાં), મંડળીના આગેવાનોએ ભેગા મળીને જે પુસ્તકોને પવિત્ર આત્માની પ્રેરણાથી લખાયેલા માન્યા, 
      તેની સત્તાવાર યાદી તૈયાર કરી. આ પ્રક્રિયામાં હાનોખના પુસ્તકને સ્થાન આપવામાં આવ્યું નહીં.\n\n
      ૩. તેને કેમ બાકાત રાખવામાં આવ્યું?\n\nતેના મુખ્ય કારણો આત્મિક અને વ્યવહારિક હતા:\n\nલેખકત્વની વિશ્વસનીયતા: આ પુસ્તક હાનોખના નામે ઓળખાય છે, 
      પરંતુ તે વાસ્તવમાં પવિત્ર હાનોખના સ્વર્ગારોહણના હજારો વર્ષો પછી લખાયેલું હતું.\n\nદૂતો અને નેફિલિમનું વર્ણન: આ પુસ્તકમાં પતન પામેલા દૂતો અને મનુષ્ય પુત્રીઓ 
      વચ્ચેના સંબંધોનું જે વર્ણન છે, તે સમયના ઘણા સેવકોને મર્યાદા બહારનું અને અન્ય શાસ્ત્રવચનો સાથે અસંગત લાગ્યું હતું.\n\nમસીહ વિશેની રજૂઆત: જોકે તેમાં \"મનુષ્યના પુત્ર\" 
      વિશે ઉલ્લેખ છે, પરંતુ તે સુવાર્તાઓમાં પ્રગટ થયેલા પ્રભુ ઈસુ ખ્રિસ્તના સંપૂર્ણ સ્વરૂપ સાથે કેટલાક અંશે મેળ ખાતું નહોતું.\n\n
      <p>
      ૪. ઇથોપિયાના બાઈબલમાં તે કેમ સચવાયેલું છે?\n\nઇથોપિયન ઓર્થોડોક્સ ટેવાહેડો મંડળી એ વિશ્વની અતિ પ્રાચીન ખ્રિસ્તી મંડળીઓમાંની એક છે. આ મંડળી ભૌગોલિક રીતે પશ્ચિમી 
      સામ્રાજ્યોથી દૂર હોવાને કારણે, તેઓએ પોતાની પ્રાચીન પરંપરાઓ અને પવિત્ર લખાણોને અકબંધ રાખ્યા હતા.\n\nસંરક્ષણ: જ્યારે બાકીની દુનિયામાં હાનોખના પુસ્તકની નકલો કરવાનું 
      બંધ કરી દેવામાં આવ્યું, ત્યારે ઇથોપિયાની મંડળીએ તેને પવિત્ર અને આત્મિક રીતે મૂલ્યવાન ગણીને સાચવી રાખ્યું. સદીઓ સુધી આ પુસ્તક માત્ર ઇથોપિયાની પ્રાચીન ગીઝ (Ge'ez) 
      ભાષામાં જ ઉપલબ્ધ હતું.\n\nઆત્મિક મહત્વ: ઇથોપિયાના વિશ્વાસીઓ આજે પણ તેને ઈશ્વરપ્રેરિત માને છે. તેઓના મતે, આ પુસ્તક નૂહના સમયના જળપ્રલય અને આત્મિક યુદ્ધના 
      રહસ્યો સમજવામાં મદદરૂપ થાય છે.\n\nપવિત્ર શાસ્ત્રની વિવિધ પરંપરાઓનો તફાવત\n\nખ્રિસ્તી પરંપરા\tહાનોખનો સમાવેશ?\tકારણ\nપ્રોટેસ્ટન્ટ\tના\tતેઓ યહૂદીઓ દ્વારા સ્વીકૃત 
      જૂના કરારના પુસ્તકોને જ પ્રમાણિત માને છે.\nકેથોલિક / ઓર્થોડોક્સ\tના\tચોથી સદીની ધર્મસભાઓએ તેને સત્તાવાર યાદીમાં સ્થાન આપ્યું નથી.\nઇથોપિયન ઓર્થોડોક્સ\tહા\tતેઓની 
      અતિ પ્રાચીન પરંપરા મુજબ તેને હજુ પણ ઈશ્વરપ્રેરિત માને છે."
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
