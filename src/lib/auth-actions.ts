
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  updateProfile,
  Auth
} from "firebase/auth";

export const handleAuthError = (error: any) => {
  let message = "Authentication failed. Please verify your credentials.";
  const code = error.code || "";

  if (code === 'auth/invalid-credential')      message = "Invalid email or password. Please check and try again.";
  if (code === 'auth/email-already-in-use')    message = "An account with this email already exists. Try logging in instead.";
  if (code === 'auth/user-not-found')          message = "No account found with this email. Please sign up first.";
  if (code === 'auth/wrong-password')          message = "Incorrect password. Please try again or use 'Lost Key' to reset it.";
  if (code === 'auth/weak-password')           message = "Password is too weak. Use at least 6 characters.";
  if (code === 'auth/invalid-email')           message = "Invalid email format. Please enter a valid email address.";
  if (code === 'auth/popup-closed-by-user')    message = "Sign-in popup was closed before completing. Please try again.";
  if (code === 'auth/popup-blocked')           message = "Popup was blocked by your browser. Please allow popups and try again.";
  if (code === 'auth/cancelled-popup-request') message = "Sign-in was cancelled. Please try again.";
  if (code === 'auth/too-many-requests')       message = "Too many failed attempts. Your account is temporarily locked. Try again later or reset your password.";
  if (code === 'auth/network-request-failed')  message = "Network error. Please check your internet connection and try again.";
  if (code === 'auth/unauthorized-domain')     message = "This domain is not authorized in Firebase. Go to Firebase Console → Authentication → Settings → Authorized Domains and add this site's URL.";
  if (code === 'auth/operation-not-allowed')   message = "This sign-in method is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.";
  if (code.includes('api-key'))                message = "Firebase API Key is missing or invalid. Check your environment configuration.";

  return { error: message };
};


export async function setSessionCookie(user: any) {
  try {
    const idToken = await user.getIdToken();
    await fetch("/api/auth/session", {
      method: "POST",
      body: JSON.stringify({ token: idToken }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to set session cookie", err);
  }
}

export async function clearSessionCookie() {
  await fetch("/api/auth/session", { method: "DELETE" });
}
