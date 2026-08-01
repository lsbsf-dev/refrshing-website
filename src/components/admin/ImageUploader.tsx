/**
 * Image Uploader Component
 *  * Handles image uploads and preview in the admin portal.
 */

"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon, Trash2, Check, RefreshCw, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/app";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  isDark?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  label = "Upload Image / Photo",
  isDark = true,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Compress Image (Max 1MB, Max width 1200px)
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // 2. Upload to Firebase Storage
      // Generate a unique path: public/uploads/{timestamp}-{filename}
      const uniqueFilename = `${Date.now()}-${compressedFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const storageRef = ref(storage, `public/uploads/${uniqueFilename}`);
      
      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          alert("Image upload failed. Please try again.");
          setUploading(false);
        },
        async () => {
          // Success
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onChange(downloadURL);
          setUploading(false);
          setUploadProgress(0);
        }
      );
    } catch (error) {
      console.error("Compression/Upload error:", error);
      alert("An error occurred while processing the image.");
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    // If it's a firebase storage URL, we should ideally delete the object from storage
    // But for safety and simplicity right now, we just clear the field.
    // The backend sync or a cron job can clean up orphaned images later.
    onChange("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className={`block font-sans text-xs font-bold uppercase tracking-wider ${isDark ? "text-white/80" : "text-zinc-700"}`}>
          {label} <span className="font-mono text-[10px] font-normal text-zinc-400 lowercase">(optional)</span>
        </label>
      )}

      {value ? (
        <div className={`relative p-4 border rounded-2xl flex items-center justify-between gap-4 ${isDark ? "bg-[#1A1813] border-white/10" : "bg-zinc-50 border-zinc-200"}`}>
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/20 shrink-0 border border-white/10">
              <Image
                src={value}
                alt="Uploaded preview"
                fill
                className="object-cover object-top"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`font-sans text-xs font-semibold truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
                Image Loaded
              </span>
              <span className="font-mono text-[10px] text-emerald-500 flex items-center gap-1 mt-0.5">
                <Check className="h-3 w-3" /> Ready for display
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-zinc-200 hover:bg-zinc-300 text-zinc-800"
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Change</span>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Remove photo"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-center ${
            dragActive
              ? "border-[#C25627] bg-[#C25627]/10"
              : isDark
              ? "border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30"
              : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400"
          }`}
        >
          <div className={`p-3 rounded-2xl ${isDark ? "bg-[#C25627]/15 text-[#C25627]" : "bg-[#C25627]/10 text-[#C25627]"}`}>
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
          </div>
          <div>
            <span className={`font-sans text-xs font-bold block ${isDark ? "text-white" : "text-zinc-900"}`}>
              {uploading ? `Uploading Image... ${uploadProgress}%` : "Click or Drag Image Here"}
            </span>
            <span className="font-sans text-[11px] text-zinc-400 font-light mt-0.5 block">
              Supports PNG, JPG, WEBP files
            </span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
        className="hidden"
      />
    </div>
  );
}
