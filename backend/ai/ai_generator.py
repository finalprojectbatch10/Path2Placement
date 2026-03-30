from groq import Groq
import json
import re
import random
import uuid
import spacy
import textstat
import os
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
nlp = spacy.load("en_core_web_sm")


# ---------------- JSON CLEANER ----------------

def clean_json(text):

    try:
        match = re.search(r"\[.*\]", text, re.DOTALL)

        if not match:
            return []

        data = json.loads(match.group())

        cleaned=[]

        for q in data:

            if "question" not in q:
                continue

            if "options" not in q or "answer" not in q:
                continue

            options=list(dict.fromkeys(q["options"]))

            if q["answer"] not in options:
                options.append(q["answer"])

            options=options[:4]

            cleaned.append({
                "question":q["question"],
                "options":options,
                "answer":q["answer"]
            })

        random.shuffle(cleaned)

        return cleaned

    except:
        return []


# ---------------- ASK AI ----------------

def ask_ai(prompt):

    seed=random.randint(1,100000)

    final_prompt=f"""
{prompt}

Generate a fresh new set of questions.
Random seed: {seed}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role":"user","content":final_prompt}],
        temperature=0.9
    )

    text=response.choices[0].message.content

    return clean_json(text)


# ---------------- APTITUDE ----------------

def generate_aptitude():

    prompt = """
Generate 25 MCQ aptitude questions.

The questions MUST cover ALL these topics:

- Quantitative Aptitude (8 questions)
- Logical Reasoning (7 questions)
- Verbal Ability (7 questions)
- Data Interpretation (3 questions)

Rules:
- Exactly 4 options
- Answer must match one option
- Questions must be text based
- Do NOT refer to tables, graphs, figures, or diagrams
Return JSON ONLY:

[
{
"question":"",
"options":["","","",""],
"answer":""
}
]
"""

    questions = ask_ai(prompt)

    random.shuffle(questions)

    return questions[:25]


# ---------------- TECHNICAL ----------------

def generate_technical():

    prompt = """
Generate 15 MCQ technical questions.

The questions must cover ALL these topics:

- Python (3 questions)
- DBMS (3 questions)
- Operating Systems (3 questions)
- Computer Networks (3 questions)
- Data Structures (3 questions)

Rules:
- Exactly 4 options
- Answer must match one option
- Questions must be mixed from all topics

Return JSON ONLY:

[
{
"question":"",
"options":["","","",""],
"answer":""
}
]
"""

    questions = ask_ai(prompt)

    random.shuffle(questions)

    return questions[:15]


# ---------------- HR QUESTIONS ----------------

def generate_hr():

    questions_pool=[

    "Tell me about yourself",
    "Why should we hire you",
    "What are your strengths",
    "What is your biggest weakness",
    "Where do you see yourself in five years",
    "Tell me about a challenge you faced",
    "Describe a time you worked in a team",
    "How do you handle pressure",
    "Why do you want to join our company",
    "Tell me about a failure you experienced"

    ]

    random.shuffle(questions_pool)

    selected=questions_pool[:4]

    return [{"question":q} for q in selected]


# ---------------- JAM TOPIC ----------------

def generate_jam():

    topics=[

    "Impact of Artificial Intelligence",
    "Social Media and Youth",
    "Online Education vs Classroom",
    "Importance of Time Management",
    "Future of Technology",
    "Role of AI in Education",
    "Work From Home Culture",
    "Digital Privacy",
    "Climate Change Awareness",
    "Future of Startups"

    ]

    return {"topic":random.choice(topics)}


# ---------------- HR EVALUATION ----------------

def evaluate_hr(answers):

    text=" ".join(answers)

    doc=nlp(text)

    words=len([t for t in doc if t.is_alpha])
    nouns=len([t for t in doc if t.pos_=="NOUN"])
    verbs=len([t for t in doc if t.pos_=="VERB"])

    readability=textstat.flesch_reading_ease(text)

    # ✅ NEW DYNAMIC SCORING
    score = (
        words * 0.5 +
        nouns * 1.5 +
        verbs * 1.5 +
        readability * 0.8 +
        random.randint(0,10)
    )

    score = max(0, min(100, int(score)))

    return {"score":score,"overall":int(score/10)}


# ---------------- JAM EVALUATION ----------------

def evaluate_jam(text):

    doc=nlp(text)

    words=len([t for t in doc if t.is_alpha])
    nouns=len([t for t in doc if t.pos_=="NOUN"])
    verbs=len([t for t in doc if t.pos_=="VERB"])

    readability=textstat.flesch_reading_ease(text)

    # ✅ NEW DYNAMIC SCORING
    score = (
        words * 0.5 +
        nouns * 1.5 +
        verbs * 1.5 +
        readability * 0.8 +
        random.randint(0,10)
    )

    score = max(0, min(100, int(score)))

    return {"score":score,"overall":int(score/10)}