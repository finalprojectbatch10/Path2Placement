/* ================= QUESTION BANK ================= */

const questions = [
"Tell me about yourself",
"Why should we hire you",
"What are your strengths",
"What are your weaknesses",
"Where do you see yourself in five years",
"Why do you want to join our company",
"Tell me about a challenge you faced",
"Describe a leadership experience",
"What motivates you to work",
"Tell me about your biggest achievement",
"Describe a failure and what you learned",
"How do you handle stress",
"How do you work in a team",
"Describe a conflict with a teammate",
"What makes you different from others",
"Why did you choose this career",
"What are your short term goals",
"What are your long term goals",
"What do you know about our company",
"How do you prioritize tasks",
"Tell me about a time you solved a problem",
"Describe a difficult decision you made",
"How do you handle criticism",
"How do you manage deadlines",
"Describe your dream job",
"How do you learn new skills",
"How do you stay organized",
"What does success mean to you",
"What makes a good team",
"How do you handle pressure"
]

/* ================= SETTINGS ================= */

const TOTAL_QUESTIONS = 10

let shuffledQuestions = []
let index = 0
let finalText = ""
let isRecording = false

/* ================= SHUFFLE ================= */

function shuffle(array){
    for(let i=array.length-1;i>0;i--){
        let j=Math.floor(Math.random()*(i+1))
        ;[array[i],array[j]]=[array[j],array[i]]
    }
    return array
}

/* ================= START PRACTICE ================= */

function startAttempt(){
    shuffledQuestions = shuffle([...questions]).slice(0,TOTAL_QUESTIONS)
    index = 0
    loadQuestion()
}

startAttempt()

/* ================= LOAD QUESTION ================= */

function loadQuestion(){
    document.getElementById("questionCount").innerText =
        `Question ${index+1} / ${TOTAL_QUESTIONS}`

    document.getElementById("question").innerText = shuffledQuestions[index]

    document.getElementById("speechText").innerText = ""
    document.getElementById("result").innerHTML = ""

    const nextBtn = document.getElementById("nextBtn")
    nextBtn.classList.remove("hidden")

    // Change button text for last question
    nextBtn.innerText = (index === TOTAL_QUESTIONS - 1) ? "Done" : "Next Question"

    finalText = ""
}

/* ================= NEXT QUESTION ================= */

function nextQuestion(){
    index++

    if(index < TOTAL_QUESTIONS){
        loadQuestion()
    }else{
        // Practice completed screen
        document.getElementById("questionCount").innerText=""
        document.getElementById("question").innerText="Practice Completed!"
        document.getElementById("result").innerHTML=
        `
        <div class="text-center">
            <div class="text-lime-400 font-semibold text-lg mb-4">
                You completed ${TOTAL_QUESTIONS} HR practice questions.
            </div>

            <button onclick="restartPractice()"
                class="bg-lime-400 text-black px-6 py-2 rounded-lg font-semibold">
                Practice Again
            </button>
        </div>
        `
        document.getElementById("nextBtn").classList.add("hidden")
    }
}

/* ================= RESTART PRACTICE ================= */

function restartPractice(){
    try{
        recognition.stop()
    }catch(e){}
    finalText = ""
    isRecording = false
    startAttempt()
}

/* ================= GOOGLE WEB SPEECH API ================= */

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
recognition.lang = "en-US"
recognition.continuous = true
recognition.interimResults = true

recognition.onresult = function(event){
    let transcript = ""
    for(let i=0;i<event.results.length;i++){
        transcript += event.results[i][0].transcript
    }
    finalText = transcript
    document.getElementById("speechText").innerText = transcript
}

recognition.onend = function(){
    isRecording = false
}

/* ================= START SPEECH ================= */

function startSpeech(){
    try{
        finalText = ""
        recognition.start()
        isRecording = true
    }catch(e){
        console.log("Speech already running")
    }
}

/* ================= SUBMIT ANSWER ================= */

async function submitAnswer(){
    if(isRecording){
        recognition.stop()
    }

    if(finalText.trim() === ""){
        alert("Please speak your answer first")
        return
    }

    try{
        let response = await fetch("http://127.0.0.1:5000/analyze-hr",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({speech: finalText})
        })

        let data = await response.json()

        document.getElementById("result").innerHTML =
        `
        <h3 class="text-lg font-semibold mb-3">AI Evaluation</h3>

        <p><b>Word Count:</b> ${data.words}</p>
        <p><b>Sentences:</b> ${data.sentences}</p>
        <p><b>Nouns:</b> ${data.nouns}</p>
        <p><b>Verbs:</b> ${data.verbs}</p>
        <p><b>Filler Words:</b> ${data.filler_words}</p>
        <p><b>Readability Score:</b> ${data.readability}</p>
        <p><b>Grade Level:</b> ${data.grade_level}</p>

        <p class="mt-2"><b>Score:</b> ${data.score}/100</p>

        <p class="text-lime-400 mt-3">
        <b>Feedback:</b> ${data.feedback}
        </p>
        `

        document.getElementById("nextBtn").classList.remove("hidden")

    }catch(error){
        console.error(error)
        document.getElementById("result").innerHTML =
            `<p class="text-red-400">Error connecting to AI server</p>`
    }
}