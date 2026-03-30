const socket = io("http://127.0.0.1:5000");

const user = JSON.parse(localStorage.getItem("user"));
const username = user?.name || "Guest";

let currentRoom = "";
let hostName = "";
let isCreator = false;
let recognition = null;
let transcriptText = "";

/* ================= CREATE ROOM ================= */
function createRoom() {

  const roomCode = "P2P-GD-" + Math.floor(100000 + Math.random() * 900000);
  currentRoom = roomCode;
  isCreator = true;

  document.getElementById("output").innerHTML =
    `<p class="text-green-400 font-semibold">
        ✅ Room Created
     </p>
     <p>🔑 Room Code: <b>${roomCode}</b></p>`;

  socket.emit("create_room", {
    room: roomCode,
    user: username
  });
}

/* ================= OPEN JOIN MODAL ================= */
function openJoinModal() {
  document.getElementById("joinModal").classList.remove("hidden");
}

function closeJoinModal() {
  document.getElementById("joinModal").classList.add("hidden");
}

/* ================= JOIN ROOM ================= */
function joinRoom() {

  const code = document.getElementById("roomCodeInput").value.trim();
  if (!code) return;

  currentRoom = code;
  isCreator = false;

  closeJoinModal();

  socket.emit("join_room", {
    room: code,
    user: username
  });
}

/* ================= ROOM UPDATE ================= */
socket.on("room_update", (data) => {

  hostName = data.host;
  document.getElementById("topic").innerText = data.topic;

  document.getElementById("members").innerHTML =
    data.users.map(u =>
      `<div id="member-${u}"
            class="bg-gray-800 p-4 rounded-full transition-all duration-300">
          ${u}
       </div>`
    ).join("");

  if (!(isCreator && data.users.length === 1)) {
    document.getElementById("lobby").classList.add("hidden");
    document.getElementById("room").classList.remove("hidden");
  }

  if (username === hostName) {
    document.getElementById("startBtn").classList.remove("hidden");
  }
});

/* ================= GD STARTED ================= */
socket.on("gd_started", () => {

  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("controls").classList.remove("hidden");
  document.getElementById("timerBox").classList.remove("hidden");
});

/* ================= SPEAK ================= */
function requestSpeak() {

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  transcriptText = "";

  recognition.onresult = (e) => {
    for (let i = 0; i < e.results.length; i++) {
      transcriptText += e.results[i][0].transcript + " ";
    }
  };

  recognition.start();

  socket.emit("request_speak", {
    room: currentRoom,
    user: username
  });
}

function doneSpeaking() {

  if (recognition) {
    recognition.stop();
    recognition = null;
  }

  socket.emit("done_speaking", {
    room: currentRoom,
    user: username,
    speech: transcriptText
  });
}

/* ================= SPEAKER UPDATE ================= */
socket.on("speaker_update", (data) => {

  const speakBtn = document.getElementById("speakBtn");
  const doneBtn = document.getElementById("doneBtn");
  const speakerBox = document.getElementById("currentSpeakerBox");

  document.querySelectorAll("#members div").forEach(div => {
    div.classList.remove("ring-4", "ring-yellow-400", "shadow-lg");
  });

  if (data.speaker === null) {

    speakBtn.disabled = false;
    doneBtn.classList.add("hidden");

    speakerBox.classList.add("hidden");
    speakerBox.innerText = "";

  } else {

    if (data.speaker === username) {
      speakBtn.disabled = true;
      doneBtn.classList.remove("hidden");
    } else {
      speakBtn.disabled = true;
      doneBtn.classList.add("hidden");
    }

    speakerBox.classList.remove("hidden");
    speakerBox.innerText = `🎙 Currently Speaking: ${data.speaker}`;

    const activeDiv = document.getElementById(`member-${data.speaker}`);
    if (activeDiv) {
      activeDiv.classList.add("ring-4", "ring-yellow-400", "shadow-lg");
    }
  }
});

/* ================= START GD ================= */
function startGD() {
  socket.emit("start_gd", { room: currentRoom });
}

/* ================= TIMER ================= */
socket.on("timer_update", (time) => {
  const min = Math.floor(time / 60);
  const sec = time % 60;

  document.getElementById("timer").innerText =
    `${min}:${sec.toString().padStart(2, "0")}`;
});

/* ================= GD FINISHED ================= */
socket.on("gd_finished", () => {

  const speakBtn = document.getElementById("speakBtn");
  const doneBtn = document.getElementById("doneBtn");
  const speakerBox = document.getElementById("currentSpeakerBox");

  speakBtn.disabled = true;
  doneBtn.classList.add("hidden");

  speakerBox.classList.remove("hidden");
  speakerBox.innerText = "⏱ GD Finished";
});

/* ================= GD RESULTS ================= */
socket.on("gd_results", (results) => {

  const roomDiv = document.getElementById("room");

  let html = `
    <div class="bg-gray-800 p-6 rounded-xl mt-6">
    <h2 class="text-2xl font-bold mb-4 text-lime-400">
      📊 GD Results
    </h2>
  `;

  for (const user in results) {

    const r = results[user];

    html += `
      <div class="mb-4 p-4 bg-gray-900 rounded-lg">
        <h3 class="text-xl font-bold">${user}</h3>
        <p>Fluency: ${r.fluency}</p>
        <p>Grammar: ${r.grammar}</p>
        <p>Vocabulary: ${r.vocabulary}</p>
        <p>Confidence: ${r.confidence}</p>
        <p class="text-yellow-400 font-bold">
          Overall Score: ${r.overallScore}
        </p>
      </div>
    `;
  }

  html += "</div>";

  roomDiv.innerHTML += html;
});