"use client";

import React, { useState, useRef } from "react";
import { Upload, Users, Search, Download, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSystemSettings } from "@/lib/firebase/settings";
import { getEvents } from "@/lib/firebase/events";
import { CustomSelect } from "@/components/shared/CustomSelect";
import * as XLSX from "xlsx";

export default function AdminAttendeesPage() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSystemSettings,
  });

  const { data: eventsList = [] } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: getEvents,
  });

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [fileError, setFileError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize selectedEventId once settings load
  React.useEffect(() => {
    if (settings && !selectedEventId) {
      setSelectedEventId(settings.defaultEventId);
    }
  }, [settings, selectedEventId]);

  const [pendingImport, setPendingImport] = useState<any[] | null>(null);
  const [flaggedAttendees, setFlaggedAttendees] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<{ processed: number, imported: number, skipped: number, rejected: number } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");
    setImportResult(null);
    setPendingImport(null);
    setFlaggedAttendees([]);
    setImportStats(null);

    if (!selectedEventId) {
      setFileError("Please select an event edition first.");
      return;
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExt || '')) {
      setFileError("Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    setImporting(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData || jsonData.length === 0) {
        throw new Error("The uploaded file is empty or formatted incorrectly.");
      }

      const attendees = jsonData.map((row: any) => {
        const getVal = (possibleKeys: string[]) => {
          const key = Object.keys(row).find(k => possibleKeys.includes(k.toLowerCase().trim()));
          return key ? row[key]?.toString().trim() : "";
        };

        const id = getVal(['id', 'registration id', 'registration code', 'code']);
        const firstName = getVal(['first name', 'firstname', 'first_name']);
        const lastName = getVal(['last name', 'lastname', 'last_name']);
        const name = getVal(['name', 'full name', 'fullname']) || `${firstName} ${lastName}`.trim();
        const email = getVal(['email', 'email address']);
        const phone = getVal(['phone', 'phone number', 'contact']);
        const category = getVal(['category', 'role', 'type', 'ticket type']) || 'General';
        const ticketId = getVal(['ticket id', 'ticket code', 'ticket_id']);

        if (!id) {
          throw new Error("Missing 'Registration ID' or 'Code' column in one or more rows.");
        }

        return {
          id,
          name: name || "Unknown Attendee",
          email,
          phone,
          category,
          ticketId,
          eventId: selectedEventId
        };
      });

      // Step 1: Dry run to detect duplicates
      const response = await fetch('/api/import/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendees, eventId: selectedEventId, mode: 'dryRun' })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to process import');

      setImportStats({
        processed: result.processed,
        imported: result.imported,
        skipped: result.skipped,
        rejected: result.rejected
      });

      setFlaggedAttendees(result.flagged || []);
      setPendingImport(attendees);

    } catch (err: any) {
      console.error(err);
      setFileError(err.message || "An error occurred during file parsing.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingImport) return;
    setImporting(true);
    
    try {
      // In a real app, user might have selected which flagged items to overwrite/ignore.
      // For now, we filter out all flagged items and only commit the clean ones.
      const flaggedIds = new Set(flaggedAttendees.map(f => f.id));
      const cleanAttendees = pendingImport.filter(a => !flaggedIds.has(a.id));

      if (cleanAttendees.length === 0) {
        setImportResult({ success: 0, errors: ["No valid non-duplicate attendees to import."] });
        setPendingImport(null);
        return;
      }

      // Split into chunks of 500 for the API
      const chunkSize = 500;
      let totalImported = 0;
      let allErrors: string[] = [];

      for (let i = 0; i < cleanAttendees.length; i += chunkSize) {
        const chunk = cleanAttendees.slice(i, i + chunkSize);
        const response = await fetch('/api/import/attendees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attendees: chunk, eventId: selectedEventId, mode: 'commit' })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to commit chunk');
        
        totalImported += result.imported;
        if (result.errors) allErrors = [...allErrors, ...result.errors];
      }

      setImportResult({ success: totalImported, errors: allErrors });
      setPendingImport(null); // Clear the review state

    } catch (err: any) {
      console.error(err);
      setFileError(err.message || "An error occurred during import.");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 
        "Registration ID": "REF26-1001", 
        "Full Name": "John Doe", 
        "Email": "john@example.com", 
        "Phone": "+2348000000000",
        "Category": "VIP",
        "Ticket ID": "TCK-ABC-123"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Refreshing_Attendees_Template.xlsx");
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0B0907] dark:text-[#FCFAF6] mb-2 uppercase flex items-center gap-3">
          <Users className="h-8 w-8 text-[#C25627]" />
          Attendee Management
        </h1>
        <p className="font-sans text-sm text-black/60 dark:text-white/60">
          Import and manage registered attendees for conference editions.
        </p>
      </div>

      {/* Target Event Selector */}
      <div className="bg-white dark:bg-[#181612] p-4 sm:p-6 border border-black/10 dark:border-white/10 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <label className="block text-xs font-sans font-bold uppercase mb-2 text-[#0B0907] dark:text-[#FCFAF6]">
            Target Event Edition
          </label>
          <div className="max-w-xs">
            <CustomSelect
              value={selectedEventId}
              onChange={(val) => setSelectedEventId(val)}
              options={eventsList.map(e => ({ value: e.id, label: e.name }))}
            />
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
        <div>
          <h2 className="font-serif text-xl font-bold uppercase text-[#0B0907] dark:text-[#FCFAF6] mb-1">
            Batch Import via Excel/CSV
          </h2>
          <p className="font-sans text-sm text-black/60 dark:text-white/60">
            Upload an Excel or CSV file exported from your ticketing system (e.g., Tix.africa) to sync attendees into Firestore.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors rounded-xl text-sm font-sans font-bold text-[#0B0907] dark:text-[#FCFAF6]"
          >
            <Download className="h-4 w-4 text-[#C25627]" />
            Download Template
          </button>
        </div>

        {/* Dropzone area */}
        <div 
          onClick={() => !importing && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 text-center cursor-pointer transition-all ${
            importing 
              ? "border-zinc-300 dark:border-white/10 bg-zinc-50 dark:bg-white/5 opacity-70 pointer-events-none" 
              : "border-black/20 dark:border-white/20 hover:border-[#C25627] dark:hover:border-[#C25627] hover:bg-zinc-50 dark:hover:bg-white/5"
          }`}
        >
          {importing ? (
            <>
              <div className="bg-[#C25627]/10 p-4 rounded-full">
                <Loader2 className="h-8 w-8 text-[#C25627] animate-spin" />
              </div>
              <div>
                <p className="font-sans font-bold text-[#0B0907] dark:text-[#FCFAF6] text-lg">
                  Importing Attendees...
                </p>
                <p className="font-sans text-sm text-black/50 dark:text-white/50 mt-1">
                  Please wait, this might take a few moments.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#C25627]/10 p-4 rounded-full group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="h-8 w-8 text-[#C25627]" />
              </div>
              <div>
                <p className="font-sans font-bold text-[#0B0907] dark:text-[#FCFAF6] text-lg">
                  Click to browse files
                </p>
                <p className="font-sans text-sm text-black/50 dark:text-white/50 mt-1">
                  Supports .xlsx, .xls, and .csv files up to 10MB
                </p>
              </div>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
        </div>

        {/* Status Messages */}
        {fileError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="font-sans text-sm font-medium">{fileError}</p>
          </div>
        )}

        {/* Step 1 Review / Dry Run Results */}
        {importStats && pendingImport && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#0B0907] dark:text-[#FCFAF6]">Review Import</h3>
                <p className="font-sans text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Found {pendingImport.length} total rows. {flaggedAttendees.length > 0 ? "Some duplicates detected." : "All clear to import."}
                </p>
              </div>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="bg-[#C25627] hover:bg-[#a1451f] text-white px-6 py-3 rounded-xl font-sans font-bold transition-colors disabled:opacity-50"
              >
                {importing ? "Importing..." : `Confirm & Import ${pendingImport.length - flaggedAttendees.length}`}
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mt-2">
              <div className="bg-white dark:bg-[#181612] p-4 rounded-xl border border-black/5 dark:border-white/5 text-center">
                <p className="text-3xl font-bold font-serif">{importStats.processed}</p>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Processed</p>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-center text-emerald-600">
                <p className="text-3xl font-bold font-serif">{importStats.imported}</p>
                <p className="text-[10px] uppercase font-bold">Valid</p>
              </div>
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-center text-amber-600">
                <p className="text-3xl font-bold font-serif">{importStats.skipped}</p>
                <p className="text-[10px] uppercase font-bold">Flagged</p>
              </div>
              <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center text-red-600">
                <p className="text-3xl font-bold font-serif">{importStats.rejected}</p>
                <p className="text-[10px] uppercase font-bold">Errors</p>
              </div>
            </div>

            {flaggedAttendees.length > 0 && (
              <div className="mt-4 border-t border-amber-500/20 pt-4">
                <p className="font-sans text-sm font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {flaggedAttendees.length} items will be skipped automatically to prevent duplicates:
                </p>
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {flaggedAttendees.map((f, i) => (
                    <li key={i} className="text-xs bg-white dark:bg-[#181612] p-3 rounded-lg border border-amber-500/20 flex justify-between">
                      <span className="font-bold">{f.name}</span>
                      <span className="text-zinc-500">{f.email || f.phone}</span>
                      <span className="text-red-500 font-bold">{f.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Final Success Message */}
        {importResult && !pendingImport && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-6 rounded-3xl flex flex-col gap-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 shrink-0 mt-1" />
              <div className="font-sans">
                <p className="text-lg font-bold">Import Completed Successfully!</p>
                <p className="text-sm mt-1 text-emerald-700 dark:text-emerald-500">
                  Successfully imported <span className="font-bold">{importResult.success}</span> new attendees into Firestore.
                </p>
              </div>
            </div>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-emerald-500/20">
                <p className="text-xs font-bold mb-2 uppercase tracking-wider text-emerald-700 dark:text-emerald-500">Errors ({importResult.errors.length}):</p>
                <ul className="text-xs space-y-2 max-h-32 overflow-y-auto pl-4 list-disc text-emerald-700 dark:text-emerald-500">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
