const user = JSON.parse(localStorage.getItem("user"))
const userId = user?.name || "Guest"

console.log("Logged in user:", userId)

if(userId === "Guest"){
alert("Please login first")
window.location.href = "login.html"
}
let examTime=2700
let currentQuestions=[]
let hrCompleted=[]
let jamCompleted=false

// ---------------- FULLSCREEN ----------------

function openFullscreen(){

let elem=document.documentElement

if(elem.requestFullscreen){
elem.requestFullscreen()
}

}

// ---------------- MAIN TIMER ----------------

function startExamTimer(){

openFullscreen()

let timer=setInterval(()=>{

examTime--

let min=Math.floor(examTime/60)
let sec=examTime%60

document.getElementById("mainTimer").innerText =
`${min}:${sec<10?'0'+sec:sec}`

if(examTime<=0){

clearInterval(timer)
alert("Exam time completed")
location.reload()

}

},1000)

}

window.onload=startExamTimer

// ---------------- BLOCK CHEATING ----------------

document.addEventListener("copy",e=>e.preventDefault())
document.addEventListener("paste",e=>e.preventDefault())
document.addEventListener("cut",e=>e.preventDefault())
document.addEventListener("contextmenu",e=>e.preventDefault())

document.addEventListener("visibilitychange",function(){

if(document.hidden){
alert("Tab switching detected. Exam terminated.")
location.reload()
}

})

// ---------------- HIGHLIGHT ----------------

function highlight(id){

["aptitudeBtn","technicalBtn","hrBtn","jamBtn"].forEach(btn=>{

let el=document.getElementById(btn)

el.classList.remove("bg-blue-500")

if(btn!==id){
el.classList.add("bg-gray-500")
}

})

document.getElementById(id).classList.remove("bg-gray-500")
document.getElementById(id).classList.add("bg-blue-500")

}

// ---------------- APTITUDE ----------------

async function loadAptitude(){

highlight("aptitudeBtn")

let res = await fetch("http://127.0.0.1:5000/generate-aptitude")
let questions = await res.json()

currentQuestions = questions

let html=`<h2 class="text-xl mb-4">Aptitude</h2>`

questions.forEach((q,i)=>{

html+=`<p class="mt-4">${i+1}. ${q.question}</p>`

q.options.forEach(opt=>{

html+=`<label class="block ml-4">
<input type="radio" name="q${i}" value="${opt}">
${opt}
</label>`

})

})

html+=`

<button id="submitBtn"
onclick="submitAptitude()"
class="bg-green-500 px-4 py-2 mt-6 rounded">
Submit
</button>

<button id="nextBtn"
onclick="goTechnical()"
style="display:none"
class="bg-blue-500 px-4 py-2 mt-6 ml-4 rounded">
Next Section
</button>

`

document.getElementById("contentArea").innerHTML=html

}

// ---------------- SUBMIT APTITUDE ----------------

async function submitAptitude(){

let answers=[]

currentQuestions.forEach((q,i)=>{

let selected=document.querySelector(`input[name="q${i}"]:checked`)
answers.push(selected?selected.value:null)

})

await fetch("http://127.0.0.1:5000/submit-aptitude",{

method:"POST",
headers:{"Content-Type":"application/json"},

body:JSON.stringify({
user_id:userId,
answers:answers,
questions:currentQuestions
})

})

document.getElementById("submitBtn").disabled=true
document.getElementById("nextBtn").style.display="inline-block"

}

function goTechnical(){

document.getElementById("technicalBtn").disabled=false
loadTechnical()

}

// ---------------- TECHNICAL ----------------

async function loadTechnical(){

highlight("technicalBtn")

let res=await fetch("http://127.0.0.1:5000/generate-technical")
let questions=await res.json()

currentQuestions=questions

let html=`<h2 class="text-xl mb-4">Technical</h2>`

questions.forEach((q,i)=>{

html+=`<p class="mt-4">${i+1}. ${q.question}</p>`

q.options.forEach(opt=>{

html+=`<label class="block ml-4">
<input type="radio" name="q${i}" value="${opt}">
${opt}
</label>`

})

})

html+=`

<button id="submitBtn"
onclick="submitTechnical()"
class="bg-green-500 px-4 py-2 mt-6 rounded">
Submit
</button>

<button id="nextBtn"
onclick="goHR()"
style="display:none"
class="bg-blue-500 px-4 py-2 mt-6 ml-4 rounded">
Next Section
</button>

`

document.getElementById("contentArea").innerHTML=html

}

// ---------------- SUBMIT TECHNICAL ----------------

async function submitTechnical(){

let answers=[]

currentQuestions.forEach((q,i)=>{

let selected=document.querySelector(`input[name="q${i}"]:checked`)
answers.push(selected?selected.value:null)

})

await fetch("http://127.0.0.1:5000/submit-technical",{

method:"POST",
headers:{"Content-Type":"application/json"},

body:JSON.stringify({
user_id:userId,
answers:answers,
questions:currentQuestions
})

})

document.getElementById("submitBtn").disabled=true
document.getElementById("nextBtn").style.display="inline-block"

}

function goHR(){

document.getElementById("hrBtn").disabled=false
loadHR()

}

// ---------------- HR ----------------

function startSpeech(id,btn){

let recognition=new webkitSpeechRecognition()

recognition.lang="en-US"

recognition.onresult=function(e){

document.getElementById(id).value+=
e.results[0][0].transcript+" "

}

recognition.start()

btn.disabled=true
btn.classList.replace("bg-purple-500","bg-gray-500")

}

async function loadHR(){

highlight("hrBtn")

let res=await fetch("http://127.0.0.1:5000/generate-hr")
let questions=await res.json()

currentQuestions=questions
hrCompleted=new Array(questions.length).fill(false)

let html="<h2 class='text-xl mb-4'>HR Interview</h2>"

questions.forEach((q,i)=>{

html+=`

<div class="mb-6 border-b pb-4">

<p class="mb-2 font-semibold">${i+1}. ${q.question}</p>

<textarea id="hr${i}"
readonly
class="w-full text-black p-2 mt-2"></textarea>

<div class="mt-2 flex gap-2">

<button onclick="startSpeech('hr${i}',this)"
class="bg-purple-500 px-3 py-1 rounded">
Speak
</button>

<button onclick="markHRDone(${i})"
class="bg-green-500 px-3 py-1 rounded">
Done
</button>

</div>

</div>

`

})

html+=`

<button id="submitBtn"
onclick="submitHR()"
style="display:none"
class="bg-green-500 px-4 py-2 mt-6 rounded">
Submit HR
</button>

<button id="nextBtn"
onclick="goJAM()"
style="display:none"
class="bg-blue-500 px-4 py-2 mt-6 ml-4 rounded">
Next Section
</button>

`

document.getElementById("contentArea").innerHTML=html

}

function markHRDone(i){

let box=document.getElementById(`hr${i}`)

if(box.value.trim()==""){
alert("Speak your answer first")
return
}

box.disabled=true

hrCompleted[i]=true

if(hrCompleted.every(v=>v===true)){
document.getElementById("submitBtn").style.display="inline-block"
}

}

async function submitHR(){

let answers=[]

currentQuestions.forEach((q,i)=>{
answers.push(document.getElementById(`hr${i}`).value)
})

await fetch("http://127.0.0.1:5000/submit-hr",{

method:"POST",
headers:{"Content-Type":"application/json"},

body:JSON.stringify({
user_id:userId,
answers:answers
})

})

document.getElementById("submitBtn").disabled=true
document.getElementById("nextBtn").style.display="inline-block"

}

function goJAM(){

document.getElementById("jamBtn").disabled=false
loadJAM()

}

// ---------------- JAM ----------------

async function loadJAM(){

highlight("jamBtn")

let res=await fetch("http://127.0.0.1:5000/generate-jam")
let data=await res.json()

let html=`

<h2 class="text-xl mb-4">JAM (Just A Minute)</h2>

<p class="font-semibold mb-2">Topic: ${data.topic}</p>

<textarea id="jamSpeech"
readonly
class="w-full text-black p-2 mt-3"></textarea>

<div class="mt-3 flex gap-2">

<button onclick="startJamSpeech(this)"
class="bg-purple-500 px-3 py-1 rounded">
Speak
</button>

<button onclick="markJamDone()"
class="bg-green-500 px-3 py-1 rounded">
Done
</button>

</div>

<button id="submitJamBtn"
onclick="submitJAM()"
style="display:none"
class="bg-yellow-500 px-4 py-2 mt-4 rounded">
Submit JAM
</button>

`

document.getElementById("contentArea").innerHTML=html

}

function startJamSpeech(btn){

let recognition=new webkitSpeechRecognition()

recognition.lang="en-US"

recognition.onresult=function(e){

document.getElementById("jamSpeech").value+=
e.results[0][0].transcript+" "

}

recognition.start()

btn.disabled=true
btn.classList.replace("bg-purple-500","bg-gray-500")

}

function markJamDone(){

let box=document.getElementById("jamSpeech")

if(box.value.trim()==""){
alert("Speak your answer first")
return
}

box.disabled=true

document.getElementById("submitJamBtn").style.display="inline-block"

}

async function submitJAM(){

let speech=document.getElementById("jamSpeech").value

await fetch("http://127.0.0.1:5000/submit-jam",{

method:"POST",
headers:{"Content-Type":"application/json"},

body:JSON.stringify({
user_id:userId,
speech:speech
})

})

alert("Assessment Completed")

location.href="result.html"

}

function submitAssessment(){
location.href="result.html"
}