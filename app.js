async function loadBook() {
  try {
    const [chaptersRes, historyRes] = await Promise.all([
      fetch("./data/chapters.json"),
      fetch("./data/history.json")
    ]);

    if (!chaptersRes.ok) throw new Error("chapters.json missing");
    if (!historyRes.ok) throw new Error("history.json missing");

    const chapters = await chaptersRes.json();
    const history = await historyRes.json();

    window.BOOK_DATA = { chapters, history };

    console.log("✅ Book loaded", chapters.length, "chapters");

    initReader(chapters, history);

  } catch (err) {
    document.getElementById("app").innerHTML = `
      <div style="padding:20px;color:red;font-family:monospace">
        ❌ Load Error: ${err.message}
      </div>`;
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", loadBook);
