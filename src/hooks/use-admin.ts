"use client";

import { useState, useEffect } from "react";
import { useFirestore } from "@/firebase";
import { 
  getAllUsers, 
  getSystemStats, 
  UserProfile, 
  SystemStats 
} from "@/lib/firestore-service";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export function useAdminUsers(isAdmin: boolean = false) {
  const { firestore } = useFirestore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !isAdmin) {
      if (!isAdmin) setLoading(false);
      return;
    }

    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      if (error.code === 'permission-denied') {
        console.warn("ADMIN_ACCESS_LIMITED: Live user data requires real admin role in Firestore.");
      } else {
        console.error("Error fetching users:", error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, isAdmin]);

  return { users, loading };
}

export function useSystemStats(isAdmin: boolean = false) {
  const { firestore } = useFirestore();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || !isAdmin) {
      if (!isAdmin) setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await getSystemStats(firestore);
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [firestore, isAdmin]);

  return { stats, loading };
}
