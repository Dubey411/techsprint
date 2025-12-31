# TechSprint - Donation Management System

A comprehensive full-stack application designed to connect Donors, NGOs, and Volunteers to facilitate and streamline the process of donations (likely food or resource distribution).

## Vecel Link: 
https://techsprint-ten.vercel.app/

# Preview 

## Landing Page
<img width="1911" height="919" alt="Screenshot 2025-12-30 235807" src="https://github.com/user-attachments/assets/a33b54f7-4591-4e77-9133-c973e9e6930b" />

## Donating Food
<img width="1892" height="906" alt="Screenshot 2025-12-31 000136" src="https://github.com/user-attachments/assets/48585eed-d754-4fd6-8bc2-c3638b0ac68f" />

## Rescue Food
<img width="1904" height="909" alt="Screenshot 2025-12-31 000319" src="https://github.com/user-attachments/assets/17eae66e-ab2c-4d6b-988d-5a1c83d0b4dd" />

## Accepting food
<img width="1890" height="902" alt="Screenshot 2025-12-31 000637" src="https://github.com/user-attachments/assets/560e0c7c-521b-44cb-82cb-8f14416703ec" />

## Tracking Food Location
<img width="1876" height="729" alt="Screenshot 2025-12-31 001048" src="https://github.com/user-attachments/assets/6554a85f-9258-47de-abea-3356e9519afb" />



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
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (NoSQL)
- **Authentication**: JWT & Firebase Auth
- **Real-time**: Socket.io

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Firebase Project with Firestore enabled

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
CLIENT_URL=http://localhost:5173
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...} # One-line JSON or path to file
```
*Note: Ensure `firebase-service-account.json` is present if not using the ENV variable string.*

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

Create a `.env` file in the `client` directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the development server:
```bash
npm run dev
```

## 🏃‍♂️ Running the Application

1. Start the Backend Server.
2. Start the Frontend Client.
3. Open `http://localhost:5173` to view the app.

## 📂 Project Structure

```
TechSprint/
├── client/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Application pages
│   │   └── ...
│   ├── index.html
│   └── package.json
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # Firebase configuration
│   │   ├── controllers/    # API Controllers
│   │   ├── models/         # Firestore Schema Docs
│   │   ├── routes/         # Express Routes
│   │   └── index.js        # Server Entry
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
