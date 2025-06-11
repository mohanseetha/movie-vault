# Movie Vault Backend

A modular backend for a modern movie management and discovery platform.

## Repository Contents

This repository contains the backend codebase for Movie Vault, built with Node.js, Express, and MongoDB. It provides user authentication, movie data proxying, ratings, watchlist management, and personalized recommendations.

## Tech Stack

* **Node.js** (v18+)
* **Express.js**
* **MongoDB** (NoSQL database)
* **JWT** (JSON Web Token) for authentication
* **Axios** (for TMDB API proxying)
* **dotenv** (for environment variables)

## Getting Started

1.  **Clone the Repository**
    ```
    git clone https://github.com/mohanseetha/movie-vault.git
    cd movie-vault/backend
    ```

2.  **Configure MongoDB and Environment Variables**
    Create a `.env` file in the `backend` directory with the following:
    ```
    PORT=8000
    MONGODB_URI=mongodb://localhost:27017/movie-vault
    JWT_SECRET=your_jwt_secret
    TMDB_API_KEY=your-api-key
    ALLOWED_ORIGIN=http://localhost:5173
    ```
    Adjust values as needed for your environment.

3.  **Install Dependencies**
    ```
    npm install
    ```

4.  **Run the Backend Server**
    ```
    nodemon server
    ```
    The server will be available at `http://localhost:8000`.

## API Endpoints

All endpoints (except `/api/auth/signup` and `/api/auth/login`) require a valid JWT token in the `Authorization` header.

### Auth Endpoints

| Method | Endpoint               | Description        | Body                       |
| :----- | :--------------------- | :----------------- | :------------------------- |
| `POST` | `/api/auth/signup`     | Register a new user| `{ username, email, password }` |
| `POST` | `/api/auth/login`      | Login and receive JWT| `{ username, password }`    |

### Movie Endpoints

| Method | Endpoint                  | Description                     | Params/Body      |
| :----- | :------------------------ | :------------------------------ | :--------------- |
| `GET`  | `/api/movies/proxy/tmdb/*`| Proxy requests to TMDB API (search, details)| TMDB API path/query |

### Ratings Endpoints

| Method | Endpoint                          | Description          | Body/Params              |
| :----- | :-------------------------------- | :------------------- | :----------------------- |
| `POST` | `/api/ratings/add-rating`         | Add a rating for a movie (auth)| `{ movie_id, rating, review }` |
| `PUT`  | `/api/ratings/edit-rating`        | Edit a rating (auth) | `{ rating_id, rating, review }` |
| `DELETE`| `/api/ratings/delete-rating`     | Delete a rating (auth)| `{ rating_id }`         |
| `GET`  | `/api/ratings/get-ratings/:movie_id`| Get ratings for a movie| `movie_id` (URL param)  |

### User/Watchlist Endpoints

(All require authentication)

| Method | Endpoint                        | Description                   | Body/Params              |
| :----- | :------------------------------ | :---------------------------- | :----------------------- |
| `POST` | `/api/user/add-to-watchlist`    | Add a movie to the user’s watchlist| `{ movie_id }`          |
| `POST` | `/api/user/remove-from-watchlist`| Remove a movie from the user’s watchlist| `{ movie_id }`      |
| `GET`  | `/api/user/get-logged`          | Get movies the user has logged/watched| —                        |
| `GET`  | `/api/user/get-watchlist`       | Get the user’s current watchlist| —                        |
| `POST` | `/api/user/recommended-movies`  | Get recommended movies for the user| `{ preferences }` (optional) |

---

## Example Usage

### Register a user:
```
POST /api/auth/signup
Body: {
  "name": "alice",
  "username": "alice",
  "mail": "alice@email.com",
  "password": "pass123",
  "confirmPassword": "pass123"
}
```

### Login:
```
POST /api/auth/login
Body: {
  "username": "alice",
  "password": "pass123"
}
```

### Add a movie to watchlist:
```
POST /api/user/add-to-watchlist
Headers: Authorization: Bearer <JWT>
Body: {
  "movie_id": "12345"
}
```

### Get ratings for a movie:
```
GET /api/ratings/get-ratings/12345
```

## Notes
* All endpoints under `/api/user` and `/api/ratings` (except `GET /api/ratings/get-ratings/:movie_id`) require a valid JWT token in the `Authorization` header.
* MongoDB is used for all data storage (users, ratings, watchlists).
* Movie data is fetched via proxy from the TMDB API.

## Contributing
Pull requests are welcome! Please open an issue to discuss major changes.
