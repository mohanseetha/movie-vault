# Movie Vault

Movie Vault is a movie database web application where users can log their watched movies, manage watchlists, and receive personalized movie recommendations powered by a machine learning model.

## Features

* Log watched movies and track viewing history
* Add movies to personal watchlists
* Receive personalized movie recommendations using ML
* Search and filter movies in the database
* User authentication and account management
* Responsive user interface

## Tech Stack

* **Frontend:** React
* **Backend:** Flask
* **Database:** MongoDB

## Getting Started

### Prerequisites

* Node.js (v14 or higher)
* npm
* Python 3.x
* MongoDB

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/mohanseetha/movie-vault.git](https://github.com/mohanseetha/movie-vault.git)
    cd movie-vault
    ```

2.  **Install frontend dependencies**
    ```bash
    cd frontend
    npm install
    ```

3.  **Install backend dependencies**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

4.  **Set up environment variables**
    Create a `.env` file in the `backend` directory with your MongoDB URI and other required configs.

5.  **Run the backend server**
    ```bash
    python app.py
    ```

6.  **Run the frontend app**
    ```bash
    npm run dev
    ```

## Usage

1.  Open your browser and go to `http://localhost:5173`
2.  Sign up or log in to your account
3.  Start adding movies, building your watchlist, and exploring recommendations

## Contributing

Contributions are welcome! Please open issues or submit pull requests for new features, bug fixes, or improvements.
