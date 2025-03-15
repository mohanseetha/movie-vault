from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
from pymongo import MongoClient # type: ignore
import bcrypt # type: ignore
import jwt # type: ignore
import datetime
import os
from recommendation.model import get_recommendations
import requests # type: ignore

app = Flask(__name__)
CORS(app)

SECRET_KEY = os.getenv("SECRET_KEY")
MONGO_URI = os.getenv("MONGO_URI")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

client = MongoClient(MONGO_URI)
db = client['movie_db']
users_collection = db['users']

TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

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

def fetch_movie_details(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}"
    try:
        response = requests.get(url)
        response.raise_for_status()  
        movie_data = response.json()
        return {
            "id": str(movie_data.get("id")),
            "title": movie_data.get("title", "Unknown Title"),
            "rating": movie_data.get("vote_average", 0),
            "poster": movie_data.get("poster_path"),
            "overview": movie_data.get("overview", "")
        }
    except requests.exceptions.HTTPError as err:
        print(f"HTTP error for movie ID {movie_id}: {err}")
    except requests.exceptions.RequestException as e:
        print(f"Error fetching movie details for ID {movie_id}: {e}")
    return None

def fetch_multiple_movie_details(movie_ids):
    movies = []
    for movie_id in movie_ids:
        movie_data = fetch_movie_details(movie_id)
        if movie_data:
            movies.append(movie_data)
    return movies

def sort_recommendations(recommendations):
    return sorted(recommendations, key=lambda x: x.get("rating", 0), reverse=True)[:10]

@app.route('/recommendations', methods=['POST'])
def recommendations():
    try:
        data = request.get_json()
        if not data or 'movie' not in data:
            return jsonify({"error": "Invalid or missing JSON data"}), 400
        
        movie = data.get('movie')
        if not movie or not movie.get('title'):
            return jsonify({"error": "Missing movie title"}), 400

        recommendations = get_recommendations(movie)
        return jsonify(recommendations)

    except Exception as e:
        print(f"Error in /recommendations route: {e}")
        return jsonify({"error": str(e)}), 500
    
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

    user_data = users_collection.find_one({"username": username}, {"logged": 1})

    if not user_data or "logged" not in user_data:
        return jsonify({"recommendations": []})

    logged_movies = user_data["logged"]
    logged_movie_details = fetch_multiple_movie_details(logged_movies)

    recommendations = []
    for movie_data in logged_movie_details:
        recommended_ids = get_recommendations(movie_data, top_n=5)
        recommendations.extend(fetch_multiple_movie_details(recommended_ids))

    unique_recommendations = {str(rec["id"]): rec for rec in recommendations}.values()
    sorted_recommendations = sort_recommendations(unique_recommendations)
    
    return jsonify({"recommendations": sorted_recommendations}), 200

if __name__ == '__main__':
    app.run(debug=True, port=8000)
    