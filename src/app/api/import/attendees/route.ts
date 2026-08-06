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

    attendees.forEach((attendee: any) => {
      try {
        if (!attendee.id) {
          result.rejected++;
          result.errors.push(`Missing id for attendee ${attendee.name || JSON.stringify(attendee)}`);
          return;
        }

        // Duplicate Detection Logic (Phone) OR (Email) OR (Name AND (Phone OR Email))
        const isDuplicate = existingAttendees.some(existing => {
          const samePhone = existing.phone && attendee.phone && existing.phone === attendee.phone;
          const sameEmail = existing.email && attendee.email && existing.email.toLowerCase() === attendee.email.toLowerCase();
          const sameName = existing.name && attendee.name && existing.name.toLowerCase() === attendee.name.toLowerCase();

          return samePhone || sameEmail || (sameName && (samePhone || sameEmail));
        });

        // Also check if the ID already exists in DB
        const idExists = existingAttendees.some(e => e.id === attendee.id);

        if (isDuplicate || idExists) {
          result.skipped++;
          result.flagged.push({ ...attendee, reason: idExists ? "ID already exists" : "Possible Duplicate" });
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
