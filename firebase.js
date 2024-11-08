// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAlhvsQkS7pVWlADbEeXJAhDgowuPV7Pt0",
  authDomain: "fb-nuevecito-tutorial.firebaseapp.com",
  projectId: "fb-nuevecito-tutorial",
  storageBucket: "fb-nuevecito-tutorial.appspot.com",
  messagingSenderId: "456618866046",
  appId: "1:456618866046:web:c72d3fd79f03f383e86f2f",
  measurementId: "G-DKPCZ1LTY3"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Inicializamos Autenticacion
export const auth = getAuth(app);

// Inicializamos Firestore
export const db = getFirestore(app)

// Inicializamos Storage
export const storage = getStorage(app)