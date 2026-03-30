from flask import Blueprint, request, jsonify
import spacy
import textstat

hr_bp = Blueprint("hr", __name__)

# Load spaCy model
nlp = spacy.load("en_core_web_sm")


@hr_bp.route("/analyze-hr", methods=["POST"])
def analyze_hr():

    data = request.json
    speech = data.get("speech")

    if not speech:
        return jsonify({"error": "No speech text received"}), 400

    doc = nlp(speech)

    # -------- NLP METRICS --------
    words = len([token for token in doc if token.is_alpha])
    sentences = len(list(doc.sents))

    nouns = len([token for token in doc if token.pos_ == "NOUN"])
    verbs = len([token for token in doc if token.pos_ == "VERB"])

    # -------- READABILITY --------
    readability = textstat.flesch_reading_ease(speech)
    grade = textstat.flesch_kincaid_grade(speech)

    # -------- FILLER WORDS --------
    fillers = ["um", "uh", "like", "actually", "basically"]
    filler_count = 0

    for f in fillers:
        filler_count += speech.lower().count(f)

    # -------- SCORING --------
    score = 0

    if words > 40:
        score += 25

    if sentences > 2:
        score += 25

    if nouns > 5 and verbs > 5:
        score += 25

    if filler_count < 3:
        score += 25

    # -------- FEEDBACK --------
    if score >= 80:
        feedback = "Excellent answer with clear explanation and structure."
    elif score >= 60:
        feedback = "Good answer. Try adding more examples."
    else:
        feedback = "Answer needs more clarity and detail."

    return jsonify({
        "words": words,
        "sentences": sentences,
        "nouns": nouns,
        "verbs": verbs,
        "readability": round(readability, 2),
        "grade_level": round(grade, 2),
        "filler_words": filler_count,
        "score": score,
        "feedback": feedback
    })