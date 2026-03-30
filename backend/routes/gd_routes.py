from flask_socketio import join_room
import random
import spacy
import textstat
import re
from datetime import datetime

nlp = spacy.load("en_core_web_sm")

rooms = {}

GD_TOPICS = [
    "Is AI replacing human jobs?",
    "Online education vs classroom education",
    "Social media: boon or bane?",
    "Should work from home be permanent?",
    "Is India ready for electric vehicles?"
]


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

    return {
        "fluency": fluency,
        "grammar": grammar,
        "vocabulary": vocabulary,
        "confidence": confidence,
        "overallScore": overall
    }


def register_gd_events(socketio, db):

    gd_collection = db["gd_scores"]

    @socketio.on("create_room")
    def handle_create_room(data):
        room = data["room"]
        user = data["user"]

        topic = random.choice(GD_TOPICS)

        rooms[room] = {
            "users": [user],
            "host": user,
            "topic": topic,
            "current_speaker": None,
            "time_left": 300,
            "started": False,
            "speeches": {}
        }

        join_room(room)

        socketio.emit("room_update", {
            "users": rooms[room]["users"],
            "topic": topic,
            "host": user
        }, room=room)


    @socketio.on("join_room")
    def handle_join_room(data):
        room = data["room"]
        user = data["user"]

        if room not in rooms:
            return

        if user not in rooms[room]["users"]:
            rooms[room]["users"].append(user)

        join_room(room)

        socketio.emit("room_update", {
            "users": rooms[room]["users"],
            "topic": rooms[room]["topic"],
            "host": rooms[room]["host"]
        }, room=room)


    @socketio.on("start_gd")
    def handle_start(data):
        room = data["room"]

        if room not in rooms:
            return

        rooms[room]["started"] = True
        rooms[room]["time_left"] = 300
        rooms[room]["current_speaker"] = None

        socketio.emit("gd_started", room=room)

        def countdown(room_name):
            while rooms.get(room_name) and rooms[room_name]["time_left"] > 0:
                socketio.sleep(1)
                rooms[room_name]["time_left"] -= 1

                socketio.emit(
                    "timer_update",
                    rooms[room_name]["time_left"],
                    room=room_name
                )

            # 🔥 GD FINISHED
            if room_name in rooms:
                results = {}
                topic = rooms[room_name]["topic"]

                for user, speech in rooms[room_name]["speeches"].items():

                    score = evaluate_speech(speech)
                    results[user] = score

                    # 🔥 UPDATE OR INSERT (MOST RECENT ONLY)
                    gd_collection.update_one(
                        {"username": user, "module": "GD"},
                        {
                            "$set": {
                                "username": user,
                                "module": "GD",
                                "topic": topic,
                                "fluency": score["fluency"],
                                "grammar": score["grammar"],
                                "vocabulary": score["vocabulary"],
                                "confidence": score["confidence"],
                                "overallScore": score["overallScore"],
                                "timestamp": datetime.utcnow()
                            }
                        },
                        upsert=True  # creates if not exists
                    )

                socketio.emit("gd_results", results, room=room_name)

        socketio.start_background_task(countdown, room)


    @socketio.on("request_speak")
    def request_speak(data):
        room = data["room"]
        user = data["user"]

        if room not in rooms:
            return

        if not rooms[room]["started"]:
            return

        if rooms[room]["current_speaker"] is None:
            rooms[room]["current_speaker"] = user

            socketio.emit("speaker_update", {
                "speaker": user
            }, room=room)


    @socketio.on("done_speaking")
    def done_speaking(data):
        room = data["room"]
        user = data["user"]
        speech = data.get("speech", "")

        if room not in rooms:
            return

        if rooms[room]["current_speaker"] == user:
            rooms[room]["current_speaker"] = None

            if user not in rooms[room]["speeches"]:
                rooms[room]["speeches"][user] = speech
            else:
                rooms[room]["speeches"][user] += " " + speech

            socketio.emit("speaker_update", {
                "speaker": None
            }, room=room)