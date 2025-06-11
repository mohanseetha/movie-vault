# Movie Vault Frontend

Movie Vault is a modern movie management and discovery platform that lets you explore, search, and organize your favorite films. This repository contains the frontend codebase, built with React and Tailwind CSS, designed for seamless integration with a Node.js/Express backend.

**Features**
- **Movie Catalog**: Browse a rich collection of movies.
- **Search**: Quickly find movies by title or keyword.
- **Authentication**: Secure registration and login with JWT-based sessions.
- **Watched & Logged Movies**: Track movies you’ve watched or logged to your profile.
- **Profile Management**: Edit your profile and manage your movie activity.
- **Responsive UI**: Mobile-friendly design using Tailwind CSS.

**Tech Stack**
- **React** (with hooks and functional components)
- **Tailwind CSS** (for utility-first styling)
- **Axios** (for API requests)
- **React Router v6**

**Installation**

Follow these steps to get Movie Vault Frontend up and running locally:
1.	**Clone the repository**:
```
git clone https://github.com/mohanseetha/movie-vault.git
```
2.	**Navigate to the frontend directory**:
```
cd movie-vault/frontend
```
3.	**Install dependencies**:
```
npm install
```
4.	**Configure environment variables**:
   Create a ‎⁠.env⁠ file in the root directory of the project with the following content, replacing ‎⁠your-backend-url⁠ with the actual URL of your Node.js backend:
```
VITE_BASE_URL=http://localhost:8000
```
5.	Start the development server:
```
npm start
```

The application will be available at ‎⁠http://localhost:5173

Contributing

Pull requests, issues, and suggestions are welcome! Please open an issue to discuss your ideas or report bugs.
