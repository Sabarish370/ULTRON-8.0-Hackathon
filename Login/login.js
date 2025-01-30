import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGt_wzAGBxdXAALYiOvrDr8aZcv0o4xOc",
    authDomain: "login-authentication-1d8b7.firebaseapp.com",
    projectId: "login-authentication-1d8b7",
    storageBucket: "login-authentication-1d8b7.appspot.com",
    messagingSenderId: "861096548554",
    appId: "1:861096548554:web:df5c8fa60598b2e1753c33",
    measurementId: "G-W2HDYZ7DT0"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
auth.languageCode = 'en';

const provider = new GoogleAuthProvider();


const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click", (event) => {
    event.preventDefault(); 

    signInWithPopup(auth, provider)
        .then((result) => {
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            console.log("User signed in:", user);
            console.log("Access token:", token);

            window.location.href = "next.html";
        })
        .catch((error) => {
            console.error("Error during sign-in:", error);
            console.error("Code:", error.code);
            console.error("Message:", error.message);
            console.error("Email:", error.customData?.email);
        });
});


const email=document.getElementById("email")

