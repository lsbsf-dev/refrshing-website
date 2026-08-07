import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { attendees, eventId, mode = 'commit' } = await request.json();

    if (!eventId || !Array.isArray(attendees)) {
      return NextResponse.json({ error: 'Missing eventId or attendees array' }, { status: 400 });
    }

    if (attendees.length > 500) {
      return NextResponse.json({ error: 'Cannot process more than 500 records at once.' }, { status: 400 });
    }

    const eventRef = adminDb.collection('events').doc(eventId);
    const attendeesRef = eventRef.collection('attendees');

    // Fetch existing attendees to diff against
    const existingSnap = await attendeesRef.get();
    const existingAttendees = existingSnap.docs.map(d => d.data());

    const result = {
      processed: attendees.length,
      imported: 0,
      skipped: 0,
      rejected: 0,
      flagged: [] as any[],
      errors: [] as string[]
    };

    const batch = adminDb.batch();
    const processedAttendees: any[] = []; // Track attendees processed in this batch to catch in-file duplicates

    attendees.forEach((attendee: any) => {
      try {
        if (!attendee.id) {
          result.rejected++;
          result.errors.push(`Missing id for attendee ${attendee.name || JSON.stringify(attendee)}`);
          return;
        }

        // 1. Required Field Validation
        if (!attendee.name || attendee.name.trim() === '') {
          result.rejected++;
          result.errors.push(`Missing Full Name for attendee ID ${attendee.id}`);
          return;
        }

        const hasEmail = attendee.email && attendee.email.trim() !== '';
        const hasPhone = attendee.phone && attendee.phone.trim() !== '';

        if (!hasEmail && !hasPhone) {
          result.rejected++;
          result.errors.push(`Missing both Email and Phone for attendee ID ${attendee.id} (${attendee.name})`);
          return;
        }

        // 2. Duplicate Detection Logic (Phone) OR (Email) OR (Name AND (Phone OR Email))
        // We must check against BOTH Firestore data AND the rows we've already processed in this same batch
        const checkDuplicateAgainst = (existing: any) => {
          const samePhone = !!existing.phone && !!attendee.phone && existing.phone === attendee.phone;
          const sameEmail = !!existing.email && !!attendee.email && existing.email.toLowerCase() === attendee.email.toLowerCase();
          const sameName = !!existing.name && !!attendee.name && existing.name.toLowerCase() === attendee.name.toLowerCase();

          return samePhone || sameEmail || (sameName && (samePhone || sameEmail));
        };

        const isDuplicateInDb = existingAttendees.some(checkDuplicateAgainst);
        const isDuplicateInBatch = processedAttendees.some(checkDuplicateAgainst);
        
        // Also check if the ID already exists in DB or batch
        const idExistsInDb = existingAttendees.some(e => e.id === attendee.id);
        const idExistsInBatch = processedAttendees.some(e => e.id === attendee.id);

        if (isDuplicateInDb || isDuplicateInBatch || idExistsInDb || idExistsInBatch) {
          result.skipped++;
          const reason = (idExistsInDb || idExistsInBatch) ? "ID already exists" : "Possible Duplicate";
          result.flagged.push({ ...attendee, reason });
          return; // Skip from batch
        }

        if (mode === 'commit') {
          const docRef = attendeesRef.doc(attendee.id);
          batch.set(docRef, {
            ...attendee,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            checkedIn: false,
            checkInTime: null,
            checkInLocation: null,
            checkInMethod: null
          });
        }
        
        // Add to processed so subsequent rows in this same file can be compared against it
        processedAttendees.push(attendee);
        result.imported++;
      } catch (err: any) {
        result.rejected++;
        result.errors.push(`Error processing attendee ${attendee.id}: ${err.message}`);
      }
    });

    if (mode === 'commit' && result.imported > 0) {
      await batch.commit();
    }

    return NextResponse.json({ 
      success: true, 
      ...result 
    });

  } catch (error: any) {
    console.error('Batch import error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
