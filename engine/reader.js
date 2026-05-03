function initReader(chapters, history) {
  const app = document.getElementById("app");

  let html = `
    <div style="
      padding:20px;
      font-family: 'EB Garamond', serif;
      background:#f0e6d0;
      min-height:100vh;
    ">
      <h1>📜 હનોખનું પુસ્તક</h1>
      <p style="opacity:0.7">Immersive Reader Loaded</p>

      <hr/>
      <h2>📖 History</h2>
      <pre style="white-space:pre-wrap">${history.content || JSON.stringify(history, null, 2)}</pre>

      <hr/>
      <h2>📚 Chapters Loaded</h2>
      <p>Total: ${chapters.length}</p>
    </div>
  `;

  app.innerHTML = html;
}

// MUST be global for app.js
window.initReader = initReader;
