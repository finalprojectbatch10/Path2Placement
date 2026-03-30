from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["path2placement"]

users_collection = db["users"]