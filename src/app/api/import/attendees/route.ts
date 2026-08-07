import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { ProcessedRow, FieldError, AttendeeData } from '@/types/import';

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

    // 1. Fetch Master Data
    const [existingAttendeesSnap, associationsSnap, churchesSnap] = await Promise.all([
      attendeesRef.get(),
      adminDb.collection('associations').where('active', '==', true).get(),
      adminDb.collection('churches').where('active', '==', true).get()
    ]);

    const existingAttendees = existingAttendeesSnap.docs.map(d => d.data());
    const associationsMaster = associationsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    const churchesMaster = churchesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

    const result = {
      processed: attendees.length,
      imported: 0,
      skipped: 0,
      rejected: 0,
      sessionRows: [] as ProcessedRow[],
    };

    const batch = adminDb.batch();
    const processedAttendees: any[] = [];

    const cleanStr = (s?: string) => s ? s.trim().toLowerCase() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Helper to map conference names to IDs
    const resolveConference = (raw: string): string | null => {
      const normalized = cleanStr(raw);
      if (!normalized) return null;
      if (normalized.includes('east')) return 'lagos_east';
      if (normalized.includes('west')) return 'lagos_west';
      if (normalized.includes('central')) return 'lagos_central';
      if (normalized.includes('campus')) return 'campus_fellowship';
      if (normalized.includes('other')) return 'other';
      return null;
    };

    attendees.forEach((clientRow: any, index: number) => {
      const isProcessedRow = !!clientRow.originalData;
      
      const originalData: AttendeeData = isProcessedRow ? clientRow.originalData : clientRow;
      const data: AttendeeData = isProcessedRow ? clientRow.data : clientRow;
      const originalIndex = isProcessedRow ? clientRow.originalIndex : index;
      const importDecision = isProcessedRow ? clientRow.importDecision : undefined;
      const edited = isProcessedRow ? clientRow.edited : false;

      const errors: FieldError[] = [];
      let status: ProcessedRow["status"] = "valid";
      let duplicateOf: string | undefined = undefined;

      try {
        if (!data.id) {
          errors.push({ field: 'id', code: 'missing', message: 'Registration ID is missing.' });
        }

        // --- Core Identity Validation ---
        if (!data.fullName || data.fullName.trim() === '') {
          errors.push({ field: 'fullName', code: 'missing', message: 'Full Name is required.' });
        }

        if (!data.email || data.email.trim() === '') {
          errors.push({ field: 'email', code: 'missing', message: 'Email is required.' });
        } else if (!emailRegex.test(data.email.trim())) {
          errors.push({ field: 'email', code: 'invalid', message: 'Email format is invalid.' });
        }

        if (!data.phoneNumber || data.phoneNumber.trim() === '') {
          errors.push({ field: 'phoneNumber', code: 'missing', message: 'Phone Number is required.' });
        }

        const rawMemberStatus = cleanStr(data.memberStatus);
        if (rawMemberStatus !== 'member' && rawMemberStatus !== 'executive') {
          errors.push({ field: 'memberStatus', code: 'invalid', message: 'Member Status must be Member or Executive.' });
        } else {
          data.memberStatus = rawMemberStatus === 'executive' ? 'Executive' : 'Member';
        }

        // --- Master Data Resolution ---
        let resolvedConfId = data.conferenceId;
        
        if (!resolvedConfId) {
          resolvedConfId = resolveConference(data.conferenceRaw || '') || undefined;
          if (resolvedConfId) {
             data.conferenceId = resolvedConfId;
             data.conferenceName = data.conferenceRaw.trim();
          } else {
             errors.push({ field: 'conferenceRaw', code: 'unresolved', message: 'Conference is required and could not be resolved.' });
          }
        }

        let resolvedAssocId = data.associationId;
        
        if (resolvedConfId && resolvedConfId !== 'other') {
          const rawAssoc = data.conferenceId === 'campus_fellowship' ? data.campusFellowshipRaw : data.associationRaw;
          const fieldName = data.conferenceId === 'campus_fellowship' ? 'campusFellowshipRaw' : 'associationRaw';
          
          if (!rawAssoc || rawAssoc.trim() === '') {
            errors.push({ field: fieldName as keyof AttendeeData, code: 'missing', message: 'Association / Campus is required for this conference.' });
          } else if (!resolvedAssocId) {
             const searchTarget = cleanStr(rawAssoc);
             const possibleAssocs = associationsMaster.filter(a => a.conferenceId === resolvedConfId);
             
             const exactMatch = possibleAssocs.find(a => cleanStr(a.name) === searchTarget);
             
             if (exactMatch) {
                resolvedAssocId = exactMatch.id;
                data.associationId = exactMatch.id;
                if (data.conferenceId === 'campus_fellowship') {
                   data.campusFellowshipId = exactMatch.id;
                   data.campusFellowshipName = exactMatch.name;
                } else {
                   data.associationName = exactMatch.name;
                }
             } else {
                // Do not force strict resolution, accept the string
                if (data.conferenceId === 'campus_fellowship') {
                   data.campusFellowshipName = rawAssoc.trim();
                   data.campusFellowshipId = undefined;
                } else {
                   data.associationName = rawAssoc.trim();
                   data.associationId = undefined;
                }
             }
          }
        }

        let resolvedChurchId = data.churchId;
        
        if (resolvedConfId && ['lagos_east', 'lagos_west', 'lagos_central'].includes(resolvedConfId)) {
           const rawChurch = data.churchRaw;
           
           if (!rawChurch || rawChurch.trim() === '') {
             errors.push({ field: 'churchRaw', code: 'missing', message: 'Church is required for Lagos East/West/Central conferences.' });
           } else if (!resolvedChurchId) {
              const searchTarget = cleanStr(rawChurch);
              const possibleChurches = resolvedAssocId ? churchesMaster.filter(c => c.associationId === resolvedAssocId) : churchesMaster;
              
              const exactMatch = possibleChurches.find(c => {
                 if (cleanStr(c.canonicalName) === searchTarget) return true;
                 if (c.aliases && Array.isArray(c.aliases)) {
                    return c.aliases.some((alias: string) => cleanStr(alias) === searchTarget);
                 }
                 return false;
              });
              
              if (exactMatch) {
                 resolvedChurchId = exactMatch.id;
                 data.churchId = exactMatch.id;
                 data.churchName = exactMatch.canonicalName;
              } else {
                 // Do not force strict resolution, accept the string
                 data.churchName = rawChurch.trim();
                 data.churchId = undefined;
              }
           }
        }

        // --- Payment Status ---
        const rawTransfer = cleanStr(data.hasPaidRaw || '');
        if (rawTransfer === 'yes' || rawTransfer === 'true') {
           data.transferCompleted = true;
        } else if (rawTransfer === 'no' || rawTransfer === 'false' || rawTransfer === "don't know" || rawTransfer === 'dont know') {
           data.transferCompleted = false;
        } else {
           errors.push({ field: 'hasPaidRaw', code: 'missing', message: 'Transfer Completed status is required (Yes/No).' });
        }


        if (errors.length > 0) {
          status = "error";
        } else {
          // --- Duplicate Detection Logic ---
          const checkDuplicateAgainst = (existing: any) => {
            const sameEmail = !!existing.email && !!data.email && existing.email.toLowerCase() === data.email.toLowerCase();
            if (sameEmail) {
              return { isMatch: true, exact: !!existing.id && existing.id === data.id, existingId: existing.id || 'unknown' };
            }
            return { isMatch: false, exact: false };
          };

          let foundDuplicate = false;
          let exactMatch = false;

          for (const existing of existingAttendees) {
            if (existing.id === data.id) {
              foundDuplicate = true;
              exactMatch = true;
              duplicateOf = existing.id;
              break;
            }
            const match = checkDuplicateAgainst(existing);
            if (match.isMatch) {
              foundDuplicate = true;
              exactMatch = match.exact;
              duplicateOf = match.existingId;
              break;
            }
          }

          if (!foundDuplicate) {
            for (const processed of processedAttendees) {
              if (processed.id === data.id) {
                foundDuplicate = true;
                exactMatch = true;
                duplicateOf = processed.id;
                break;
              }
              const match = checkDuplicateAgainst(processed);
              if (match.isMatch) {
                foundDuplicate = true;
                exactMatch = match.exact;
                duplicateOf = match.existingId;
                break;
              }
            }
          }

          if (foundDuplicate) {
            status = exactMatch ? "confirmed_duplicate" : "possible_duplicate";
          }
        }

        const finalRow: ProcessedRow = {
          originalIndex,
          originalData,
          data,
          status,
          errors,
          duplicateOf,
          importDecision,
          edited
        };

        result.sessionRows.push(finalRow);

        let willImport = false;

        if (importDecision === "skip") {
          result.skipped++;
        } else if (status === "error") {
          result.rejected++;
        } else if (status === "confirmed_duplicate") {
          result.skipped++;
        } else if (status === "possible_duplicate") {
          if (importDecision === "force_import") {
            willImport = true;
            result.imported++;
          } else {
            result.skipped++;
          }
        } else if (status === "valid") {
          if (importDecision === "include" || !importDecision) {
            willImport = true;
            result.imported++;
          } else {
             willImport = true;
             result.imported++;
          }
        }

        if (willImport) {
          processedAttendees.push(data);

          if (mode === 'commit') {
            const docRef = attendeesRef.doc(data.id);
            // Construct the clean final attendee shape based on resolved fields
            const finalAttendee = {
               id: data.id,
               eventId: data.eventId,
               fullName: data.fullName,
               email: data.email,
               phoneNumber: data.phoneNumber,
               memberStatus: data.memberStatus,
               conferenceId: data.conferenceId,
               conferenceName: data.conferenceName || data.conferenceRaw,
               associationId: data.associationId || null,
               associationName: data.associationName || data.associationRaw || null,
               churchId: data.churchId || null,
               churchName: data.churchName || data.churchRaw || null,
               campusFellowshipId: data.campusFellowshipId || null,
               campusFellowshipName: data.campusFellowshipName || data.campusFellowshipRaw || null,
               otherSchool: data.otherSchoolRaw || null,
               expectation: data.expectationRaw || null,
               
               createdAt: new Date().toISOString(),
               updatedAt: new Date().toISOString(),
               checkIn: { checkedIn: false },
               
               // Store the raw transfer boolean but set verification status to pending
               transferCompleted: data.transferCompleted,
               
               importAudit: {
                 forceImported: status === "possible_duplicate" && importDecision === "force_import",
                 duplicateOf: duplicateOf || null,
                 importedAt: new Date().toISOString()
               }
            };

            batch.set(docRef, finalAttendee);
            
            // Explicitly set the subcollection for payment verification
            const paymentRef = docRef.collection("payment").doc("details");
            batch.set(paymentRef, {
               hasPaid: data.transferCompleted,
               verificationStatus: "pending", // Separate from transferCompleted
               receiptUrl: null,
               verifiedBy: null,
               verifiedAt: null,
               updatedAt: new Date().toISOString(),
            });
          }
        }

      } catch (err: any) {
        result.rejected++;
        const errorRow: ProcessedRow = {
          originalIndex, originalData, data, status: "error",
          errors: [{ field: "id", code: "exception", message: err.message }],
          edited, importDecision
        };
        result.sessionRows.push(errorRow);
      }
    });

    result.sessionRows.sort((a, b) => a.originalIndex - b.originalIndex);

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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId') || 'refreshing-2026';
    const snapshot = await adminDb.collection('events').doc(eventId).collection('attendees').get();
    return NextResponse.json({ count: snapshot.size, attendees: snapshot.docs.map(d => d.data()) });
  } catch(e: any) {
    return NextResponse.json({ error: e.message });
  }
}
