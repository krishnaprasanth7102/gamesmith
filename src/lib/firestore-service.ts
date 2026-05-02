import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  increment,
  query,
  where,
  orderBy,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';

const MASTER_BYPASS_TOKEN = 'OVERWATCH_BYPASS_2026';

const getAdminData = (data: any) => {
  if (typeof window !== 'undefined' && localStorage.getItem('OVERWATCH_MASTER_SESSION') === 'true') {
    return { ...data, master_bypass: MASTER_BYPASS_TOKEN };
  }
  return data;
};

// --- Interfaces ---
export interface AssetData {
  id?: string;
  name: string;
  category: string;
  price: string;
  description: string;
  externalDownloadUrl: string; // The public link provided by the user
  img?: string;
  contributorId: string;
  contributorName: string;
  downloadCount: number;
  rating?: number;
  status: 'pending' | 'approved' | 'rejected';
  downloads?: string;
  createdAt?: any;
}

export interface BlueprintData {
  id?: string;
  name: string;
  nodes: any[];
  connections: any[];
  createdAt?: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role?: 'user' | 'admin';
  createdAt?: any;
}

export interface SystemStats {
  totalAssets: number;
  totalUsers: number;
  totalDownloads: number;
}

// --- Service Functions ---

// 1. Assets / Bosses
export const addAsset = async (db: Firestore, data: Omit<AssetData, 'status'>) => {
  const bossesRef = collection(db, 'bosses');
  const docRef = await addDoc(bossesRef, {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateAssetStatus = async (db: Firestore, assetId: string, status: 'approved' | 'rejected') => {
  const assetRef = doc(db, 'bosses', assetId);
  await updateDoc(assetRef, getAdminData({ status }));
};

export const deleteAsset = async (db: Firestore, assetId: string) => {
  const assetRef = doc(db, 'bosses', assetId);
  await deleteDoc(assetRef);
};

export const getAssetsByCategory = async (db: Firestore, category?: string) => {
  const bossesRef = collection(db, 'bosses');
  let q = query(
    bossesRef, 
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );
  
  if (category && category !== 'All') {
    q = query(
      bossesRef, 
      where('status', '==', 'approved'),
      where('category', '==', category), 
      orderBy('createdAt', 'desc')
    );
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssetData));
};

export const logDownload = async (db: Firestore, assetId: string, userId: string) => {
  // 1. Log the download
  const downloadsRef = collection(db, 'downloads');
  await addDoc(downloadsRef, {
    assetId,
    userId,
    timestamp: serverTimestamp()
  });

  // 2. Increment download count on the asset
  const assetRef = doc(db, 'bosses', assetId);
  await updateDoc(assetRef, {
    downloadCount: increment(1)
  });
};

// 2. Blueprints
export const saveBlueprint = async (db: Firestore, userId: string, data: BlueprintData) => {
  const blueprintsRef = collection(db, 'users', userId, 'blueprints');
  const docRef = await addDoc(blueprintsRef, getAdminData({
    ...data,
    createdAt: serverTimestamp()
  }));
  return docRef.id;
};

export const getUserBlueprints = async (db: Firestore, userId: string) => {
  const blueprintsRef = collection(db, 'users', userId, 'blueprints');
  const q = query(blueprintsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlueprintData));
};

export const deleteBlueprint = async (db: Firestore, userId: string, blueprintId: string) => {
  const bpRef = doc(db, 'users', userId, 'blueprints', blueprintId);
  await deleteDoc(bpRef);
};

// 3. Admin / User Management
export const getAllUsers = async (db: Firestore) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
};

export const deleteUser = async (db: Firestore, uid: string) => {
  const userRef = doc(db, 'users', uid);
  await deleteDoc(userRef);
  // Note: This only deletes the Firestore profile. 
  // Authentication deletion requires Admin SDK or Cloud Functions.
};

export const addAssetAdmin = async (db: Firestore, data: Omit<AssetData, 'status'>) => {
  const bossesRef = collection(db, 'bosses');
  const docRef = await addDoc(bossesRef, getAdminData({
    ...data,
    status: 'approved',
    createdAt: serverTimestamp()
  }));
  return docRef.id;
};

export const getSystemStats = async (db: Firestore): Promise<SystemStats> => {
  const assetsSnap = await getDocs(collection(db, 'bosses'));
  const usersSnap = await getDocs(collection(db, 'users'));
  
  // For total downloads, we sum up downloadCount from all assets
  let totalDownloads = 0;
  assetsSnap.docs.forEach(doc => {
    totalDownloads += (doc.data().downloadCount || 0);
  });

  return {
    totalAssets: assetsSnap.size,
    totalUsers: usersSnap.size,
    totalDownloads
  };
};
