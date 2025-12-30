// import { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // Configure axios defaults
//     axios.defaults.baseURL = 'http://localhost:5000';
//     axios.defaults.withCredentials = true; // Important for cookies

//     const checkUserLoggedIn = async () => {
//         try {
//             const { data } = await axios.get('/api/auth/me');
//             setUser(data);
//         } catch (error) {
//             setUser(null);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         checkUserLoggedIn();
//     }, []);

//     const login = async (email, password) => {
//         const { data } = await axios.post('/api/auth/login', { email, password });
//         setUser(data);
//         // Token is in cookie, no need to save to local storage if using cookies
//         return data;
//     };

//     const register = async (userData) => {
//         const { data } = await axios.post('/api/auth/register', userData);
//         setUser(data);
//         return data;
//     };

//     const logout = async () => {
//         try {
//             await axios.post('/api/auth/logout');
//             setUser(null);
//         } catch (error) {
//             console.error("Logout failed", error);
//             setUser(null); // Clear local state anyway
//         }
//     };

//     const updateUser = (userData) => {
//         setUser(userData);
//     };

//     return (
//         <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };



import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { auth } from "../firebase"; // your firebase client config
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// 🔥 Axios config (Render backend)
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL && import.meta.env.PROD) {
  console.error("❌ CRITICAL: VITE_API_URL is missing in production! API calls will fail.");
}

console.log("📍 API Base URL:", API_URL || "(relative)");

axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = false; // ❌ no cookies

// 🔥 Attach Firebase token to every request
axios.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Check logged-in user
  const checkUserLoggedIn = async () => {
    try {
      const { data } = await axios.get("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Only check with backend if we have a Firebase user
        checkUserLoggedIn();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔐 LOGIN (Firebase)
  const login = async (email, password) => {
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const token = await userCred.user.getIdToken();

      const { data } = await axios.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      return data;
    } catch (firebaseErr) {
      console.error("Firebase Login Detailed Error:", firebaseErr);
      throw firebaseErr;
    }
  };

  // 📝 REGISTER
  const register = async (userData) => {
    const { email, password } = userData;

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const token = await userCred.user.getIdToken();

      const { data } = await axios.post("/api/auth/register", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      return data;
    } catch (firebaseErr) {
      console.error("Firebase Register Detailed Error:", firebaseErr);
      throw firebaseErr;
    }
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
