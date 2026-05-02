'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      const isPermission = error.name === 'FirestorePermissionError';
      
      toast({
        variant: 'destructive',
        title: isPermission ? 'SECURITY_PROTOCOL_BREACH' : 'DATABASE_PROTOCOL_FAILURE',
        description: isPermission 
          ? `Access denied for operation: ${error.context.operation} at ${error.context.path}. Check system credentials.`
          : error.message,
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
