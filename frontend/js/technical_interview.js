/* ================= QUESTION BANK ================= */

let questionBank = [

{q:"What does HTML stand for?",topic:"Web",
options:["Hyper Text Markup Language","High Text Machine Language","Hyper Tool Markup Language","Home Tool Markup"],correct:0},

{q:"What is CSS used for?",topic:"Web",
options:["Styling web pages","Database management","Operating systems","Networking"],correct:0},

{q:"Which language runs in the browser?",topic:"Web",
options:["JavaScript","Python","Java","C++"],correct:0},

{q:"Which HTML tag creates hyperlink?",topic:"Web",
options:["<a>","<link>","<url>","<href>"],correct:0},

{q:"Which symbol starts JS comment?",topic:"Programming",
options:["//","#","<!-- -->","**"],correct:0},

{q:"Which tag inserts image?",topic:"Web",
options:["<img>","<image>","<src>","<picture>"],correct:0},

{q:"Which keyword declares variable in JS?",topic:"Programming",
options:["let","define","int","varname"],correct:0},

{q:"Which company created Java?",topic:"Programming",
options:["Sun Microsystems","Google","IBM","Microsoft"],correct:0},

{q:"Which tag creates paragraph?",topic:"Web",
options:["<p>","<para>","<pg>","<text>"],correct:0},

{q:"Which database is NoSQL?",topic:"Database",
options:["MongoDB","MySQL","Oracle","PostgreSQL"],correct:0},

{q:"What is OOP?",topic:"Programming",
options:["Programming using objects","Database structure","OS concept","Hardware concept"],correct:0},

{q:"Which is OOP pillar?",topic:"Programming",
options:["Encapsulation","Compilation","Execution","Loading"],correct:0},

{q:"Which SQL command retrieves data?",topic:"Database",
options:["SELECT","DELETE","DROP","UPDATE"],correct:0},

{q:"FIFO structure?",topic:"DSA",
options:["Queue","Stack","Tree","Graph"],correct:0},

{q:"LIFO structure?",topic:"DSA",
options:["Stack","Queue","Array","List"],correct:0},

{q:"Console output in JS?",topic:"Programming",
options:["console.log()","print()","echo()","display()"],correct:0},

{q:"HTML table row?",topic:"Web",
options:["<tr>","<td>","<row>","<table>"],correct:0},

{q:"Which is relational DB?",topic:"Database",
options:["MySQL","MongoDB","Redis","Cassandra"],correct:0},

{q:"Binary search complexity?",topic:"DSA",
options:["O(log n)","O(n)","O(n²)","O(1)"],correct:0},

{q:"Fastest average sorting?",topic:"DSA",
options:["Quick Sort","Bubble Sort","Selection Sort","Insertion Sort"],correct:0},

{q:"Which layer handles routing?",topic:"Networks",
options:["Network","Transport","Application","Session"],correct:0},

{q:"Shortest path algorithm?",topic:"DSA",
options:["Dijkstra","DFS","Merge","Bubble"],correct:0},

{q:"Partial dependency removed in?",topic:"Database",
options:["2NF","1NF","3NF","BCNF"],correct:0}

]

/* ================= SETTINGS ================= */

const TOTAL_QUESTIONS = 20

let shuffledQuestions = []
let index = 0
let score = 0
let topicStats = {}

/* ================= SHUFFLE FUNCTION ================= */

function shuffle(array){

for(let i=array.length-1;i>0;i--){

let j=Math.floor(Math.random()*(i+1))

;[array[i],array[j]]=[array[j],array[i]]

}

return array

}

/* ================= START TEST ================= */

function startTest(){

shuffledQuestions = shuffle([...questionBank]).slice(0,TOTAL_QUESTIONS)

loadQuestion()

}

startTest()

/* ================= LOAD QUESTION ================= */

function loadQuestion(){

let q = shuffledQuestions[index]

document.getElementById("progress").innerText =
`Question ${index+1} of ${TOTAL_QUESTIONS}`

shuffle(q.options)

document.getElementById("questionBox").innerHTML =

`<p class="font-semibold mb-4">${q.q}</p>` +

q.options.map((o,i)=>`

<label class="block mb-3 cursor-pointer flex items-center gap-2">
<input type="radio" name="answer" value="${i}">
<span>${o.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</span>
</label>

`).join("")

}

/* ================= NEXT QUESTION ================= */

function nextQuestion(){

let selected = document.querySelector("input[name='answer']:checked")

if(!selected){

alert("Please select an answer")

return

}

let q = shuffledQuestions[index]

let answer = +selected.value

let correctAnswer = q.options.indexOf(questionBank.find(x=>x.q===q.q).options[q.correct])

if(!topicStats[q.topic]){
topicStats[q.topic]={correct:0,total:0}
}

topicStats[q.topic].total++

if(answer === correctAnswer){

score++
topicStats[q.topic].correct++

}

index++

if(index < TOTAL_QUESTIONS){

loadQuestion()

}else{

showResult()

}

}

/* ================= RESULT ================= */

function showResult(){

let percent=((score/TOTAL_QUESTIONS)*100).toFixed(1)

let strengths=[]
let weaknesses=[]

for(let topic in topicStats){

let data=topicStats[topic]

let p=(data.correct/data.total)*100

if(p>=60) strengths.push(topic)
else weaknesses.push(topic)

}

document.querySelector("section").innerHTML =

`
<div class="bg-gray-900 border border-gray-800 rounded-xl p-8">

<h2 class="text-2xl font-bold mb-4 text-center">Interview Report</h2>

<p class="mb-2 text-center">Score: <b>${score}/${TOTAL_QUESTIONS}</b></p>
<p class="mb-6 text-center">Percentage: <b>${percent}%</b></p>

<div class="mb-4">
<h3 class="font-semibold text-lime-400">Strengths</h3>
<p>${strengths.length?strengths.join(", "):"None identified"}</p>
</div>

<div>
<h3 class="font-semibold text-red-400">Areas to Improve</h3>
<p>${weaknesses.length?weaknesses.join(", "):"Great performance!"}</p>
</div>

<div class="text-center mt-6">
<button onclick="location.reload()"
class="bg-lime-400 text-black px-6 py-2 rounded-lg font-semibold">
Try Again
</button>
</div>

</div>
`

}