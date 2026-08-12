import { useEffect, useState, useCallback, useRef } from 'react';
import { db, ensureDbReady } from '@/lib/db';
import { collection, getDocs } from 'firebase/firestore';
import { db as firestoreDb } from '@/lib/firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/app';
import { useQueryClient } from '@tanstack/react-query';

export function useOfflineSync(eventId: string) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Keep refs so callbacks always see the latest value without being dependencies
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;

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

  const syncDownInProgressRef = useRef(false);

  const syncDown = useCallback(async () => {
    if (!eventId || !isOnlineRef.current || syncDownInProgressRef.current) return;
    
    syncDownInProgressRef.current = true;
    try {
      setSyncError(null);
      await ensureDbReady();

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

      await db.attendees.bulkPut(localAttendees);
      
      queryClient.invalidateQueries({ queryKey: ["admin", "offline-attendees", eventId] });
    } catch (err: any) {
      console.error("Failed to sync down attendees:", err);
      setSyncError(err.message || "Failed to sync down attendees");
    } finally {
      syncDownInProgressRef.current = false;
    }
  // Only re-create when eventId changes — isOnline is read from ref
  }, [eventId, queryClient]);

  const syncInProgressRef = useRef(false);

  const syncUp = useCallback(async () => {
    if (!eventId || !isOnlineRef.current || syncInProgressRef.current) return;
    
    syncInProgressRef.current = true;
    setIsSyncing(true);
    try {
      setSyncError(null);
      await ensureDbReady();

      const pendingQueue = await db.checkinQueue
        .where('eventId').equals(eventId)
        .and(item => item.status === 'pending' || item.status === 'pending-undo')
        .toArray();

      if (pendingQueue.length === 0) {
        setIsSyncing(false);
        syncInProgressRef.current = false;
        return;
      }

      const functions = getFunctions(app);
      const markCheckedIn = httpsCallable<{ eventId: string, attendeeId: string, isUndo?: boolean }, any>(functions, "markCheckedIn");

      for (const item of pendingQueue) {
        try {
          await markCheckedIn({ 
            eventId: item.eventId, 
            attendeeId: item.attendeeId,
            isUndo: item.status === 'pending-undo'
          });
          await db.checkinQueue.update(item.id!, { status: 'synced' });
        } catch (error: any) {
          if (error?.code === 'functions/already-exists' || error?.details?.status === 'already_checked_in') {
            console.log(`Conflict resolved silently for ${item.attendeeId}: Already checked in elsewhere.`);
            await db.checkinQueue.update(item.id!, { status: 'conflict' });
          } else {
            console.error(`Error syncing queue item ${item.id}:`, error);
          }
        }
      }
      
      // Wait for syncCheckinView trigger to propagate the timestamp to checkinView
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Sync down again to get canonical timestamps
      await syncDown();
      
      // Invalidate global queries so other pages (Attendees, Dashboard) refresh automatically
      queryClient.invalidateQueries({ queryKey: ["admin", "attendees", eventId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", "summary", eventId] });
    } catch (err: any) {
      console.error("Failed to sync up queue:", err);
      setSyncError(err.message || "Failed to sync up queue");
    } finally {
      setIsSyncing(false);
      syncInProgressRef.current = false;
    }
  // Only re-create when eventId changes — isSyncing/isOnline read from refs
  }, [eventId, syncDown, queryClient]);

  // Keep stable refs for the effect so it doesn't re-trigger on every render
  const syncUpRef = useRef(syncUp);
  syncUpRef.current = syncUp;
  const syncDownRef = useRef(syncDown);
  syncDownRef.current = syncDown;

  // Initial sync & re-sync when coming back online or switching event
  useEffect(() => {
    let mounted = true;
    if (isOnline && eventId) {
      syncUpRef.current()
        .then(() => {
          if (mounted) return syncDownRef.current();
        })
        .catch(err => {
          console.error("Dexie sync error caught:", err);
        });
    }
    return () => {
      mounted = false;
    };
  // Deliberately only depend on isOnline and eventId — the actual sync functions
  // are read from stable refs to avoid re-trigger loops.
  }, [isOnline, eventId]);

  // Trigger check-in offline or online
  const handleCheckIn = async (attendeeId: string) => {
    try {
      setSyncError(null);
      await ensureDbReady();

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
        idempotencyKey: `${attendeeId}-${Date.now()}`
      });

      // Invalidate local queries to trigger UI update
      queryClient.invalidateQueries({ queryKey: ["admin", "offline-attendees", eventId] });

      if (isOnlineRef.current) {
        syncUpRef.current();
      }
      
      return true;
    } catch (err: any) {
      console.error("Check-in failed locally:", err);
      setSyncError(err.message || "Failed to save check-in locally");
      throw err;
    }
  };

  // Undo check-in offline or online
  const handleUndoCheckIn = async (attendeeId: string) => {
    try {
      setSyncError(null);
      await ensureDbReady();

      const timestamp = new Date().toISOString();
      
      // Optimistic update in Dexie
      await db.attendees.update(attendeeId, {
        checkedInAt: null
      });

      // Add to queue
      await db.checkinQueue.add({
        attendeeId,
        eventId,
        timestamp,
        status: 'pending-undo' as any,
        idempotencyKey: `undo-${attendeeId}-${Date.now()}`
      });

      // Invalidate local queries to trigger UI update
      queryClient.invalidateQueries({ queryKey: ["admin", "offline-attendees", eventId] });

      if (isOnlineRef.current) {
        syncUpRef.current();
      }
      
      return true;
    } catch (err: any) {
      console.error("Undo check-in failed locally:", err);
      setSyncError(err.message || "Failed to undo check-in locally");
      throw err;
    }
  };

  return {
    isOnline,
    isSyncing,
    syncError,
    handleCheckIn,
    handleUndoCheckIn,
    syncDown,
    syncUp
  };
}


