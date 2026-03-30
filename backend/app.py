from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from pymongo import MongoClient
from datetime import datetime

from routes.auth_routes import auth_bp
from routes.jam_routes import register_jam_routes
from routes.gd_routes import register_gd_events
from routes.assessment_routes import assessment_bp
from routes.hr_routes import hr_bp   # NEW

app = Flask(__name__)
app.config["SECRET_KEY"] = "p2p-secret"

CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")

# MongoDB Setup
client = MongoClient("mongodb://localhost:27017/")
db = client["path2placement"]

# Auth
app.register_blueprint(auth_bp)

# JAM
register_jam_routes(app, db)

# GD
register_gd_events(socketio, db)

# AI Assessment
app.register_blueprint(assessment_bp)

# HR Interview AI Route
app.register_blueprint(hr_bp)   # NEW

if __name__ == "__main__":
    socketio.run(app, debug=True)