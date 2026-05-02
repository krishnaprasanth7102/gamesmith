"use client";

import { useFirestore, useAuth } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { AssetData } from '@/lib/firestore-service';
import { useMemo } from 'react';

/**
 * Hook for public marketplace assets (only approved)
 */
export function useAssets(category: string = "All", searchQuery: string = "") {
  const { firestore } = useFirestore();
  
  const q = useMemo(() => {
    if (!firestore) return null;
    const bossesRef = collection(firestore, 'bosses');
    
    // We only query by status and date to avoid complex index requirements
    return query(
      bossesRef, 
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore]);

  const { data, loading } = useCollection<AssetData>(q);

  const filteredData = useMemo(() => {
    if (!data) return [];
    
    // Filter by Category and Search Query on the client
    return data.filter(asset => {
      const matchesCategory = category === "All" || asset.category === category;
      const matchesSearch = !searchQuery || 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        asset.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [data, category, searchQuery]);

  return { assets: filteredData, loading };
}

/**
 * Hook for user's own assets (displays status)
 */
export function useUserAssets() {
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const userId = auth?.currentUser?.uid;

  const q = useMemo(() => {
    if (!firestore || !userId) return null;
    const bossesRef = collection(firestore, 'bosses');
    return query(bossesRef, where('contributorId', '==', userId), orderBy('createdAt', 'desc'));
  }, [firestore, userId]);

  const { data, loading } = useCollection<AssetData>(q);

  return { assets: data || [], loading };
}

/**
 * Hook for Admin Overwatch (all assets, any status)
 */
export function useAdminAssets(isAdmin: boolean = false, statusFilter: string = "All", searchQuery: string = "") {
  const { firestore } = useFirestore();
  
  const q = useMemo(() => {
    if (!firestore || !isAdmin) return null;
    const bossesRef = collection(firestore, 'bosses');
    
    if (statusFilter !== "All") {
      return query(
        bossesRef, 
        where('status', '==', statusFilter.toLowerCase()),
        orderBy('createdAt', 'desc')
      );
    }
    return query(bossesRef, orderBy('createdAt', 'desc'));
  }, [firestore, statusFilter, isAdmin]);

  const { data, loading } = useCollection<AssetData>(q);

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(asset => 
      asset.name.toLowerCase().includes(lowerQuery) || 
      asset.description.toLowerCase().includes(lowerQuery) ||
      asset.contributorName.toLowerCase().includes(lowerQuery)
    );
  }, [data, searchQuery]);

  return { assets: filteredData, loading: isAdmin ? loading : false };
}
