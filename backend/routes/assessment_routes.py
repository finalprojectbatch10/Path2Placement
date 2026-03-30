from flask import Blueprint,request,jsonify
from pymongo import MongoClient
from ai.ai_generator import *

assessment_bp=Blueprint("assessment",__name__)

client=MongoClient("mongodb://localhost:27017/")
db=client["path2placement"]

attempts=db["attempts"]
gd_scores = db["gd_scores"]   # ✅ ADDED


# ---------------- GENERATE ----------------

@assessment_bp.route("/generate-aptitude")
def aptitude():
    return jsonify(generate_aptitude())


@assessment_bp.route("/generate-technical")
def technical():
    return jsonify(generate_technical())


@assessment_bp.route("/generate-hr")
def hr():
    return jsonify(generate_hr())


@assessment_bp.route("/generate-jam")
def jam():
    return jsonify(generate_jam())


# ---------------- SUBMIT APTITUDE ----------------

@assessment_bp.route("/submit-aptitude",methods=["POST"])
def submit_aptitude():

    data=request.json

    answers=data["answers"]
    questions=data["questions"]
    user=data["user_id"]

    score=0

    for i in range(len(questions)):

        if answers[i] and questions[i].get("answer"):
            if answers[i].strip().lower() == questions[i]["answer"].strip().lower():
                score += 1

    attempts.update_one(
        {"user_id":user},
        {"$set":{"aptitude_score":score}},
        upsert=True
    )

    return jsonify({"score":score})


# ---------------- SUBMIT TECHNICAL ----------------

@assessment_bp.route("/submit-technical",methods=["POST"])
def submit_technical():

    data=request.json

    answers=data["answers"]
    questions=data["questions"]
    user=data["user_id"]

    score=0

    for i in range(len(questions)):

        if answers[i] and questions[i].get("answer"):
            if answers[i].strip().lower() == questions[i]["answer"].strip().lower():
                score += 1

    attempts.update_one(
        {"user_id":user},
        {"$set":{"technical_score":score}},
        upsert=True
    )

    return jsonify({"score":score})


# ---------------- HR ----------------

@assessment_bp.route("/submit-hr",methods=["POST"])
def submit_hr():

    data=request.json

    answers=data["answers"]
    user=data["user_id"]

    result=evaluate_hr(answers)

    attempts.update_one(
        {"user_id":user},
        {"$set":{"hr_score":result["overall"]}},
        upsert=True
    )

    return jsonify(result)


# ---------------- JAM ----------------

@assessment_bp.route("/submit-jam",methods=["POST"])
def submit_jam():

    data=request.json

    speech=data["speech"]
    user=data["user_id"]

    result=evaluate_jam(speech)

    attempts.update_one(
        {"user_id":user},
        {"$set":{"jam_score":result["overall"]}},
        upsert=True
    )

    return jsonify(result)


# ---------------- FINAL REPORT ----------------

@assessment_bp.route("/final-report/<user>")
def final_report(user):

    data = attempts.find_one({"user_id": user}) or {}

    aptitude=data.get("aptitude_score",0)
    technical=data.get("technical_score",0)
    hr=data.get("hr_score",0)
    jam=data.get("jam_score",0)

    total=aptitude+technical+hr+jam

    return jsonify({
        "aptitude":aptitude,
        "technical":technical,
        "hr":hr,
        "jam":jam,
        "total":total
    })


# ================= PRI API =================

@assessment_bp.route("/get-pri/<user>")
def get_pri(user):

    attempt = attempts.find_one({"user_id": user}) or {}

    aptitude = attempt.get("aptitude_score", 0)
    technical = attempt.get("technical_score", 0)
    hr = attempt.get("hr_score", 0)
    jam = attempt.get("jam_score", 0)

    # -------- GET LATEST GD SCORE --------
    gd_data = gd_scores.find({"username": user}).sort("timestamp", -1).limit(1)

    gd_score = 0
    for g in gd_data:
        gd_score = g.get("overallScore", 0)

    # -------- NORMALIZE --------
    aptitude_per = (aptitude / 25) * 100
    technical_per = (technical / 15) * 100
    hr_per = (hr / 10) * 100
    jam_per = (jam / 10) * 100
    gd_per = gd_score

    # -------- PRI CALCULATION --------
    pri = (
        0.30 * technical_per +
        0.25 * aptitude_per +
        0.20 * hr_per +
        0.15 * gd_per +
        0.10 * jam_per
    )

    return jsonify({
        "pri": round(pri, 2)
    })