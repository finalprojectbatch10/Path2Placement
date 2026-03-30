document.addEventListener("DOMContentLoaded", () => {
  loadQuestion();
});

function loadQuestion() {

  const q =
    jamQuestions[Math.floor(Math.random() * jamQuestions.length)];

  document.getElementById("jamQuestion").innerText = q;
}

let recognition = null;
let timer = 60;
let interval = null;

function startSpeaking() {

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

  recognition.onresult = (e) => {

    let text = "";

    for (let i = 0; i < e.results.length; i++) {
      text += e.results[i][0].transcript + " ";
    }

    document.getElementById("transcript").value = text.trim();
  };

  recognition.start();

  startTimer();
}

function startTimer() {

  timer = 60;

  document.getElementById("timer").innerText = timer;

  interval = setInterval(() => {

    timer--;

    document.getElementById("timer").innerText = timer;

    if (timer <= 0) {
      stopAll();
    }

  }, 1000);
}

function stopAll() {

  if (recognition) {
    recognition.stop();
    recognition = null;
  }

  clearInterval(interval);

  document.getElementById("submitBtn").classList.remove("hidden");
}

function submitSpeech() {

  const speech =
    document.getElementById("transcript").value.trim();

  const topic =
    document.getElementById("jamQuestion").innerText;

  const user = JSON.parse(localStorage.getItem("user"));

  const username = user?.name || "Guest";

  if (!speech) {
    alert("Please speak before submitting");
    return;
  }

  fetch("http://127.0.0.1:5000/analyze-jam", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      speech,
      username,
      topic
    })

  })
    .then(res => res.json())

    .then(data => {

      showResult(data.analysis);

    });
}

function showResult(a) {

  const resultDiv =
    document.getElementById("result");

  resultDiv.classList.remove("hidden");

  resultDiv.innerHTML = `

  <h3 class="text-xl font-bold mb-4">Evaluation</h3>

  <p><b>Fluency:</b> ${a.fluency}</p>
  <p><b>Grammar:</b> ${a.grammar}</p>
  <p><b>Vocabulary:</b> ${a.vocabulary}</p>
  <p><b>Confidence:</b> ${a.confidence}</p>

  <p class="text-yellow-400 font-bold mt-2">
  Overall Score: ${a.overallScore}
  </p>

  <p class="mt-3">
  <b>Feedback:</b> ${a.feedback}
  </p>
  `;

  document.getElementById("submitBtn").classList.add("hidden");

  document.getElementById("practiceBtn").classList.remove("hidden");
}

function resetPractice() {

  location.reload();

}