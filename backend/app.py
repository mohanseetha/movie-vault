from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import bcrypt
import jwt
import datetime
import os

import requests

app = Flask(__name__)
CORS(app)


SECRET_KEY = os.getenv("SECRET_KEY")
MONGO_URI = os.getenv("MONGO_URI")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client['movie_db']
users_collection = db['users']

TMDB_BASE_URL = "https://api.themoviedb.org/3"

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

@app.route('/proxy/tmdb/<path:subpath>', methods=['GET'])
def proxy_tmdb(subpath):
    print(f"Incoming request for: {subpath}")
    url = f"{TMDB_BASE_URL}/{subpath}"
    params = request.args.to_dict()
    params['api_key'] = TMDB_API_KEY
    print(f"URL: {url} | Params: {params}")
    response = requests.get(url, params=params)
    print(f"Response status: {response.status_code}")
    return jsonify(response.json()), response.status_code

def get_user(username):
    return users_collection.find_one({"username": username})

def update_user_list(username, list_name, movie_id, action):
    if action == "add":
        users_collection.update_one({"username": username}, {"$addToSet": {list_name: movie_id}})
    elif action == "remove":
        users_collection.update_one({"username": username}, {"$pull": {list_name: movie_id}})
        
def fetch_director(movie_id):
    response = requests.get(
        f"{TMDB_BASE_URL}/movie/{movie_id}",
        params={"api_key": TMDB_API_KEY, "append_to_response": "credits"},
    )
    if response.status_code == 200:
        credits = response.json().get("credits", {})
        director = next(
            (member["name"] for member in credits.get("crew", []) if member["job"] == "Director"),
            "Unknown"
        )
        return director
    return "Unknown"
    
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    required_fields = ['name', 'username', 'mail', 'password']

    if not all(field in data for field in required_fields):
        return jsonify({"error": "All fields are required"}), 400

    if users_collection.find_one({"username": data['username']}):
        return jsonify({"error": "Username already exists"}), 409

    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    data['password'] = hashed_password.decode('utf-8')
    data['logged'] = []
    data['watchlist'] = []
    del data['confirmPassword']
    
    try:
        users_collection.insert_one(data)
    except Exception as e:
        return jsonify({"error": f"Failed to insert user: {str(e)}"}), 500

    user = get_user(data['username'])
    
    if not user:
        return jsonify({"error": "User not found after registration"}), 500

    user["_id"] = str(user["_id"])

    token = jwt.encode(
        {"user_id": str(user['_id']), "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=3)},
        SECRET_KEY,
        algorithm="HS256"
    )
    
    return jsonify({"message": "User registered successfully", "token": token, "user": user}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    required_fields = ['user', 'password']

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Username/Email and Password are required"}), 400

    user = users_collection.find_one({
        "$or": [{"username": data['user']}, {"mail": data['user']}]
    })

    if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {"user_id": str(user['_id']), "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=3)},
        SECRET_KEY,
        algorithm="HS256"
    )
    return jsonify({"message": "Login successful", "token": token}), 200

@app.route('/add_logged_movie', methods=['POST'])
def add_logged_movie():
    data = request.json
    username = data.get('username')
    movie_id = data.get('movie_id')

    if not username or not movie_id:
        return jsonify({"error": "Username and movie ID are required"}), 400

    user = get_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    update_user_list(username, "watchlist", movie_id, "remove")
    update_user_list(username, "logged", movie_id, "add")

    return jsonify({"message": "Movie logged successfully"}), 200

@app.route('/add_to_watchlist', methods=['POST'])
def add_to_watchlist():
    data = request.json
    username = data.get('username')
    movie_id = data.get('movie_id')

    if not username or not movie_id:
        return jsonify({"error": "Username and movie ID are required"}), 400

    user = get_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    update_user_list(username, "logged", movie_id, "remove")
    update_user_list(username, "watchlist", movie_id, "add")

    return jsonify({"message": "Movie added to watchlist successfully"}), 200

@app.route('/get_logged', methods=['GET'])
def get_logged():
    username = request.args.get('username')
    user = get_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"logged": user.get('logged', [])}), 200

@app.route('/get_watchlist', methods=['GET'])
def get_watchlist():
    username = request.args.get('username')
    user = get_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"watchlist": user.get('watchlist', [])}), 200

@app.route('/remove_from_watchlist', methods=['PUT'])
def remove_from_watchlist():
    username = request.args.get('username')
    movie_id = request.args.get('movie_id')

    if movie_id not in get_user(username).get('watchlist', []):
        return jsonify({"error": "Movie not in watchlist"}), 400

    update_user_list(username, "watchlist", movie_id, "remove")
    return jsonify({"message": "Movie removed from watchlist successfully"}), 200

@app.route('/remove_from_logged', methods=['PUT'])
def remove_from_logged():
    username = request.args.get('username')
    movie_id = request.args.get('movie_id')

    if movie_id not in get_user(username).get('logged', []):
        return jsonify({"error": "Movie not in logged list"}), 400

    update_user_list(username, "logged", movie_id, "remove")
    return jsonify({"message": "Movie removed from logged movies successfully"}), 200

@app.route("/recommended-movies", methods=["POST"])
def get_recommended_movies():
    data = request.json
    username = data.get("username")

    if not username:
        return jsonify({"error": "Username is required"}), 400

    user_data = users_collection.find_one(
        {"username": username},
        {"logged": 1, "watchlist": 1}
    )

    if not user_data:
        return jsonify({"recommendations": []})

    logged_movies = set(user_data.get("logged", []))
    watchlist_movies = set(user_data.get("watchlist", []))

    if not logged_movies:
        return jsonify({"recommendations": []})

    recommendations = []

    for movie_id in logged_movies:
        response = requests.get(
            f"{TMDB_BASE_URL}/movie/{movie_id}/recommendations",
            params={"api_key": TMDB_API_KEY, "language": "en-US", "page": 1},
        )

        if response.status_code == 200:
            recommended_movies = response.json().get("results", [])[:5]

            for movie in recommended_movies:
                movie_id = movie["id"]

                if (
                    movie_id not in logged_movies
                    and movie_id not in watchlist_movies
                    and movie.get("vote_average", 0) < 10
                ):
                    recommendations.append({
                        "id": movie_id,
                        "title": movie["title"],
                        "poster": movie.get("poster_path"),
                        "release_date": movie.get("release_date", "N/A"),
                        "director": fetch_director(movie_id),
                        "rating": movie.get("vote_average", "N/A")
                    })

    unique_recommendations = {movie['id']: movie for movie in recommendations}.values()
    sorted_recommendations = sorted(
        unique_recommendations, key=lambda x: x["rating"], reverse=True
    )[:15]

    return jsonify({"recommendations": sorted_recommendations}), 200

@app.route('/')
def home():
    return "Welcome to the Movie Vault API!"

if __name__ == '__main__':
    app.run(debug=True, port=8000, use_reloader=False)
    