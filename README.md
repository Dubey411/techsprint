# TechSprint - Donation Management System

A comprehensive full-stack application designed to connect Donors, NGOs, and Volunteers to facilitate and streamline the process of donations (likely food or resource distribution).

## 🚀 Features

- **Role-Based Authentication**: Secure login and signup for different user roles:
  - **NGOs**: Manage donation requests and drop-off locations.
  - **Volunteers**: View tasks, accept delivery requests, and track routes.
  - **Donors**: (Implied) Contribute donations.
- **Interactive Dashboards**: Tailored views for each user role.
- **Real-Time Mapping**: Integrated Leaflet maps for route visualization, pickup, and drop-off locations.
- **Live Updates**: Real-time status updates using Socket.io.
- **Responsive Design**: Modern UI built with React and Tailwind CSS.

## 🛠️ Tech Stack

### Client (Frontend)
- **Framework**: [React](https://react.dev/) (Vite)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
- **Routing**: React Router DOM
- **State/Auth**: Firebase Auth, Context API
- **Real-time**: Socket.io-client

### Server (Backend)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) & Firebase Admin
- **Real-time**: Socket.io

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB installed locally or a MongoDB Atlas connection string
- Firebase project credentials

### 1. Clone the Repository
```bash
git clone <repository-url>
cd TechSprint
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FIREBASE_SERVICE_ACCOUNT=path_to_firebase_credentials.json or credentials
```
*Note: Check `server/src/config` or source code for all required environment variables.*

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the client directory and install dependencies:
```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory (if required) for Firebase config:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# Add other Firebase config keys
```

Start the development server:
```bash
npm run dev
```

## 🏃‍♂️ Running the Application

1. Ensure MongoDB is running.
2. Start the Backend Server (runs on `http://localhost:5000` by default).
3. Start the Frontend Client (runs on `http://localhost:5173` by default).
4. Open your browser and navigate to the client URL.

## 📂 Project Structure

```
TechSprint/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── content/        # Context providers (Auth, etc.)
│   │   ├── pages/          # Application pages (Login, Dashboard, etc.)
│   │   └── ...
│   ├── index.html
│   └── package.json
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # DB and app configuration
│   │   ├── controllers/    # Route logic
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── index.js        # Entry point
│   └── package.json
└── README.md
```

## 🤝 Contribution

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the ISC License.
