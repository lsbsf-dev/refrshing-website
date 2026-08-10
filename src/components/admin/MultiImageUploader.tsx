"use client";

import React, { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import imageCompression from "browser-image-compression";

interface MultiImageUploaderProps {
  onUploadSuccess: (urls: string[]) => void;
  isDark?: boolean;
}

interface FileProgress {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export function MultiImageUploader({
  onUploadSuccess,
  isDark = true,
}: MultiImageUploaderProps) {
  const [filesState, setFilesState] = useState<FileProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const newFiles = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'pending' as const,
      }));

    if (newFiles.length === 0) return;

    setFilesState((prev) => [...prev, ...newFiles]);

    const uploadedUrls: string[] = [];

    // Process sequentially to avoid overwhelming browser/network
    for (const fileObj of newFiles) {
      await uploadFile(fileObj.id, fileObj.file, (url) => {
        uploadedUrls.push(url);
      });
    }

    if (uploadedUrls.length > 0) {
      onUploadSuccess(uploadedUrls);
    }
  };

  const uploadFile = async (id: string, file: File, onSuccess: (url: string) => void) => {
    setFilesState((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'uploading' } : f))
    );

    try {
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true };
      const compressedFile = await imageCompression(file, options);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_PRESET;

      if (!cloudName || !uploadPreset) throw new Error("Missing Cloudinary Config");

      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", uploadPreset);

      return new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setFilesState((prev) =>
              prev.map((f) => (f.id === id ? { ...f, progress } : f))
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            setFilesState((prev) =>
              prev.map((f) => (f.id === id ? { ...f, status: 'success', url: data.secure_url, progress: 100 } : f))
            );
            onSuccess(data.secure_url);
          } else {
            setFilesState((prev) =>
              prev.map((f) => (f.id === id ? { ...f, status: 'error', error: "Upload failed" } : f))
            );
          }
          resolve();
        };

        xhr.onerror = () => {
          setFilesState((prev) =>
            prev.map((f) => (f.id === id ? { ...f, status: 'error', error: "Network error" } : f))
          );
          resolve();
        };

        xhr.send(formData);
      });
    } catch (error) {
      setFilesState((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'error', error: "Compression error" } : f))
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-center ${
          dragActive
            ? "border-[#C25627] bg-[#C25627]/10"
            : isDark
            ? "border-white/15 bg-white/5 hover:bg-white/10"
            : "border-zinc-300 bg-zinc-50 hover:bg-zinc-100"
        }`}
      >
        <div className={`p-3 rounded-2xl ${isDark ? "bg-[#C25627]/15 text-[#C25627]" : "bg-[#C25627]/10 text-[#C25627]"}`}>
          <Upload className="h-6 w-6" />
        </div>
        <div>
          <span className={`font-sans text-sm font-bold block ${isDark ? "text-white" : "text-zinc-900"}`}>
            Click or Drag Multiple Images Here
          </span>
          <span className="font-sans text-xs text-zinc-400 font-light mt-1 block">
            Supports PNG, JPG, WEBP
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(e.target.files);
          }
        }}
        className="hidden"
      />

      {filesState.length > 0 && (
        <div className="flex flex-col gap-2 mt-2 max-h-64 overflow-y-auto custom-scrollbar">
          {filesState.map((f) => (
            <div
              key={f.id}
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isDark ? "bg-[#1A1813] border-white/10" : "bg-white border-black/10"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {f.status === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : f.status === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                ) : (
                  <Loader2 className="h-5 w-5 text-[#C25627] animate-spin shrink-0" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-semibold truncate ${isDark ? "text-white" : "text-black"}`}>
                    {f.file.name}
                  </span>
                  {f.status === 'uploading' && (
                    <span className="text-[10px] text-zinc-400">Uploading... {f.progress}%</span>
                  )}
                  {f.status === 'error' && (
                    <span className="text-[10px] text-red-500">{f.error}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
