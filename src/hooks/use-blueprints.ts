"use client";

import { useFirestore, useAuth } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { BlueprintData } from '@/lib/firestore-service';
import { useMemo } from 'react';

export function useBlueprints() {
  const { firestore } = useFirestore();
  const { auth } = useAuth();
  const userId = auth?.currentUser?.uid;

  const q = useMemo(() => {
    if (!firestore || !userId) return null;
    const blueprintsRef = collection(firestore, 'users', userId, 'blueprints');
    return query(blueprintsRef, orderBy('createdAt', 'desc'));
  }, [firestore, userId]);

  const { data, loading } = useCollection<BlueprintData>(q);

  return { blueprints: data || [], loading };
}
