

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNy3zHKQR67xkC8NNWKErXADnIaI4avek",
  authDomain: "lumora-fe886.firebaseapp.com",
  projectId: "lumora-fe886",
  storageBucket: "lumora-fe886.firebasestorage.app",
  messagingSenderId: "285405452637",
  appId: "1:285405452637:web:22ab45b0a3fbfd195a30b4",
  measurementId: "G-63XVPBN310"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;