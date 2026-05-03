// ------------------------
// COVER FLOW (10 seconds)
// ------------------------
window.onload = () => {
  setTimeout(() => {
    document.getElementById("cover").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadBook();
  }, 100);
};

// ------------------------
// LOAD BOOK DATA
// ------------------------
async function loadBook() {
  try {
    const historyRes = await fetch("./data/history.json");
    const chaptersRes = await fetch("./data/chapters.json");

    if (!historyRes.ok || !chaptersRes.ok) {
      throw new Error("Missing JSON files");
    }

    const history = await historyRes.json();
    const chapters = await chaptersRes.json();

    initTabs(history, chapters);

  } catch (err) {
    document.getElementById("content").innerText =
      "❌ Load Error: chapters.json or history.json missing";
    console.error(err);
  }
}

// ------------------------
// INIT TABS
// ------------------------
function initTabs(history, chapters) {
  const tabs = document.getElementById("tabs");

  tabs.innerHTML = "";

  // HISTORY TAB
  createTab("History", () => {
    setActive("History");
    renderContent(history.text);
  });

  // CHAPTER TABS 1–15
  chapters.slice(0, 15).forEach(ch => {
    createTab(`Chapter ${ch.chapter}`, () => {
      setActive(`Chapter ${ch.chapter}`);
      renderContent(ch.text);
    });
  });

  // DEFAULT
  setActive("History");
  renderContent(history.text);
}

// ------------------------
// CREATE TAB
// ------------------------
function createTab(name, handler) {
  const tab = document.createElement("div");
  tab.className = "tab";
  tab.innerText = name;
  tab.onclick = handler;

  document.getElementById("tabs").appendChild(tab);
}

// ------------------------
// ACTIVE TAB
// ------------------------
function setActive(name) {
  document.querySelectorAll(".tab").forEach(t => {
    t.classList.remove("active");
    if (t.innerText === name) t.classList.add("active");
  });
}

// ------------------------
// RENDER CONTENT
// ------------------------
function renderContent(text) {
  document.getElementById("content").innerText = text;
}
