'use server';

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Admin SDK
// Note: In a production environment, you would use service account credentials.
// For this environment, we assume the server has default access or we use the client config.
const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (!getApps().length) {
  initializeApp(firebaseAdminConfig);
}

const db = getFirestore();

export async function adminUpdateAssetStatus(assetId: string, status: 'approved' | 'rejected') {
  try {
    const assetRef = db.collection('bosses').doc(assetId);
    await assetRef.update({ status });
    return { success: true };
  } catch (error: any) {
    console.error("Admin Action Error:", error);
    throw new Error(error.message);
  }
}

export async function adminDeleteAsset(assetId: string) {
  try {
    const assetRef = db.collection('bosses').doc(assetId);
    await assetRef.delete();
    return { success: true };
  } catch (error: any) {
    console.error("Admin Action Error:", error);
    throw new Error(error.message);
  }
}

export async function adminDeleteUser(uid: string) {
  try {
    const userRef = db.collection('users').doc(uid);
    await userRef.delete();
    // Note: Deleting from Auth would require admin.auth().deleteUser(uid)
    return { success: true };
  } catch (error: any) {
    console.error("Admin Action Error:", error);
    throw new Error(error.message);
  }
}

export async function adminAddAsset(data: any) {
  try {
    const res = await db.collection('bosses').add({
      ...data,
      status: 'approved',
      createdAt: new Date(),
    });
    return { success: true, id: res.id };
  } catch (error: any) {
    console.error("Admin Action Error:", error);
    throw new Error(error.message);
  }
}
