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
ratings_collection = db['ratings']

TMDB_BASE_URL = "https://api.themoviedb.org/3"

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

    for logged_movie_id in logged_movies:
        response = requests.get(
            f"{TMDB_BASE_URL}/movie/{logged_movie_id}/recommendations",
            params={"api_key": TMDB_API_KEY, "language": "en-US", "page": 1},
        )

        if response.status_code == 200:
            recommended_movies = response.json().get("results", [])

            for recommended_movie in recommended_movies:
                rec_movie_id = recommended_movie["id"]

                if (
                    rec_movie_id not in logged_movies
                    and rec_movie_id not in watchlist_movies
                    and not recommended_movie.get("adult", False)
                ):
                    movie_details = requests.get(
                        f"{TMDB_BASE_URL}/movie/{rec_movie_id}",
                        params={"api_key": TMDB_API_KEY, "append_to_response": "credits"}
                    )

                    if movie_details.status_code == 200:
                        movie_data = movie_details.json()

                        if movie_data.get("runtime", 0) >= 70:
                            director = next(
                                (crew["name"] for crew in movie_data.get("credits", {}).get("crew", [])
                                 if crew.get("job") == "Director"),
                                "Unknown"
                            )

                            input_genres = {genre["id"] for genre in movie_data.get("genres", [])}
                            input_country = (
                                                movie_data.get("production_countries", [{}])[0].get("iso_3166_1")
                                                if movie_data.get("production_countries") 
                                                else None
                                            )

                            input_language = movie_data.get("original_language")

                            score = (
                                2 if input_genres & {genre["id"] for genre in recommended_movie.get("genres", [])} else 0
                            ) + (
                                1 if input_country == recommended_movie.get("production_countries", [{}])[0].get("iso_3166_1") else 0
                            ) + (
                                1 if input_language == recommended_movie.get("original_language") else 0
                            )

                            if score > 0:
                                recommendations.append({
                                    "id": rec_movie_id,
                                    "title": movie_data.get("title", "Untitled"),
                                    "poster": movie_data.get("poster_path"),
                                    "release_date": movie_data.get("release_date", "N/A"),
                                    "director": director,
                                    "rating": movie_data.get("vote_average", "N/A")
                                })

    unique_recommendations = {movie['id']: movie for movie in recommendations}.values()
    final_recommendations = list(unique_recommendations)[:15]

    return jsonify({"recommendations": final_recommendations}), 200

@app.route('/rate_movie', methods=['POST'])
def rate_movie():
    data = request.json
    username = data.get('username')
    movie_id = data.get('movie_id')
    rating = data.get('rating')
    review = data.get('review', '')

    if not username or not movie_id or not rating:
        return jsonify({"error": "Missing required fields"}), 400

    ratings_collection.update_one(
        {"username": username, "movie_id": movie_id},
        {"$set": {"rating": rating, "review": review}},
        upsert=True
    )

    return jsonify({"message": "Rating submitted successfully"})

@app.route('/get_user_rating', methods=['POST'])
def get_user_rating():
    try:
        data = request.json
        username = data.get('username')
        movie_id = data.get('movie_id')

        if not username or not movie_id:
            return jsonify({"error": "Invalid data"}), 400

        user_rating = ratings_collection.find_one({"username": username, "movie_id": movie_id})
        return jsonify({"rating": user_rating['rating'] if user_rating else 0})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/delete_rating', methods=['POST'])
def delete_rating():
    try:
        data = request.json
        username = data.get('username')
        movie_id = data.get('movie_id')

        if not username or not movie_id:
            return jsonify({"error": "Invalid data"}), 400

        result = ratings_collection.delete_one({"username": username, "movie_id": movie_id})

        if result.deleted_count == 0:
            return jsonify({"error": "Rating not found"}), 404

        return jsonify({"message": "Rating deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/add_review', methods=['POST'])
def add_review():
    data = request.json
    username = data.get("username")
    movie_id = data.get("movie_id")
    rating = data.get("rating")
    review = data.get("review")

    if not movie_id or not username or not review:
        return jsonify({"error": "Missing required fields"}), 400

    review_data = {
        "username": username,
        "movie_id": movie_id,
        "rating": rating,
        "review": review
    }

    ratings_collection.update_one(
        {"username": username, "movie_id": movie_id},
        {"$set": review_data},
        upsert=True
    )
    return jsonify({"message": "Review added successfully"}), 201

@app.route('/delete_review', methods=['DELETE'])
def delete_review():
    data = request.json
    username = data.get("username")
    movie_id = data.get("movie_id")

    if not movie_id or not username:
        return jsonify({"error": "Missing required fields"}), 400

    ratings_collection.update_one(
        {"movie_id": movie_id, "username": username}, 
        {"$set": {"review": ""}}
    )

    return jsonify({"message": "Review deleted successfully"}), 200

@app.route('/get_reviews/<movie_id>', methods=['GET'])
def get_reviews(movie_id):
    reviews = list(ratings_collection.find({"movie_id": movie_id}, {"_id": 0}))
    print(reviews)
    return jsonify(reviews), 200

@app.route('/get_review', methods=['GET'])
def get_review_by_user():
    username = request.args.get("username")
    movie_id = request.args.get("movie_id")

    if not username or not movie_id:
        return jsonify({"error": "Username and Movie ID are required"}), 400

    review = ratings_collection.find_one({"username": username, "movie_id": movie_id})

    if review:
        print(review)
        print(review.get("review"))
        return jsonify({"review": review.get("review")})
    else:
        return jsonify({"review": None})
    
@app.route('/edit-review', methods=['PUT'])
def edit_review():
    data = request.get_json()
    username = data.get("username")
    movie_id = data.get("movie_id")
    new_review = data.get("review")

    if not movie_id or not username or not new_review:
        return jsonify({"error": "Invalid data"}), 400

    ratings_collection.update_one(
        {"username": username, "movie_id": movie_id},
        {"$set": {"review": new_review}}
    )
    
    return jsonify({"message": "Review updated successfully"}), 200

@app.route('/')
def home():
    return "Welcome to the Movie Vault API!"

if __name__ == '__main__':
    app.run(debug=True, port=8000, use_reloader=False)
    