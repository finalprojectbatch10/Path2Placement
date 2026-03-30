from flask import Blueprint, request, jsonify
import spacy
import textstat
import re
from datetime import datetime

nlp = spacy.load("en_core_web_sm")

def register_jam_routes(app, db):

    jam_bp = Blueprint("jam", __name__)

    jam_collection = db["jam_scores"]

    # ----------------------------
    # SPEECH EVALUATION FUNCTION
    # ----------------------------
    def evaluate_speech(speech):

        doc = nlp(speech)

        words = [t.text.lower() for t in doc if t.is_alpha]
        word_count = len(words)
        unique_words = len(set(words))

        fillers = ["uh", "um", "like", "you know", "actually"]

        filler_count = sum(
            len(re.findall(rf"\b{f}\b", speech.lower()))
            for f in fillers
        )

        fluency = max(1, min(10, 10 - filler_count))
        grammar = max(1, min(10, int(textstat.flesch_reading_ease(speech) / 10)))
        vocabulary = max(1, min(10, unique_words // 6))
        confidence = max(1, min(10, word_count // 15))

        overall = int((fluency + grammar + vocabulary + confidence) / 40 * 100)

        feedback = []

        if filler_count > 3:
            feedback.append("Try reducing filler words.")

        if word_count < 80:
            feedback.append("Speak longer to show confidence.")

        if not feedback:
            feedback.append("Good fluency and confidence!")

        return {
            "fluency": fluency,
            "grammar": grammar,
            "vocabulary": vocabulary,
            "confidence": confidence,
            "overallScore": overall,
            "feedback": " ".join(feedback)
        }

    # ----------------------------
    # JAM API
    # ----------------------------
    @jam_bp.route("/analyze-jam", methods=["POST"])
    def analyze_jam():

        data = request.get_json()

        speech = data.get("speech", "")
        username = data.get("username", "")
        topic = data.get("topic", "")

        if not speech:
            return jsonify({"error": "No speech detected"}), 400

        if not username:
            return jsonify({"error": "Username missing"}), 400

        score = evaluate_speech(speech)

        # ----------------------------
        # SAVE / UPDATE IN MONGODB
        # ----------------------------
        jam_collection.update_one(
            {"username": username, "module": "JAM"},
            {
                "$set": {
                    "username": username,
                    "module": "JAM",
                    "topic": topic,
                    "fluency": score["fluency"],
                    "grammar": score["grammar"],
                    "vocabulary": score["vocabulary"],
                    "confidence": score["confidence"],
                    "overallScore": score["overallScore"],
                    "feedback": score["feedback"],
                    "timestamp": datetime.utcnow()
                }
            },
            upsert=True
        )

        return jsonify({
            "analysis": score
        })

    app.register_blueprint(jam_bp)