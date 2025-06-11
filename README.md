# Movie Vault

Movie Vault is a full-stack movie management and discovery platform with a clean, modular architecture:

- **Frontend**: Built with React and Material UI, providing a responsive and user-friendly interface. Features include user authentication (JWT), movie search and filtering, personal watchlists, diary, and profile management.
- **Backend**: Powered by Node.js, Express, and MongoDB, offering secure user management, movie catalog storage, and RESTful APIs for all core features.

![Demo](assets/demo.gif)

## Getting Started
1.	Clone the repository:
   ```
   git clone https://github.com/mohanseetha/movie-vault.git
   ```

### Backend Setup
1.	Navigate to the backend directory:
```
cd movie-vault/backend
```
2.	Configure your MongoDB connection and JWT secret in the ‎⁠.env⁠ file (see ‎⁠backend/README.md⁠ for details).
3.	Install dependencies:
```
npm install
```
4.	Start the backend server:
```
nodemon server
```

### Frontend Setup
1.	Navigate to the frontend directory:
```
cd movie-vault/frontend
```
2.	Install dependencies:
```
npm install
```

3.	Set your backend API URL in a ‎⁠.env⁠ file (e.g., ‎⁠VITE_BASE_URL=http://localhost:8000).
4.	Start the frontend development server:
```
npm start
```

For full setup instructions and feature details, refer to the individual ‎⁠README.md⁠ files in the ‎⁠backend⁠ and ‎⁠frontend⁠ folders.
