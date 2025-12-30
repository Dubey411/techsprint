
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

      try {
        const { data } = await axios.get("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(data);
        return data;
      } catch (backendErr) {
        console.error("Backend Auth Verification Failed:", backendErr);
        if (backendErr.response?.status === 401 || backendErr.response?.status === 404) {
          throw new Error("Account found, but profile data is missing. Please try registering again with this email to fix your account.");
        }
        throw backendErr;
      }
    } catch (err) {
      console.error("Login Detailed Error:", err);
      throw err;
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
      console.log("Error Code:", firebaseErr.code); // DEBUG for prod
      
      // If user already exists in Firebase Auth, try to repair the account
      // Check both code and message to be safe in production
      if (firebaseErr.code === 'auth/email-already-in-use' || 
          (firebaseErr.message && firebaseErr.message.includes('email-already-in-use'))) {
        console.log("User exists in Auth, attempting to repair account...");
        try {
          // Try to sign in to get the ID token
          const loginCred = await signInWithEmailAndPassword(auth, email, password);
          const token = await loginCred.user.getIdToken();
          
          // Call register endpoint to create/update Firestore doc
          const { data } = await axios.post("/api/auth/register", userData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          setUser(data);
          return data;
        } catch (repairErr) {
          console.error("Account repair failed:", repairErr);
          // If the password is wrong, throw a helpful error
          if (repairErr.code === 'auth/invalid-credential' || repairErr.code === 'auth/wrong-password') {
            throw new Error("This email is already registered with a different password. Please use the login page instead.");
          }
          throw repairErr;
        }
      }
      
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
