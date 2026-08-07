"use client";

import React, { useState, useRef } from "react";
import { Upload, Users, Search, Download, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, Sparkles, AlertTriangle, Edit2, X, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSystemSettings } from "@/lib/firebase/settings";
import { getEvents } from "@/lib/firebase/events";
import { ALL_ASSOCIATIONS_BY_CONFERENCE } from "@/lib/constants";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/app";
import * as XLSX from "xlsx";
import { ProcessedRow, AttendeeData } from "@/types/import";

import { AttendeeDirectory } from "@/components/admin/AttendeeDirectory";
import { CustomSelect } from "@/components/shared/CustomSelect";

export default function AdminAttendeesPage() {
  const [activeTab, setActiveTab] = useState<"directory" | "import">("directory");
  const queryClient = useQueryClient();

  const { data: settings, isError: isSettingsError, error: settingsError } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getSystemSettings,
  });

  const { data: eventsList = [], isError: isEventsError, error: eventsError } = useQuery({
    queryKey: ["admin", "events"],
    queryFn: getEvents,
  });

  const { data: allAssociations = [], isError: isAssocError, error: assocError } = useQuery({
    queryKey: ["admin", "all_associations"],
    queryFn: async () => {
       const res = await getDocs(collection(db, "associations"));
       return res.docs.map(d => ({ id: d.id, ...d.data() }));
    }
  });

  const [selectedEventId, setSelectedEventId] = useState<string>("refreshing-2026");
  const [fileError, setFileError] = useState("");
  const [importing, setImporting] = useState(false);
  
  // New V3 State
  const [importSession, setImportSession] = useState<ProcessedRow[] | null>(null);
  const [importStats, setImportStats] = useState<{ processed: number, imported: number, skipped: number, rejected: number } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (settings && selectedEventId === "") {
      setSelectedEventId(settings.defaultEventId);
    }
  }, [settings, selectedEventId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError("");
    setImportResult(null);
    setImportSession(null);
    setImportStats(null);

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

        const id = getVal(['id', 'registration id', 'registration code', 'code']) || Math.random().toString(36).substring(2, 9).toUpperCase();
        const firstName = getVal(['first name', 'firstname', 'first_name']);
        const lastName = getVal(['last name', 'lastname', 'last_name']);
        const fullName = getVal(['name', 'full name', 'fullname']) || (`${firstName} ${lastName}`).trim();
        const email = getVal(['email', 'email address']);
        const phoneNumber = getVal(['phone', 'phone number', 'contact']);
        
        // Custom fields from form
        const memberStatusRaw = getVal(['member or executive', 'status', 'membership']);
        const memberStatus = memberStatusRaw.toLowerCase().includes('exec') ? 'Executive' : 'Member';
        
        const conferenceRaw = getVal(['conference']);
        const associationRaw = getVal(['association']);
        const churchRaw = getVal(['church']);
        const campusFellowshipRaw = getVal(['campus fellowship']);
        const otherSchoolRaw = getVal(['other school']);
        const expectationRaw = getVal(['expectation']);
        const hasPaidRaw = getVal(['transfer completed', 'payment', 'paid']);

        return {
          id,
          eventId: selectedEventId,
          fullName,
          email,
          phoneNumber,
          memberStatus,
          conferenceRaw,
          associationRaw,
          churchRaw,
          campusFellowshipRaw,
          otherSchoolRaw,
          expectationRaw,
          hasPaidRaw
        } as AttendeeData;
      });

      await validateBatch(attendees);

    } catch (err: any) {
      console.error(err);
      setFileError(err.message || "An error occurred during file parsing.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const validateBatch = async (payload: any[]) => {
    try {
      setImporting(true);
      const response = await fetch('/api/import/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendees: payload, eventId: selectedEventId, mode: 'dryRun' })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to process import');

      setImportSession(result.sessionRows);
      setImportStats({
        processed: result.processed,
        imported: result.imported,
        skipped: result.skipped,
        rejected: result.rejected
      });
    } catch (err: any) {
       console.error(err);
       setFileError(err.message || "Validation failed.");
    } finally {
       setImporting(false);
    }
  };

  const handleRowUpdate = (index: number, field: string, value: string) => {
    if (!importSession) return;
    const newSession = [...importSession];
    const row = newSession[index];
    row.data = { ...row.data, [field]: value };
    row.edited = true;
    setImportSession(newSession);
  };

  const handleDecision = (index: number, decision: "include" | "skip" | "force_import") => {
    if (!importSession) return;
    const newSession = [...importSession];
    newSession[index].importDecision = decision;
    setImportSession(newSession);
  };

  const handleRevalidate = async () => {
    if (!importSession) return;
    await validateBatch(importSession);
  };

  const handleConfirmImport = async () => {
    if (!importSession) return;
    setShowConfirmModal(false);
    setImporting(true);
    
    try {
      // Split into chunks of 500 for the API
      const chunkSize = 500;
      let totalImported = 0;
      let allErrors: string[] = [];

      for (let i = 0; i < importSession.length; i += chunkSize) {
        const chunk = importSession.slice(i, i + chunkSize);
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
      setImportSession(null); 
      queryClient.invalidateQueries({ queryKey: ["admin", "attendees", selectedEventId] });

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
        "Email": "sharon@example.com", 
        "Full Name": "Sharon Lawal", 
        "Phone Number": "08012345678",
        "Member OR Executive": "Member",
        "Conference": "Lagos East Baptist Conference",
        "Association": "Abundant Grace Association",
        "Church": "Grace Impact Baptist Church",
        "Campus Fellowship": "",
        "Other School": "",
        "Transfer Completed": "Yes",
        "Expectation": "A refreshing time"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendees Import");
    XLSX.writeFile(wb, "Refreshing_2026_Attendee_Import_Template.xlsx");
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-20">
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

      {(isSettingsError || isEventsError || isAssocError) && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="font-sans text-sm font-medium">
            Failed to load required data: {((settingsError || eventsError || assocError) as Error)?.message || "Permission Denied or Unknown Error"}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-black/10 dark:border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab("directory")}
          className={`font-sans font-bold text-sm px-4 py-2 rounded-xl transition-colors ${
            activeTab === "directory" ? "bg-[#C25627] text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
          }`}
        >
          Attendee Directory
        </button>
        <button 
          onClick={() => setActiveTab("import")}
          className={`font-sans font-bold text-sm px-4 py-2 rounded-xl transition-colors ${
            activeTab === "import" ? "bg-[#C25627] text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5"
          }`}
        >
          Batch Import
        </button>
      </div>

      {activeTab === "directory" ? (
        <AttendeeDirectory eventId={selectedEventId} />
      ) : (
        <div className="bg-white dark:bg-[#181612] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-sm">
          {/* Import Section */}
        <div>
          <h2 className="font-serif text-xl font-bold uppercase text-[#0B0907] dark:text-[#FCFAF6] mb-1">
            Batch Import via Excel/CSV
          </h2>
          <p className="font-sans text-sm text-black/60 dark:text-white/60">
            Upload an Excel or CSV file exported from your ticketing system (e.g., Tix.africa) to sync attendees into the database.
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
                  Processing Batch...
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

        {fileError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="font-sans text-sm font-medium">{fileError}</p>
          </div>
        )}

        {/* Import Session Review */}
        {importStats && importSession && (
          <div className="bg-zinc-50 dark:bg-black/20 border border-black/5 dark:border-white/5 p-6 rounded-3xl flex flex-col gap-6 animate-fade-in">
            <div className="flex items-start justify-between border-b border-black/10 dark:border-white/10 pb-6">
              <div>
                <h3 className="font-serif text-2xl font-bold text-[#0B0907] dark:text-[#FCFAF6]">Review Import Session</h3>
                <p className="font-sans text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {importStats.processed} Total Detected Rows
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRevalidate}
                  disabled={importing}
                  className="px-5 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Save & Re-validate
                </button>
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={importing || importStats.imported === 0}
                  className="bg-[#C25627] hover:bg-[#a1451f] text-white px-6 py-3 rounded-xl font-sans font-bold transition-colors disabled:opacity-50"
                >
                  Import {importStats.imported} Attendees
                </button>
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-center text-emerald-600">
                <p className="text-3xl font-bold font-serif">{importStats.imported}</p>
                <p className="text-[10px] uppercase font-bold mt-1 tracking-wider">Valid (Ready)</p>
              </div>
              <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 text-center text-amber-600">
                <p className="text-3xl font-bold font-serif">{importSession.filter(r => r.status === 'possible_duplicate').length}</p>
                <p className="text-[10px] uppercase font-bold mt-1 tracking-wider">Possible Dups</p>
              </div>
              <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-center text-red-600">
                <p className="text-3xl font-bold font-serif">{importSession.filter(r => r.status === 'error').length}</p>
                <p className="text-[10px] uppercase font-bold mt-1 tracking-wider">Errors</p>
              </div>
              <div className="bg-zinc-500/10 p-4 rounded-xl border border-zinc-500/20 text-center text-zinc-500">
                <p className="text-3xl font-bold font-serif">{importSession.filter(r => r.importDecision === 'skip' || r.status === 'confirmed_duplicate').length}</p>
                <p className="text-[10px] uppercase font-bold mt-1 tracking-wider">Excluded</p>
              </div>
            </div>

            {/* Error Corrections */}
            {importSession.filter(r => r.status === 'error' && r.importDecision !== 'skip').length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-red-600 uppercase text-sm tracking-wider mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Errors Require Correction
                </h4>
                <div className="flex flex-col gap-3">
                  {importSession.map((row, idx) => {
                    if (row.status !== 'error' || row.importDecision === 'skip') return null;
                    return (
                      <div key={idx} className="bg-white dark:bg-[#181612] p-4 rounded-xl border border-red-500/30 flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-mono font-bold text-zinc-500">Row {row.originalIndex + 1}</p>
                            <div className="mt-2 space-y-2">
                              {row.errors.map((e, i) => (
                                <div key={i} className="text-sm">
                                   <p className="text-red-500 font-medium">• {e.message}</p>
                                   {e.suggestedMatch && (
                                      <div className="ml-4 mt-1 flex items-center gap-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                                         <span className="text-xs text-amber-700 dark:text-amber-500">Did you mean <strong className="font-mono">{e.suggestedMatch}</strong>?</span>
                                         <button 
                                           onClick={() => handleRowUpdate(idx, e.field as string, e.suggestedMatch || '')}
                                           className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded font-bold uppercase"
                                         >
                                            Use this
                                         </button>
                                      </div>
                                   )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <button onClick={() => handleDecision(idx, 'skip')} className="text-xs text-zinc-500 hover:text-red-500 flex items-center gap-1 font-bold"><X className="h-3 w-3" /> Exclude Row</button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                          {['fullName', 'email', 'phoneNumber', 'memberStatus', 'conferenceRaw', 'associationRaw', 'churchRaw', 'campusFellowshipRaw', 'hasPaidRaw'].map((field) => {
                             const hasError = row.errors.some(e => e.field === field);
                             return (
                               <div key={field}>
                                 <label className={`block text-[10px] font-bold uppercase mb-1 ${hasError ? 'text-red-500' : 'text-zinc-500'}`}>
                                   {field.replace('Raw', '')}
                                 </label>
                                 {field === 'conferenceRaw' ? (
                                    <CustomSelect 
                                      value={row.data[field as keyof AttendeeData] || ''}
                                      onChange={(val) => handleRowUpdate(idx, field, val)}
                                      options={[
                                        { value: "Lagos East Baptist Conference", label: "Lagos East" },
                                        { value: "Lagos West Baptist Conference", label: "Lagos West" },
                                        { value: "Lagos Central Baptist Conference", label: "Lagos Central" },
                                        { value: "Campus Fellowship", label: "Campus Fellowship" },
                                        { value: "Other", label: "Other" }
                                      ]}
                                      placeholder="Select Conference"
                                      error={hasError}
                                    />
                                 ) : field === 'associationRaw' || field === 'campusFellowshipRaw' ? (
                                    (() => {
                                      const confRaw = (row.data.conferenceRaw || '').toLowerCase();
                                      let confId = null;
                                      if (confRaw.includes('east')) confId = 'lagos_east';
                                      else if (confRaw.includes('west')) confId = 'lagos_west';
                                      else if (confRaw.includes('central')) confId = 'lagos_central';
                                      else if (confRaw.includes('campus')) confId = 'campus_fellowship';
                                      
                                      const isCampusConf = confId === 'campus_fellowship';
                                      const isAssocConf = confId && confId !== 'campus_fellowship';
                                      
                                      const isActiveField = (field === 'associationRaw' && isAssocConf) || (field === 'campusFellowshipRaw' && isCampusConf);
                                      
                                      const filtered = confId ? ALL_ASSOCIATIONS_BY_CONFERENCE[confId] || [] : [];
                                      const options = filtered.map((name: string) => ({ value: name, label: name }));
                                      
                                      if (options.length === 0 && isActiveField) {
                                        return (
                                           <input 
                                             type="text" 
                                             value={row.data[field as keyof AttendeeData] || ''}
                                             onChange={(e) => handleRowUpdate(idx, field, e.target.value)}
                                             placeholder={`Enter ${field.replace('Raw', '')}`}
                                             className={`w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                                               hasError ? 'border-red-500 focus:border-red-600' : 'border-black/10 dark:border-white/10 focus:border-[#C25627]'
                                             }`}
                                           />
                                        );
                                      }
                                      
                                      return (
                                        <CustomSelect 
                                          value={row.data[field as keyof AttendeeData] || ''}
                                          onChange={(val) => handleRowUpdate(idx, field, val)}
                                          options={isActiveField ? options : []}
                                          placeholder={isActiveField ? "Select..." : "N/A for this conference"}
                                          disabled={!isActiveField}
                                          error={hasError}
                                        />
                                      );
                                    })()
                                 ) : field === 'hasPaidRaw' ? (
                                    <CustomSelect 
                                      value={row.data[field as keyof AttendeeData] || ''}
                                      onChange={(val) => handleRowUpdate(idx, field, val)}
                                      options={[
                                        { value: "Yes", label: "Yes" },
                                        { value: "No", label: "No" },
                                        { value: "Don't Know", label: "Don't Know" }
                                      ]}
                                      placeholder="Select Status"
                                      error={hasError}
                                    />
                                 ) : field === 'memberStatus' ? (
                                    <CustomSelect 
                                      value={row.data[field as keyof AttendeeData] || ''}
                                      onChange={(val) => handleRowUpdate(idx, field, val)}
                                      options={[
                                        { value: "Member", label: "Member" },
                                        { value: "Executive", label: "Executive" }
                                      ]}
                                      placeholder="Select Status"
                                      error={hasError}
                                    />
                                 ) : (
                                   <input 
                                     type="text" 
                                     value={row.data[field as keyof AttendeeData] || ''}
                                     onChange={(e) => handleRowUpdate(idx, field, e.target.value)}
                                     className={`w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none transition-colors ${
                                       hasError ? 'border-red-500 focus:border-red-600' : 'border-black/10 dark:border-white/10 focus:border-[#C25627]'
                                     }`}
                                   />
                                 )}
                                 {row.edited && row.originalData[field as keyof AttendeeData] !== row.data[field as keyof AttendeeData] && (
                                   <p className="text-[10px] text-zinc-400 mt-1 line-through">
                                     {row.originalData[field as keyof AttendeeData]}
                                   </p>
                                 )}
                               </div>
                             );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Possible Duplicates */}
            {importSession.filter(r => r.status === 'possible_duplicate' && r.importDecision !== 'skip').length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-amber-600 uppercase text-sm tracking-wider mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" /> Possible Duplicates Require Review
                </h4>
                <div className="flex flex-col gap-3">
                  {importSession.map((row, idx) => {
                    if (row.status !== 'possible_duplicate' || row.importDecision === 'skip') return null;
                    return (
                      <div key={idx} className="bg-white dark:bg-[#181612] p-4 rounded-xl border border-amber-500/30 flex items-center justify-between">
                        <div>
                           <p className="text-xs font-mono font-bold text-zinc-500 mb-1">Row {row.originalIndex + 1}</p>
                           <p className="font-bold text-sm text-[#0B0907] dark:text-[#FCFAF6]">{row.data.fullName} <span className="font-normal text-zinc-500 ml-2">{row.data.email || row.data.phoneNumber}</span></p>
                           {row.importDecision === 'force_import' && (
                             <p className="text-xs font-bold text-emerald-500 mt-2 bg-emerald-500/10 inline-block px-2 py-1 rounded-md">✓ Import Anyway selected</p>
                           )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleDecision(idx, 'force_import')} 
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                              row.importDecision === 'force_import' ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' : 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10'
                            }`}
                          >
                            Import Anyway
                          </button>
                          <button 
                            onClick={() => handleDecision(idx, 'skip')} 
                            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            Exclude
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Confirmed Duplicates (Skipped) */}
            {importSession.filter(r => r.status === 'confirmed_duplicate').length > 0 && (
              <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{importSession.filter(r => r.status === 'confirmed_duplicate').length} Exact Match Duplicates Automatically Skipped</p>
              </div>
            )}

          </div>
        )}

        {/* Final Success Message */}
        {importResult && !importSession && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-6 rounded-3xl flex flex-col gap-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <Sparkles className="h-6 w-6 shrink-0 mt-1" />
              <div className="font-sans">
                <p className="text-lg font-bold">Import Completed Successfully!</p>
                <p className="text-sm mt-1 text-emerald-700 dark:text-emerald-500">
                  Successfully imported <span className="font-bold">{importResult.success}</span> attendees into the database.
                </p>
              </div>
            </div>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-4 pt-4 border-t border-emerald-500/20">
                <p className="text-xs font-bold mb-2 uppercase tracking-wider text-emerald-700 dark:text-emerald-500">Failed to import ({importResult.errors.length}):</p>
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

      )}

      {/* Confirmation Modal */}
      {showConfirmModal && importStats && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white dark:bg-[#181612] w-full max-w-md rounded-3xl p-6 shadow-xl flex flex-col gap-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-2">Ready to import {importStats.imported} attendees</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Please review the final numbers before committing to the database.</p>
              </div>

              <div className="bg-zinc-50 dark:bg-black/20 rounded-xl p-4 flex flex-col gap-2 font-mono text-sm border border-black/5 dark:border-white/5">
                <div className="flex justify-between"><span className="text-zinc-500">Total Rows Detected</span><span className="font-bold">{importStats.processed}</span></div>
                <div className="flex justify-between"><span className="text-emerald-600">Will be Imported</span><span className="font-bold text-emerald-600">{importStats.imported}</span></div>
                <div className="flex justify-between"><span className="text-amber-600">Possible Duplicates</span><span className="font-bold text-amber-600">{importSession?.filter(r=>r.status === 'possible_duplicate').length}</span></div>
                <div className="flex justify-between"><span className="text-red-500">Errors</span><span className="font-bold text-red-500">{importStats.rejected}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Excluded/Skipped</span><span className="font-bold">{importStats.skipped}</span></div>
                <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex justify-between">
                  <span className="text-zinc-500">Duplicate Overrides:</span>
                  <span className="font-bold text-emerald-600">{importSession?.filter(r=>r.importDecision === 'force_import').length}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                 <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">Cancel</button>
                 <button onClick={handleConfirmImport} className="px-6 py-2 bg-[#C25627] hover:bg-[#a1451f] text-white rounded-xl font-bold transition-colors">
                   Import {importStats.imported} attendees
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
