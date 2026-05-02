
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
  
  if (code === 'auth/invalid-credential') message = "Invalid email or password.";
  if (code === 'auth/email-already-in-use') message = "An account with this email already exists.";
  if (code === 'auth/user-not-found') message = "No account found with this email.";
  if (code === 'auth/wrong-password') message = "Incorrect password.";
  if (code === 'auth/popup-closed-by-user') message = "Sign-in popup was closed.";
  if (code === 'auth/operation-not-allowed') message = "Sign-in provider is not enabled in Firebase Console. Please enable Email/Password and Google.";
  if (code.includes('api-key')) message = "Firebase API Key is missing or invalid. Check your config.";
  
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
