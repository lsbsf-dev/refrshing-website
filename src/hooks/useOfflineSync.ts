import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/db';
import { collection, getDocs } from 'firebase/firestore';
import { db as firestoreDb } from '@/lib/firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/app';
import { useQueryClient } from '@tanstack/react-query';

export function useOfflineSync(eventId: string) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const syncDown = useCallback(async () => {
    if (!eventId || !isOnline) return;
    try {
      const ref = collection(firestoreDb, "events", eventId, "checkinView");
      const snap = await getDocs(ref);
      
      const localAttendees = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          eventId,
          fullName: data.fullName || "Anonymous",
          photoUrl: data.photoUrl || "",
          memberStatus: data.memberStatus || "Member",
          checkedInAt: data.checkedInAt || null,
          phoneMasked: data.phoneMasked || "",
          churchName: data.churchName || "",
          associationName: data.associationName || "",
          campusFellowshipName: data.campusFellowshipName || ""
        };
      });

      // Bulk put updates Dexie records
      await db.attendees.bulkPut(localAttendees);
      
      // Invalidate queries so components know to refresh
      queryClient.invalidateQueries({ queryKey: ["admin", "offline-attendees", eventId] });
    } catch (err) {
      console.error("Failed to sync down attendees:", err);
    }
  }, [eventId, queryClient]);

  const syncUp = useCallback(async () => {
    if (!eventId || !isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const pendingQueue = await db.checkinQueue
        .where('eventId').equals(eventId)
        .and(item => item.status === 'pending')
        .toArray();

      if (pendingQueue.length === 0) {
        setIsSyncing(false);
        return;
      }

      const functions = getFunctions(app);
      const markCheckedIn = httpsCallable<{ eventId: string, attendeeId: string }, any>(functions, "markCheckedIn");

      for (const item of pendingQueue) {
        try {
          await markCheckedIn({ eventId: item.eventId, attendeeId: item.attendeeId });
          await db.checkinQueue.update(item.id!, { status: 'synced' });
        } catch (error: any) {
          // Check if error is because they are already checked in
          // Firebase wraps HttpsError codes with 'functions/'
          if (error?.code === 'functions/already-exists' || error?.details?.status === 'already_checked_in') {
            // Silently mark as conflict and resolved
            console.log(`Conflict resolved silently for ${item.attendeeId}: Already checked in elsewhere.`);
            await db.checkinQueue.update(item.id!, { status: 'conflict' });
          } else {
            // Unhandled error (maybe permission or network), leave as pending for next retry
            console.error(`Error syncing queue item ${item.id}:`, error);
          }
        }
      }
      
      // Wait for syncCheckinView trigger to propagate the timestamp to checkinView
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Sync down again to get canonical timestamps
      await syncDown();
    } finally {
      setIsSyncing(false);
    }
  }, [eventId, isOnline, isSyncing, syncDown]);

  // Initial sync & Listen to online status for syncUp
  useEffect(() => {
    if (isOnline && eventId) {
      syncUp().then(() => syncDown());
    }
  }, [isOnline, eventId]); // Intentional: sync when returning online

  // Trigger check-in offline or online
  const handleCheckIn = async (attendeeId: string) => {
    const timestamp = new Date().toISOString();
    
    // Optimistic update in Dexie
    await db.attendees.update(attendeeId, {
      checkedInAt: timestamp
    });

    // Add to queue
    await db.checkinQueue.add({
      attendeeId,
      eventId,
      timestamp,
      status: 'pending',
      idempotencyKey: `${attendeeId}-${Date.now()}` // Basic idempotency
    });

    // Invalidate local queries to trigger UI update
    queryClient.invalidateQueries({ queryKey: ["admin", "offline-attendees", eventId] });

    if (isOnline) {
      syncUp();
    }
    
    return true;
  };

  return {
    isOnline,
    isSyncing,
    handleCheckIn,
    syncDown,
    syncUp
  };
}
