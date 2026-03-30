from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from config.db import users_collection

auth_bp = Blueprint("auth", __name__)

# ---------------- REGISTER ----------------
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    email = data.get("email")
    name = data.get("name")
    password = data.get("password")

    # Validate required fields
    if not email or not name or not password:
        return jsonify({"message": "Missing fields"}), 400

    # Check if user exists
    if users_collection.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    # All users are students
    user = {
        "name": name,
        "email": email,
        "password": generate_password_hash(password),
        "role": "student"
    }

    users_collection.insert_one(user)

    return jsonify({
        "message": "Registration successful",
        "user": {
            "name": name,
            "email": email,
            "role": "student"
        }
    })


# ---------------- LOGIN ----------------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    # Validate
    if not email or not password:
        return jsonify({"message": "Missing fields"}), 400

    # Fetch student only
    user = users_collection.find_one({"email": email, "role": "student"})

    if not user:
        return jsonify({"message": "Invalid email or user"}), 401

    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Wrong password"}), 401

    return jsonify({
        "message": "Login successful",
        "name": user["name"],
        "role": "student"
    })