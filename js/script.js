/* Error handler */
function safeRun(fn) {
  try {
    fn();
  } catch (error) {
    console.error(error);
  }
}

/* 
==================================================================================
United Kingdom clock
==================================================================================
*/
function updateUKTime() {
  const timeEl = document.getElementById("uk-time");
  const dateEl = document.getElementById("uk-date");

  if (!timeEl || !dateEl) return;

  const now = new Date();

  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  timeEl.textContent = timeFormatter.format(now).replace(/\./g, ":");
  dateEl.textContent = dateFormatter.format(now).toUpperCase();
}

/* 
==================================================================================
Earth globe
==================================================================================
*/
function setupEarthCanvas() {
  const canvas = document.getElementById("earth-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const R = W / 2 - 2;

  /* Rough land display not entirely accurate as I don't have much experience in 3D web displays */
  const lands = [
    { name: "UK", pts: [[-5.7,50],[-3,58.6],[0.1,60.8],[1.8,57.5],[0.2,51.5],[-5,49.9],[-5.7,50]], color: "#fbbf24", glow: true },
    { pts: [[-9,36],[3,44],[15,47],[25,46],[28,42],[20,35],[10,36],[-5.4,35.8],[-9,36]] },
    { pts: [[15,47],[25,46],[30,52],[20,55],[12,56],[8,55],[5,52],[8,48],[15,47]] },
    { pts: [[-9,37],[-1,44],[3,44],[-9,36]] },
    { pts: [[-18,14],[0,5],[10,5],[20,2],[35,-5],[40,10],[45,12],[42,15],[35,22],[32,30],[25,32],[20,37],[10,38],[-5,37],[-17,21],[-18,14]] },
    { pts: [[-165,60],[-140,60],[-120,50],[-80,45],[-65,44],[-70,42],[-75,35],[-80,25],[-90,19],[-105,19],[-120,30],[-140,40],[-165,60]] },
    { pts: [[-80,12],[-65,11],[-50,2],[-35,-5],[-35,-10],[-40,-15],[-45,-25],[-55,-35],[-68,-55],[-70,-40],[-75,-25],[-80,-5],[-80,12]] },
    { pts: [[25,46],[30,52],[40,55],[60,54],[80,50],[100,50],[120,52],[140,48],[145,44],[135,35],[120,30],[110,20],[100,10],[80,15],[70,23],[55,22],[45,28],[40,36],[30,36],[25,46]] },
    { pts: [[114,-22],[130,-12],[140,-17],[150,-23],[153,-28],[150,-35],[140,-38],[130,-33],[115,-32],[114,-22]] }
  ];

  let rotation = 0;

  function lonLatToXY(lon, lat, rot) {
    const radLon = (lon + rot) * Math.PI / 180;
    const radLat = lat * Math.PI / 180;

    const x3 = Math.cos(radLat) * Math.sin(radLon);
    const y3 = Math.sin(radLat);
    const z3 = Math.cos(radLat) * Math.cos(radLon);

    if (z3 < 0) return null;

    return {
      x: cx + x3 * R,
      y: cy - y3 * R,
      z: z3
    };
  }

  function drawEarth() {
    ctx.clearRect(0, 0, W, H);

    const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, 0, cx, cy, R);
    grad.addColorStop(0, "#0a2040");
    grad.addColorStop(0.5, "#041430");
    grad.addColorStop(1, "#020818");

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "rgba(0,229,255,0.08)";
    ctx.lineWidth = 0.5;

    for (let lat = -80; lat <= 80; lat += 20) {
      ctx.beginPath();
      let first = true;

      for (let lon = -180; lon <= 180; lon += 5) {
        const p = lonLatToXY(lon, lat, rotation);

        if (!p) {
          first = true;
          continue;
        }

        if (first) {
          ctx.moveTo(p.x, p.y);
          first = false;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }

      ctx.stroke();
    }

    for (let lon = -180; lon < 180; lon += 30) {
      ctx.beginPath();
      let first = true;

      for (let lat = -85; lat <= 85; lat += 5) {
        const p = lonLatToXY(lon, lat, rotation);

        if (!p) {
          first = true;
          continue;
        }

        if (first) {
          ctx.moveTo(p.x, p.y);
          first = false;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }

      ctx.stroke();
    }

    for (const land of lands) {
      const projected = land.pts
        .map(([lo, la]) => lonLatToXY(lo, la, rotation))
        .filter(Boolean);

      if (projected.length < 3) continue;

      ctx.beginPath();
      ctx.moveTo(projected[0].x, projected[0].y);

      for (let i = 1; i < projected.length; i++) {
        ctx.lineTo(projected[i].x, projected[i].y);
      }

      ctx.closePath();

      if (land.glow) {
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "rgba(251,191,36,0.85)";
      } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(59,130,246,0.45)";
      }

      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = land.glow ? "rgba(251,191,36,0.9)" : "rgba(0,229,255,0.2)";
      ctx.lineWidth = land.glow ? 1.5 : 0.5;
      ctx.stroke();
    }

    const rim = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R);
    rim.addColorStop(0, "transparent");
    rim.addColorStop(1, "rgba(0,229,255,0.25)");

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = rim;
    ctx.fill();

    const spec = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, 0, cx - R * 0.35, cy - R * 0.35, R * 0.5);
    spec.addColorStop(0, "rgba(255,255,255,0.08)");
    spec.addColorStop(1, "transparent");

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = spec;
    ctx.fill();

    rotation += 0.3;
    requestAnimationFrame(drawEarth);
  }

  drawEarth();
}

/* 
==================================================================================
Group progress graph
==================================================================================
*/
function setupProgressGraph() {
  const canvas = document.getElementById("progress-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const data = [
    { label: "Jan", val: 15, note: "Planning" },
    { label: "Feb", val: 35, note: "Research Materials & Concept Design" },
    { label: "Feb+", val: 40, note: "2D concept design & 3D design start" },
    { label: "Feb++", val: 22, note: "Standstill" },
    { label: "Mar", val: 55, note: "Preliminary Design Stage" },
    { label: "Mar+", val: 48, note: "Rework on 3D Design" },
    { label: "Mar++", val: 72, note: "3D Detailed Design" },
    { label: "Apr", val: 80, note: "Detailed Design Stage" },
    { label: "Apr+", val: 75, note: "Fixing errors" },
    { label: "Apr++", val: 84, note: "Errors Fixed" },
    { label: "May", val: 80, note: "Redesigned Base" },
    { label: "May+", val: 84, note: "Model Adjusted" },
    { label: "May++", val: 80, note: "Fix Base Errors" },
    { label: "May+++", val: 90, note: "Base Errors Fixed" },
    { label: "May++++", val: 95, note: "Prototype" },
    { label: "May+++++", val: 98, note: "All work in Repo" },
    { label: "May++++++", val: 100, note: "Finish portfolio" }
  ];

  function draw() {
    const parent = canvas.parentElement;

    const pointSpacing = 150;
    const pad = { t: 30, r: 40, b: 35, l: 55 };

    canvas.width = Math.max(
      parent.clientWidth,
      pad.l + pad.r + (data.length - 1) * pointSpacing
    );

    canvas.height = parent.clientHeight;

    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const gW = (data.length - 1) * pointSpacing;
    const gH = H - pad.t - pad.b;

    ctx.strokeStyle = "rgba(168,85,247,0.12)";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
      const y = pad.t + gH - (i / 4) * gH;

      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + gW, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(100,116,139,0.7)";
      ctx.font = "10px Exo 2, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${i * 25}%`, pad.l - 8, y + 3);
    }

    const pts = data.map((d, i) => ({
      x: pad.l + i * pointSpacing,
      y: pad.t + gH - (d.val / 100) * gH
    }));

    ctx.fillStyle = "rgba(100,116,139,0.8)";
    ctx.font = "10px Exo 2, sans-serif";
    ctx.textAlign = "center";

    data.forEach((d, i) => {
      ctx.fillText(d.label, pts[i].x, H - 12);
    });

    const fill = ctx.createLinearGradient(0, pad.t, 0, pad.t + gH);
    fill.addColorStop(0, "rgba(168,85,247,0.25)");
    fill.addColorStop(1, "rgba(168,85,247,0)");

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.t + gH);

    pts.forEach((p) => ctx.lineTo(p.x, p.y));

    ctx.lineTo(pts[pts.length - 1].x, pad.t + gH);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    pts.forEach((p) => ctx.lineTo(p.x, p.y));

    ctx.strokeStyle = "rgba(168,85,247,0.9)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(168,85,247,0.6)";
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.shadowBlur = 0;

    pts.forEach((p, i) => {
      const isUp = i === 0 || data[i].val >= data[i - 1].val;

      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);

      ctx.fillStyle = isUp ? "rgba(0,229,255,1)" : "rgba(251,191,36,1)";
      ctx.shadowColor = isUp ? "rgba(0,229,255,0.8)" : "rgba(251,191,36,0.8)";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (data[i].note) {
        ctx.font = "9px Exo 2, sans-serif";
        ctx.fillStyle = "rgba(148,163,184,0.75)";
        ctx.textAlign = "center";

        const offsetY = p.y < pad.t + 28 ? p.y + 16 : p.y - 12;
        ctx.fillText(data[i].note, p.x, offsetY);
      }
    });
  }

  window.addEventListener("resize", draw);
  draw();
}

/* 
==================================================================================
Chatbot
==================================================================================
*/
function setupChatbot() {
  const responses = {
    default: "I'm your project guide. Ask me about features, the Gantt chart, progress, or the project overview.",
    hello: "Hello. Welcome to Project Soapamorph. Ask about anything to do with guidance on the navigation of this website.",
    help: "I can explain the progress graph, the Gantt timeline, the progress history, the Earth widget, or the project pages in the navigation bar.",
    gantt: "The Gantt chart shows the project phases using your Mermaid project timeline. It includes semester activity, meetings, and the final due date.",
    earth: "The holographic Earth highlights the United Kingdom in yellow. The live clock beneath it shows the current UK time and date.",
    progress: "The top-left graph tracks project momentum over time. Cyan dots show stronger progress periods and yellow dots show slower periods.",
    history: "The progress history panel shows the current stage, version, next goal, and dated development milestones in a scrollable log.",
    about: "This is a university final-year project dashboard designed to present development progress, design stages, and project structure.",
    gallery: "The Gallery page contains renders, screenshots, and visual development material.",
    contact: "The Contact page provides ways to reach the project creator.",
    profile: "The Profile page explains the background of the person behind the project.",
    design: "The Design Process and Design STL pages document concept development, modelling work, and 3D design outputs.",
    version: "The current version shown here is v0.4.2 beta.",
    stl: "The Design STL page contains 3D model outputs and related design information."
  };

  const responsesBox = document.getElementById("chat-responses");
  const input = document.getElementById("chatbot-input");
  const form = document.getElementById("chatbot-form");

  if (!responsesBox || !input || !form) return;

  function getResponse(text) {
    const lower = text.toLowerCase();

    if (/\b(hi|hello|hey)\b/.test(lower)) return responses.hello;
    if (/\bhelp\b/.test(lower)) return responses.help;
    if (/\b(gantt|timeline|phase|task)\b/.test(lower)) return responses.gantt;
    if (/\b(earth|uk|globe|time|clock)\b/.test(lower)) return responses.earth;
    if (/\b(progress|graph|hype|chart)\b/.test(lower)) return responses.progress;
    if (/\b(history|log|stage)\b/.test(lower)) return responses.history;
    if (/\b(about|project|soapamorph)\b/.test(lower)) return responses.about;
    if (/\b(gallery|image|photo)\b/.test(lower)) return responses.gallery;
    if (/\b(contact|email|reach)\b/.test(lower)) return responses.contact;
    if (/\bprofile\b/.test(lower)) return responses.profile;
    if (/\b(design|process)\b/.test(lower)) return responses.design;
    if (/\b(stl|3d|model)\b/.test(lower)) return responses.stl;
    if (/\b(version|v0)\b/.test(lower)) return responses.version;

    return responses.default;
  }

  function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = `chat-msg ${role}`;

    if (role === "bot") {
      div.innerHTML = `<span class="bot-label">Chatbot Assistant</span>${text}`;
    } else {
      div.textContent = text;
    }

    responsesBox.appendChild(div);
    responsesBox.scrollTop = responsesBox.scrollHeight;
  }

  function sendMessage() {
    const value = input.value.trim();
    if (!value) return;

    addMessage(value, "user");
    input.value = "";

    window.setTimeout(() => {
      addMessage(getResponse(value), "bot");
    }, 350);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendMessage();
  });

  window.setTimeout(() => {
    addMessage("Welcome to Project Soapamorph. I'm your guided assistant. Ask me about the dashboard features or project sections.", "bot");
  }, 600);
}

/* 
==================================================================================
Gantt chart mermaid
================================================================================== 
*/
function renderGanttChart() {
  const ganttContainer = document.getElementById("gantt-chart");
  if (!ganttContainer || typeof mermaid === "undefined") return;

  const ganttDefinition = `
gantt
    dateFormat YYYY-MM-DD
    title Robotic Modelling and Drone Skin Design

    section First Semester
    Introduction to Fusion 3D            :done, fusionintro, 2025-10-21, 1d
    3D Scanning Workshop                 :done, scanintro, 2025-11-04, 1d
    Motion Capture Instruction           :done, mocapintro, 2025-11-11, 1d
    3D Factory Workshop                  :done, factoryintro, 2025-11-18, 1d
    Blender Introduction                 :done, blenderintro, 2025-12-15, 1d
    Blender Next Steps                   :done, blendernext, 2026-01-05, 1d

    section Group Project
    Project Group Assigned               :done, groupassigned, 2025-10-14, 1d
    Group Project Assignment             :active, groupproject, 2025-12-02, 2026-05-05

    section Meetings
    Intro Meeting                        :done, firstmeeting, 2026-01-19, 1d
    Proposal Meeting                     :done, secondmeeting, 2026-02-01, 1d
    Weekly Meeting 1                     :weekly1, 2026-02-10, 1d
    Weekly Meeting 2                     :weekly2, 2026-02-17, 1d
    Agile Sprint Meeting 1               :sprint1, 2026-02-17, 1d
    Weekly Meeting 3                     :weekly3, 2026-02-24, 1d
    Weekly Meeting 4                     :weekly4, 2026-03-03, 1d
    Agile Sprint Meeting 2               :sprint2, 2026-03-03, 1d
    Weekly Meeting 5                     :weekly5, 2026-03-10, 1d
    Weekly Meeting 6                     :weekly6, 2026-03-17, 1d
    Agile Sprint Meeting 3               :sprint3, 2026-03-17, 1d
    Weekly Meeting 7                     :weekly7, 2026-03-24, 1d
    Weekly Meeting 8                     :weekly8, 2026-03-31, 1d
    Agile Sprint Meeting 4               :sprint4, 2026-03-31, 1d
    Weekly Meeting 9                     :weekly9, 2026-04-07, 1d
    Weekly Meeting 10                    :weekly10, 2026-04-14, 1d
    Agile Sprint Meeting 5               :sprint5, 2026-04-14, 1d
    Weekly Meeting 11                    :weekly11, 2026-04-21, 1d
    Weekly Meeting 12                    :weekly12, 2026-04-28, 1d
    Agile Sprint Meeting 6               :sprint6, 2026-04-28, 1d
    Weekly Meeting 13                    :weekly13, 2026-05-05, 1d

    section Key Dates
    Assignment Due Date                  :milestone, deadline, 2026-05-15, 1d
  `;

  try {
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: {
        primaryColor: "#142541",
        primaryTextColor: "#e2e8f0",
        primaryBorderColor: "#00e5ff",
        lineColor: "#00e5ff",
        secondaryColor: "#10203a",
        tertiaryColor: "#0b1730",
        taskTextColor: "#e2e8f0",
        taskTextOutsideColor: "#e2e8f0",
        activeTaskBkgColor: "#a855f7",
        activeTaskBorderColor: "#00e5ff",
        doneTaskBkgColor: "#183e5e",
        doneTaskBorderColor: "#00e5ff",
        gridColor: "#244261",
        sectionBkgColor: "#101b34",
        sectionBkgColor2: "#0d162c",
        sectionTextColor: "#e2e8f0",
        todayLineColor: "#fbbf24",
        fontFamily: "Exo 2"
      }
    });

    mermaid.render("generated-gantt", ganttDefinition)
      .then((result) => {
        ganttContainer.innerHTML = result.svg;
      })
      .catch(() => {
        ganttContainer.innerHTML = `
          <div class="feature-fallback">
            <p><strong>Schedule summary:</strong></p>
            <p>First semester workshops completed, group project active, weekly meetings ongoing, assignment due 15 May 2026.</p>
          </div>
        `;
      });
  } catch (error) {
    ganttContainer.innerHTML = `
      <div class="feature-fallback">
        <p><strong>Schedule summary:</strong></p>
        <p>First semester workshops completed, group project active, weekly meetings ongoing, assignment due 15 May 2026.</p>
      </div>
    `;
    console.error(error);
  }
}

/* 
==================================================================================
Start when website running
==================================================================================
*/
safeRun(() => {
  updateUKTime();
  window.setInterval(updateUKTime, 1000);
});

safeRun(setupEarthCanvas);
safeRun(setupProgressGraph);
safeRun(setupChatbot);
safeRun(renderGanttChart);